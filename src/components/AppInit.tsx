
'use client';
import { useEffect, useRef } from 'react';
// Removed 'messaging' from import as it's handled by async functions now
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
  const fcmSetupDoneForUserRef = useRef<string | null>(null);
  const unsubscribeOnMessageRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleIncomingMessage = async (payload: any) => {
      console.log('Foreground message received in handleIncomingMessage:', payload);
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

        // For toast, prioritize data payload keys for translation
        toastTitle = payload.data.titleKey ? t(payload.data.titleKey, fStoreDescriptionPlaceholders) : (payload.notification?.title || t(fStoreTitleKey));
        toastDescription = payload.data.descriptionKey ? t(payload.data.descriptionKey, fStoreDescriptionPlaceholders) : (payload.notification?.body || t(fStoreDescriptionKey));

      } else if (payload?.notification) {
        // If no data payload, use notification fields directly for toast
        toastTitle = payload.notification.title || t(fStoreTitleKey);
        toastDescription = payload.notification.body || t(fStoreDescriptionKey);
        
        // For Firestore, if no data payload, use notification fields for keys as well
        fStoreTitleKey = payload.notification.title || fStoreTitleKey;
        fStoreDescriptionKey = payload.notification.body || fStoreDescriptionKey;
        fStoreImageUrl = payload.notification.image || null;
        // Other fStore fields remain default if not in notification payload
      } else {
        // Fallback if neither data nor notification payload is useful
        toastTitle = t(fStoreTitleKey);
        toastDescription = t(fStoreDescriptionKey);
      }
      
      console.log('Attempting to show toast with Title:', toastTitle, 'Description:', toastDescription);
      toast({
        title: toastTitle,
        description: toastDescription,
      });

      if (!currentUserId) {
        console.warn("User not available, cannot save foreground notification to Firestore.");
        return;
      }

      if (payload) { // Check if payload itself is not null/undefined
        console.log('Foreground message payload for saving:', payload);
        
        const notificationToSave: Omit<NotificationItem, 'id'> = {
          titleKey: fStoreTitleKey, // Use potentially overridden keys
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
              console.log("Foreground user-specific notification saved to Firestore for user:", currentUserId);
          } else {
              console.log("Global notification received in foreground, not saving to user's subcollection from client.");
          }
        } catch (error) {
          console.error("Error saving foreground notification to Firestore:", error);
        }
      }
    };

    const setupFcmLogic = async () => {
      if (!user || !user.uid) {
        fcmSetupDoneForUserRef.current = null; 
        if (unsubscribeOnMessageRef.current) {
          console.log('AppInit: Cleaning up foreground message listener due to user logout/change.');
          unsubscribeOnMessageRef.current();
          unsubscribeOnMessageRef.current = null;
        }
        return;
      }

      if (fcmSetupDoneForUserRef.current !== user.uid) {
        console.log('AppInit: Performing FCM token setup for user:', user.uid);
        if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
          try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              console.log('AppInit: Notification permission granted.');
              const fcmToken = await requestForToken(); // requestForToken is now async

              if (fcmToken && user.uid) {
                try {
                  const userDocRef = doc(db, "users", user.uid);
                  await updateDoc(userDocRef, {
                    fcmToken: fcmToken, // Changed from arrayUnion to direct assignment
                    lastTokenUpdate: serverTimestamp()
                  });
                  console.log('AppInit: FCM token synced with Firestore for user:', user.uid);
                  fcmSetupDoneForUserRef.current = user.uid; 
                } catch (error) {
                  console.error('AppInit: Error saving FCM token to Firestore:', error);
                }
              } else {
                console.log('AppInit: FCM Token not received or user.uid missing.');
              }
            } else {
              console.log('AppInit: Notification permission denied.');
            }
          } catch (error) {
            console.error('AppInit: Error during FCM token setup phase:', error);
          }
        } else {
          console.log('AppInit: Environment does not support notifications.');
        }
      } else {
        console.log('AppInit: FCM token setup already done for user:', user.uid);
      }

      if (!unsubscribeOnMessageRef.current) { 
         console.log('AppInit: Attempting to set up foreground message listener for user:', user.uid);
         try {
           const unsubscribe = await setupOnMessageListener(handleIncomingMessage); // setupOnMessageListener is now async
           if (unsubscribe) {
             unsubscribeOnMessageRef.current = unsubscribe;
             console.log('AppInit: Foreground message listener set up successfully.');
           } else {
             console.error("AppInit: Failed to set up onMessage listener (returned null).");
           }
         } catch (error) {
            console.error("AppInit: Error during setupOnMessageListener call:", error);
         }
      } else {
        console.log('AppInit: Foreground message listener already seems to be set up.');
      }
    };

    setupFcmLogic();

    return () => {
      if (unsubscribeOnMessageRef.current) {
        console.log('AppInit: Cleaning up foreground message listener on component unmount or user change.');
        unsubscribeOnMessageRef.current();
        unsubscribeOnMessageRef.current = null;
      }
    };
  }, [user, t, toast]); 

  return null;
}
