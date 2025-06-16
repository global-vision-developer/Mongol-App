
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
      if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && user) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('Notification permission granted.');
            const fcmToken = await requestForToken();

            if (fcmToken) {
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
              .then(async (payload: any) => { // Made async to await Firestore write
                if (payload && payload.data) { // Prefer data payload for consistency
                  console.log('Foreground message payload:', payload);
                  
                  // Prepare notification item for Firestore
                  const notificationToSave: Omit<NotificationItem, 'id'> = {
                    // Use keys from payload.data if available, otherwise fallback or use defaults
                    titleKey: payload.data.titleKey || payload.notification?.title || 'New Notification',
                    descriptionKey: payload.data.descriptionKey || payload.notification?.body || 'You have a new message.',
                    descriptionPlaceholders: payload.data.descriptionPlaceholders ? JSON.parse(payload.data.descriptionPlaceholders) : {}, // Assuming placeholders are JSON string
                    date: serverTimestamp(),
                    read: false, // New notifications are unread
                    imageUrl: payload.data.imageUrl || payload.notification?.image,
                    dataAiHint: payload.data.dataAiHint,
                    link: payload.data.link,
                    itemType: (payload.data.itemType as ItemType) || 'general', // Default itemType
                    isGlobal: payload.data.isGlobal === 'true' || false,
                  };

                  try {
                    await addDoc(collection(db, "users", user.uid, "notifications"), notificationToSave);
                    console.log("Foreground notification saved to Firestore for user:", user.uid);
                  } catch (error) {
                    console.error("Error saving foreground notification to Firestore:", error);
                  }

                  // Show toast using notification part for display consistency
                  toast({
                    title: payload.notification?.title || payload.data?.titleKey || 'Notification',
                    description: payload.notification?.body || payload.data?.descriptionKey,
                  });
                } else if (payload && payload.notification) { // Fallback for simple notifications
                    console.log('Foreground message payload (notification only):', payload);
                    const notificationToSave: Omit<NotificationItem, 'id'> = {
                        titleKey: payload.notification.title || 'New Notification',
                        descriptionKey: payload.notification.body || 'You have a new message.',
                        date: serverTimestamp(),
                        read: false,
                        imageUrl: payload.notification.image,
                        itemType: 'general',
                        isGlobal: false,
                    };
                    try {
                        await addDoc(collection(db, "users", user.uid, "notifications"), notificationToSave);
                        console.log("Foreground notification (simple) saved to Firestore for user:", user.uid);
                    } catch (error) {
                        console.error("Error saving foreground notification (simple) to Firestore:", error);
                    }
                     toast({
                        title: payload.notification.title,
                        description: payload.notification.body,
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
