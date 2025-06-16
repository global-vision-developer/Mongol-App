
'use client';
import { useEffect } from 'react';
import { requestForToken, onMessageListener } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, arrayUnion, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { NotificationItem, ItemType } from '@/types';
import { useTranslation } from '@/hooks/useTranslation'; // For translating toast messages

export default function AppInit() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation(); // Import useTranslation

  useEffect(() => {
    const setupNotifications = async () => {
      if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && user?.uid) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('Notification permission granted.');
            const fcmToken = await requestForToken();

            if (fcmToken && user?.uid) {
              try {
                const userDocRef = doc(db, "users", user.uid);
                await updateDoc(userDocRef, {
                  fcmTokens: arrayUnion(fcmToken),
                  lastTokenUpdate: serverTimestamp()
                });
                console.log('FCM token saved to Firestore for user:', user.uid);
              } catch (error) {
                console.error('Error saving FCM token to Firestore:', error);
              }
            }

            onMessageListener()
              .then(async (payload: any) => {
                if (!user?.uid) {
                  console.warn("User not available, cannot save foreground notification to Firestore.");
                  if (payload?.notification) {
                     toast({
                        title: t(payload.notification.titleKey || payload.notification.title || 'unknownNotificationTitle'),
                        description: t(payload.notification.descriptionKey || payload.notification.body || 'unknownNotificationDescription'),
                      });
                  }
                  return;
                }

                if (payload && (payload.data || payload.notification)) {
                  console.log('Foreground message payload:', payload);
                  
                  // Prepare data for Firestore, using payload.data first, then payload.notification
                  const titleKey = payload.data?.titleKey || payload.notification?.title || 'unknownNotificationTitle';
                  const descriptionKey = payload.data?.descriptionKey || payload.notification?.body || 'unknownNotificationDescription';
                  const descriptionPlaceholdersStr = payload.data?.descriptionPlaceholders;
                  let descriptionPlaceholders = {};
                  if (descriptionPlaceholdersStr && typeof descriptionPlaceholdersStr === 'string') {
                    try {
                      descriptionPlaceholders = JSON.parse(descriptionPlaceholdersStr);
                    } catch (e) {
                      console.error("Error parsing descriptionPlaceholders:", e);
                    }
                  } else if (descriptionPlaceholdersStr && typeof descriptionPlaceholdersStr === 'object') {
                    descriptionPlaceholders = descriptionPlaceholdersStr;
                  }
                  
                  const notificationToSave: Omit<NotificationItem, 'id'> = {
                    titleKey: titleKey,
                    descriptionKey: descriptionKey,
                    descriptionPlaceholders: descriptionPlaceholders,
                    date: serverTimestamp(),
                    read: false, 
                    imageUrl: payload.data?.imageUrl || payload.notification?.image || null,
                    dataAiHint: payload.data?.dataAiHint || null,
                    link: payload.data?.link || payload.data?.url || null,
                    itemType: (payload.data?.itemType as ItemType) || 'general', 
                    isGlobal: payload.data?.isGlobal === 'true' || payload.data?.isGlobal === true || false,
                  };

                  console.log("Attempting to save notification to Firestore:", JSON.stringify(notificationToSave, null, 2));

                  try {
                    if (!notificationToSave.isGlobal) {
                        await addDoc(collection(db, "users", user.uid, "notifications"), notificationToSave);
                        console.log("Foreground user-specific notification saved to Firestore for user:", user.uid);
                    } else {
                        console.log("Global notification received in foreground, not saving to user's subcollection from client.");
                    }
                  } catch (error) {
                    console.error("Error saving foreground notification to Firestore:", error);
                  }

                  // Display translated toast
                  toast({
                    title: t(titleKey, descriptionPlaceholders),
                    description: t(descriptionKey, descriptionPlaceholders),
                    // TODO: Add action if link exists, e.g., navigate to link
                  });
                }
              })
              .catch(err => console.error('Failed to listen for foreground messages:', err));
          } else {
            console.log('Notification permission denied.');
          }
        } catch (error) {
          console.error('Error setting up notifications:', error);
        }
      }
    };

    if (user) { // Only setup if user is logged in
        setupNotifications();
    }

  }, [user, toast, t]); // Added t to dependency array

  return null;
}
