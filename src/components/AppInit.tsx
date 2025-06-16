
'use client';
import { useEffect } from 'react';
import { requestForToken, onMessageListener } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, arrayUnion, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { NotificationItem, ItemType } from '@/types';

export default function AppInit() {
  const { toast } = useToast();
  const { user } = useAuth();

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
                        title: payload.notification.title || 'Notification',
                        description: payload.notification.body || 'You received a new message.',
                      });
                  }
                  return;
                }

                if (payload && (payload.data || payload.notification)) {
                  console.log('Foreground message payload:', payload);
                  
                  const notificationToSave: Omit<NotificationItem, 'id'> = {
                    titleKey: payload.data?.titleKey || payload.notification?.title || 'New Notification',
                    descriptionKey: payload.data?.descriptionKey || payload.notification?.body || 'You have a new message.',
                    descriptionPlaceholders: payload.data?.descriptionPlaceholders 
                      ? (typeof payload.data.descriptionPlaceholders === 'string' ? JSON.parse(payload.data.descriptionPlaceholders) : payload.data.descriptionPlaceholders) 
                      : {},
                    date: serverTimestamp(),
                    read: false, 
                    imageUrl: payload.data?.imageUrl || payload.notification?.image,
                    dataAiHint: payload.data?.dataAiHint,
                    link: payload.data?.link || payload.data?.url,
                    itemType: (payload.data?.itemType as ItemType) || 'general', 
                    isGlobal: payload.data?.isGlobal === 'true' || payload.data?.isGlobal === true || false,
                  };

                  console.log("Attempting to save notification to Firestore:", JSON.stringify(notificationToSave, null, 2));

                  try {
                    // Only save non-global notifications to user's subcollection
                    if (!notificationToSave.isGlobal) {
                        await addDoc(collection(db, "users", user.uid, "notifications"), notificationToSave);
                        console.log("Foreground user-specific notification saved to Firestore for user:", user.uid);
                    } else {
                        // Optionally, handle global notifications received in foreground differently if needed
                        // e.g. add to a global 'notifications' collection, though this is usually done by server
                        console.log("Global notification received in foreground, not saving to user's subcollection from client.");
                    }
                  } catch (error) {
                    console.error("Error saving foreground notification to Firestore:", error);
                  }

                  toast({
                    title: notificationToSave.titleKey,
                    description: notificationToSave.descriptionKey,
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

    if (user) {
        setupNotifications();
    }

  }, [user, toast]);

  return null;
}
