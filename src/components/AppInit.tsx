
'use client';
import { useEffect, useRef } from 'react';
import { requestForToken, setupOnMessageListener, auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import type { NotificationItem, ItemType } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

// Энэ компонент нь апп ачаалахад нэг удаа ажиллах чухал тохиргоог хийдэг.
// Гол үүрэг нь Firebase Cloud Messaging (FCM) буюу Push Notification-ийг эхлүүлэх юм.
export default function AppInit() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Энэ ref нь тухайн хэрэглэгчийн session-д FCM тохиргоог нэг л удаа хийсэн эсэхийг хянах зорилготой.
  // Ингэснээр хуудас солигдох бүрд дахин дахин ажиллахаас сэргийлнэ.
  const setupCompletedForUser = useRef<string | null>(null);

  useEffect(() => {
    // Апп нээлттэй байх үед (foreground) notification ирэхэд энэ функц ажиллана.
    const handleIncomingMessage = async (payload: any) => {
      const currentUserId = auth.currentUser?.uid;

      // Notification-оос мэдээллийг задлах
      let toastTitle: string;
      let toastDescription: string;
      let fStoreTitleKey: string = 'unknownNotificationTitle';
      let fStoreDescriptionKey: string = 'unknownNotificationDescription';
      let fStoreDescriptionPlaceholders: Record<string, string | number | null | undefined> = {};
      let fStoreImageUrl: string | null = null;
      let fStoreDataAiHint: string | null = null;
      let fStoreLink: string | null = null;
      let fStoreItemType: ItemType = 'general';
      let fStoreIsGlobal: boolean = false;

      if (payload?.data) {
        fStoreTitleKey = payload.data.titleKey || fStoreTitleKey;
        fStoreDescriptionKey = payload.data.descriptionKey || fStoreDescriptionKey;
        if (payload.data.descriptionPlaceholders) {
          try {
            fStoreDescriptionPlaceholders = typeof payload.data.descriptionPlaceholders === 'string'
              ? JSON.parse(payload.data.descriptionPlaceholders)
              : payload.data.descriptionPlaceholders;
          } catch (e) { console.error("Error parsing descriptionPlaceholders:", e); fStoreDescriptionPlaceholders = {}; }
        }
        fStoreImageUrl = payload.data.imageUrl || null;
        fStoreDataAiHint = payload.data.dataAiHint || null;
        fStoreLink = payload.data.link || payload.data.url || null;
        fStoreItemType = (payload.data.itemType as ItemType) || 'general';
        fStoreIsGlobal = payload.data.isGlobal === 'true' || payload.data.isGlobal === true || false;

        toastTitle = payload.data.titleKey ? t(payload.data.titleKey, fStoreDescriptionPlaceholders) : (payload.notification?.title || t(fStoreTitleKey));
        toastDescription = payload.data.descriptionKey ? t(payload.data.descriptionKey, fStoreDescriptionPlaceholders) : (payload.notification?.body || t(fStoreDescriptionKey));
      } else if (payload?.notification) {
        toastTitle = payload.notification.title || t(fStoreTitleKey);
        toastDescription = payload.notification.body || t(fStoreDescriptionKey);
        fStoreTitleKey = payload.notification.title || fStoreTitleKey;
        fStoreDescriptionKey = payload.notification.body || fStoreDescriptionKey;
        fStoreImageUrl = payload.notification.image || null;
      } else {
        toastTitle = t(fStoreTitleKey);
        toastDescription = t(fStoreDescriptionKey);
      }

      // Хэрэглэгчид toast мэдэгдэл харуулах
      toast({
        title: toastTitle,
        description: toastDescription,
      });

      // Нэвтэрсэн хэрэглэгчийн мэдэгдлийг Firestore-д хадгалах
      if (!currentUserId) return;

      if (payload) {
        const notificationToSave: Omit<NotificationItem, 'id'> = {
          titleKey: fStoreTitleKey,
          descriptionKey: fStoreDescriptionKey,
          descriptionPlaceholders: fStoreDescriptionPlaceholders,
          date: serverTimestamp(),
          read: false,
          imageUrl: fStoreImageUrl,
          dataAiHint: fStoreDataAiHint,
          link: fStoreLink,
          itemType: fStoreItemType,
          isGlobal: fStoreIsGlobal,
        };
        try {
          if (!notificationToSave.isGlobal) {
            await addDoc(collection(db, "users", currentUserId, "notifications"), notificationToSave);
          }
        } catch (error) {
          console.error("Error saving foreground notification to Firestore:", error);
        }
      }
    };

    // FCM-ийг эхлүүлэх үндсэн логик
    const initializeFcm = async () => {
      // Хэрэглэгч нэвтрээгүй эсвэл тохиргоо хийгдсэн бол дахин ажиллуулахгүй
      if (!user || setupCompletedForUser.current === user.uid) {
        return;
      }
      // Тохиргоог хийж эхэлсэн гэж тэмдэглэх
      setupCompletedForUser.current = user.uid;
      console.log(`AppInit: Running one-time FCM setup for user ${user.uid}.`);

      try {
        // Notification-ийн зөвшөөрөл асуух
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // FCM token авах
          const fcmToken = await requestForToken();
          
          // Хэрэв шинэ token авсан эсвэл token өөрчлөгдсөн бол Firestore-д хадгалах
          if (fcmToken && fcmToken !== user.fcmToken) {
            console.log("AppInit: New FCM token found, updating Firestore.");
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
              fcmToken: fcmToken,
              lastTokenUpdate: serverTimestamp()
            });
          }
        }
      } catch (error) {
        console.error("AppInit: Error during FCM initialization:", error);
      }
    };

    initializeFcm();

    // Foreground listener-г тохируулах, энэ нь unsubscribe функц буцаана.
    let unsubscribe: (() => void) | null = null;
    const setupListener = async () => {
        if(user) { // Зөвхөн нэвтэрсэн хэрэглэгчид listener-г тохируулах
            unsubscribe = await setupOnMessageListener(handleIncomingMessage);
        }
    };
    setupListener();

    // useEffect-ийн цэвэрлэх функц
    return () => {
      if (unsubscribe) {
        console.log("AppInit: Cleaning up foreground message listener.");
        unsubscribe();
      }
      // Хэрэглэгч гарахад (user object null болоход) ref-г цэвэрлэх.
      // Ингэснээр дараагийн хэрэглэгч нэвтрэхэд тохиргоо дахин хийгдэх боломжтой болно.
      if (!user) {
        setupCompletedForUser.current = null;
      }
    };
  }, [user, t, toast]); // Dependency array-г зөв тохируулсан.

  // Энэ компонент нь UI рендер хийхгүй.
  return null;
}
