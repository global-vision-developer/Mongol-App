
// lib/firebase.ts
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getAnalytics, isSupported as isAnalyticsSupported, type Analytics } from 'firebase/analytics';
import { getFirestore, type Firestore } from "firebase/firestore";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported as isMessagingSupported,
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
console.log("Firebase App initialized");

// Initialize services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
console.log("Auth and Firestore initialized");

// Optional: Analytics
let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("Firebase Analytics initialized");
    } else {
      console.log("Firebase Analytics not supported on this browser.");
    }
  }).catch(err => {
    console.error("Error checking Analytics support or initializing Analytics:", err);
  });
} else {
  console.log("Not in a browser environment, Firebase Analytics not initialized.");
}

// Messaging
let messagingInstance: Messaging | null = null;
if (typeof window !== 'undefined') {
  isMessagingSupported().then(supported => {
    if (supported) {
      try {
        console.log("Attempting to initialize Firebase Messaging SDK...");
        messagingInstance = getMessaging(app);
        console.log("Firebase Messaging SDK initialized successfully.");
      } catch (err) {
        console.error('Failed to initialize Firebase Messaging SDK:', err);
        messagingInstance = null; // Ensure it's null on error
      }
    } else {
      console.log("Firebase Messaging is not supported by isMessagingSupported().");
      messagingInstance = null;
    }
  }).catch(err => {
    console.error("Error checking Messaging support or initializing Messaging:", err);
    messagingInstance = null; // Ensure it's null on error
  });
} else {
  console.log("Not in a browser environment, Firebase Messaging not initialized.");
}


// ✅ FCM Token авах функц
export const requestForToken = async (): Promise<string | null> => {
  if (!messagingInstance) {
    console.warn('Firebase Messaging instance is not available. Cannot request token.');
    return null;
  }

  const vapidKeyFromServer = "BNz9Zeh0p8jBbVb9Ib_JudJkS5kfKI6-xkezgpEoomhJQ6vn1GyRAPst2W2FJ-H-I3f2kD_KwEU1tE73gB5ledQ";
  console.log("Attempting to get FCM token with VAPID key:", vapidKeyFromServer);

  try {
    const currentToken = await getToken(messagingInstance, {
      vapidKey: vapidKeyFromServer
    });

    if (currentToken) {
      console.log('✅ FCM Token:', currentToken);
      return currentToken;
    } else {
      console.warn('🚫 Токен авах боломжгүй байна. Notification permission шаардлагатай эсвэл VAPID key буруу байж магадгүй.');
      return null;
    }
  } catch (err) {
    console.error('❌ FCM токен авахад алдаа гарлаа:', err);
    if (err instanceof Error && (err.message.includes('InvalidAccessError') || err.message.includes("applicationServerKey is not valid") || err.message.includes("token-subscribe-failed"))) {
        console.error('❗️ VAPID key эсвэл Google Cloud төслийн тохиргоо (Биллинг, OAuth Consent Screen) буруу байх магадлалтай. Ашиглаж буй VAPID key:', vapidKeyFromServer);
    }
    return null;
  }
};

// ✅ Foreground Notification хүлээн авах
export const onMessageListener = (): Promise<any> =>
  new Promise((resolve, reject) => {
    if (!messagingInstance) {
      console.warn('Firebase Messaging instance is not available. Cannot listen for messages.');
      return resolve(null); 
    }
    try {
      onMessage(messagingInstance, (payload) => {
        console.log('📩 Foreground message received:', payload);
        resolve(payload);
      });
    } catch (error) {
       console.error("Error setting up onMessage listener:", error);
       reject(error);
    }
  });

export { app, auth, db, analytics, messagingInstance as messaging };

