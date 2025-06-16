'use client';
import { useEffect } from 'react';
import { requestForToken, onMessageListener } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast'; // Using toast for notifications
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';


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
              // Save FCM token to user's Firestore document
              try {
                const userDocRef = doc(db, "users", user.uid);
                await updateDoc(userDocRef, {
                  fcmTokens: arrayUnion(fcmToken), // Add new token, avoid duplicates if logic added
                  lastTokenUpdate: serverTimestamp()
                });
                console.log('FCM token saved to Firestore for user:', user.uid);
              } catch (error) {
                console.error('Error saving FCM token to Firestore:', error);
              }
            }

            onMessageListener()
              .then((payload: any) => {
                if (payload && payload.notification) {
                  console.log('Foreground message payload:', payload);
                  toast({
                    title: payload.notification.title,
                    description: payload.notification.body,
                    // Add action or link if payload contains it
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

    if (user) { // Only setup notifications if user is logged in
        setupNotifications();
    }

  }, [user, toast]); // Rerun when user changes

  return null; // This component does not render anything
}
