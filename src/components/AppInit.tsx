
'use client';
import { useEffect, useRef } from 'react';
import { requestForToken, setupOnMessageListener, auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import type { NotificationItem, ItemType } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

export default function AppInit() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  // This ref tracks if the setup has been performed for the current user's session
  const setupCompletedForUser = useRef<string | null>(null);

  useEffect(() => {
    // This function will be called by the message listener
    const handleIncomingMessage = async (payload: any) => {
      const currentUserId = auth.currentUser?.uid;

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

      toast({
        title: toastTitle,
        description: toastDescription,
      });

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

    // Main logic for FCM setup
    const initializeFcm = async () => {
      // Exit if no user or if setup has already been completed for this user in this session
      if (!user || setupCompletedForUser.current === user.uid) {
        return;
      }
      // Mark setup as in-progress for this user to prevent re-runs
      setupCompletedForUser.current = user.uid;
      console.log(`AppInit: Running one-time FCM setup for user ${user.uid}.`);

      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const fcmToken = await requestForToken();
          
          // CRITICAL FIX: Only update Firestore if the token is new or has changed.
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

    // Setup foreground listener, it returns an unsubscribe function.
    let unsubscribe: (() => void) | null = null;
    const setupListener = async () => {
        if(user) { // Only set up listener if user is logged in
            unsubscribe = await setupOnMessageListener(handleIncomingMessage);
        }
    };
    setupListener();

    // Cleanup function for the useEffect hook
    return () => {
      if (unsubscribe) {
        console.log("AppInit: Cleaning up foreground message listener.");
        unsubscribe();
      }
      // When the user logs out (user object becomes null), we reset the ref
      // so that the setup can run again for the next user who logs in.
      if (!user) {
        setupCompletedForUser.current = null;
      }
    };
  }, [user, t, toast]); // Dependency array is correct.

  return null;
}
