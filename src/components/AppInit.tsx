
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
      if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && user?.uid) { // Ensure user and user.uid exists
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('Notification permission granted.');
            const fcmToken = await requestForToken();

            if (fcmToken && user?.uid) { // Ensure user.uid for Firestore path
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
                if (!user?.uid) { // Double check user before saving notification
                  console.warn("User not available, cannot save foreground notification to Firestore.");
                  if (payload?.notification) { // Still show toast if possible
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
                    await addDoc(collection(db, "users", user.uid, "notifications"), notificationToSave);
                    console.log("Foreground notification saved to Firestore for user:", user.uid);
                  } catch (error) {
                    console.error("Error saving foreground notification to Firestore:", error);
                  }

                  toast({
                    title: notificationToSave.titleKey, // Use the determined title for toast
                    description: notificationToSave.descriptionKey, // Use the determined body
                    // Potentially add action to navigate to the link if `notificationToSave.link` exists
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

    if (user) { // Only setup if user object exists
        setupNotifications();
    }

  }, [user, toast]); // Add user to dependency array

  return null;
}
