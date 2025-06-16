// lib/firebase.ts
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getFirestore, type Firestore } from "firebase/firestore";
import {
  getMessaging,
  getToken,
  onMessage,
  type Messaging
} from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyASai6a1N3BVpG8n6CMzssFQbxdzzRhdPc",
  authDomain: "setgelzuin-app.firebaseapp.com",
  projectId: "setgelzuin-app",
  storageBucket: "setgelzuin-app.firebasestorage.app",
  messagingSenderId: "397784045864",
  appId: "1:397784045864:web:dd035abe90938e4725581d",
  measurementId: "G-GNT80QXXF4"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Optional: Analytics
let analytics: Analytics | undefined;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Messaging
let messagingInstance: Messaging | null = null;
if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
  try {
    messagingInstance = getMessaging(app);
  } catch (err) {
    console.error('Failed to initialize Firebase Messaging:', err);
  }
}

// ✅ FCM Token авах функц
export const requestForToken = async (): Promise<string | null> => {
  if (!messagingInstance) {
    console.warn('Firebase Messaging is not initialized.');
    return null;
  }

  try {
    const currentToken = await getToken(messagingInstance, {
      vapidKey: 'BPh_e7gDyj1T6gZ_hY7xL7KjO8xZpW_g9pYtN3jR2cM8wQn3oQ8c3bJ1wLzD9mQ6sP7kYjJ5aBwX3yU' // Replace with your actual VAPID key from Firebase console
    });

    if (currentToken) {
      console.log('✅ FCM Token:', currentToken);
      // Та энд токеныг сервер лүү илгээж хадгалж болно
      // Example: sendTokenToServer(currentToken);
      return currentToken;
    } else {
      console.warn('🚫 Токен авах боломжгүй байна. Permission асуух хэрэгтэй.');
      return null;
    }
  } catch (err) {
    console.error('❌ FCM токен авахад алдаа гарлаа:', err);
    return null;
  }
};

// ✅ Foreground Notification хүлээн авах
export const onMessageListener = (): Promise<any> =>
  new Promise((resolve) => {
    if (!messagingInstance) {
      console.warn('Firebase Messaging is not initialized. Cannot listen for messages.');
      return resolve(null); // Resolve with null or handle appropriately
    }
    onMessage(messagingInstance, (payload) => {
      console.log('📩 Foreground message received:', payload);
      resolve(payload);
    });
  });

export { app, auth, db, analytics, messagingInstance as messaging };
