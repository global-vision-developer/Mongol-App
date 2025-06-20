
'use client';
import { useEffect, useRef } from 'react';
import { requestForToken, setupOnMessageListener, auth, db, messaging } from '@/lib/firebase'; // Added messaging
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore'; // Removed arrayUnion
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

      let titleKey = 'unknownNotificationTitle';
      let descriptionKey = 'unknownNotificationDescription';
      let descriptionPlaceholders = {};
      let imageUrl = null;
      let dataAiHint = null;
      let link = null;
      let itemType: ItemType = 'general';
      let isGlobal = false;

      if (payload?.data) {
        titleKey = payload.data.titleKey || titleKey;
        descriptionKey = payload.data.descriptionKey || descriptionKey;
        if (payload.data.descriptionPlaceholders) {
          try {
            descriptionPlaceholders = typeof payload.data.descriptionPlaceholders === 'string'
              ? JSON.parse(payload.data.descriptionPlaceholders)
              : payload.data.descriptionPlaceholders;
          } catch (e) {
            console.error("Error parsing descriptionPlaceholders from data:", e);
          }
        }
        imageUrl = payload.data.imageUrl || imageUrl;
        dataAiHint = payload.data.dataAiHint || dataAiHint;
        link = payload.data.link || payload.data.url || link;
        itemType = (payload.data.itemType as ItemType) || itemType;
        isGlobal = payload.data.isGlobal === 'true' || payload.data.isGlobal === true || isGlobal;
      }
      
      if(payload?.notification){
        titleKey = payload.notification.title || titleKey;
        descriptionKey = payload.notification.body || descriptionKey;
        imageUrl = payload.notification.image || imageUrl;
        // Notification payload doesn't typically carry descriptionPlaceholders, dataAiHint, link, itemType, isGlobal
      }
      
      console.log('Attempting to show toast with titleKey:', titleKey, 'descriptionKey:', descriptionKey);
      toast({
        title: t(titleKey, descriptionPlaceholders),
        description: t(descriptionKey, descriptionPlaceholders),
      });

      if (!currentUserId) {
        console.warn("User not available, cannot save foreground notification to Firestore.");
        return;
      }

      if (payload && (payload.data || payload.notification)) {
        console.log('Foreground message payload for saving:', payload);
        
        const notificationToSave: Omit<NotificationItem, 'id'> = {
          titleKey: titleKey,
          descriptionKey: descriptionKey,
          descriptionPlaceholders: descriptionPlaceholders,
          date: serverTimestamp(),
          read: false, 
          imageUrl: imageUrl,
          dataAiHint: dataAiHint,
          link: link,
          itemType: itemType, 
          isGlobal: isGlobal,
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
          console.log('Cleaning up foreground message listener due to user logout/change.');
          unsubscribeOnMessageRef.current();
          unsubscribeOnMessageRef.current = null;
        }
        return;
      }

      if (fcmSetupDoneForUserRef.current !== user.uid) {
        console.log('Performing FCM token setup for user:', user.uid);
        if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && messaging) {
          try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              console.log('Notification permission granted.');
              const fcmToken = await requestForToken();

              if (fcmToken && user.uid) {
                try {
                  const userDocRef = doc(db, "users", user.uid);
                  await updateDoc(userDocRef, {
                    fcmToken: fcmToken,
                    lastTokenUpdate: serverTimestamp()
                  });
                  console.log('FCM token synced with Firestore for user:', user.uid);
                  fcmSetupDoneForUserRef.current = user.uid; 
                } catch (error) {
                  console.error('Error saving FCM token to Firestore:', error);
                }
              }
            } else {
              console.log('Notification permission denied.');
            }
          } catch (error) {
            console.error('Error during FCM token setup phase:', error);
          }
        } else {
          console.log('Environment does not support notifications or messaging not initialized (during token setup).');
        }
      } else {
        console.log('FCM token setup already done for user:', user.uid);
      }

      if (!unsubscribeOnMessageRef.current) { 
         console.log('Attempting to set up foreground message listener for user:', user.uid);
         unsubscribeOnMessageRef.current = setupOnMessageListener(handleIncomingMessage);
         if (!unsubscribeOnMessageRef.current) {
           console.error("Failed to set up onMessage listener, setupOnMessageListener might have returned null (messagingInstance possibly not ready in firebase.ts).");
         } else {
           console.log('Foreground message listener set up successfully.');
         }
      } else {
        console.log('Foreground message listener already seems to be set up.');
      }
    };

    setupFcmLogic();

    return () => {
      if (unsubscribeOnMessageRef.current) {
        console.log('Cleaning up foreground message listener on component unmount or user change.');
        unsubscribeOnMessageRef.current();
        unsubscribeOnMessageRef.current = null;
      }
    };
  }, [user, t, toast]); 

  return null;
}
