
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

  // =====================================================================================
  // ЭНЭ БОЛ ТАНЫ FIREBASE ТӨСЛИЙН ЖИНХЭНЭ VAPID KEY (PUBLIC KEY PAIR)
  // Firebase Console > Project Settings > Cloud Messaging таб > Web Push certificates хэсэгт "Key pair" гэсэн утга.
  // =====================================================================================
  const vapidKeyFromServer = "BNz9Zeh0p8jBbVb9lb_JudJkS5kfKl6-xkezgpEoomhJQ6vn1GyRAPst2W2FJ-H-I3f2kD_KwEU1tE73gB5ledQ";

  // Sanity check to ensure a real key is being used (optional, can be removed)
  if (vapidKeyFromServer === "YOUR_GENERATED_VAPID_KEY_FROM_FIREBASE_CONSOLE") {
      console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.error("VAPID Key оруулаагүй байна! src/lib/firebase.ts файлыг засна уу.");
      console.error("Firebase Console > Project Settings > Cloud Messaging > Web Push certificates -> Key pair");
      console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      return null;
  }
  
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
    if (err instanceof Error && (err.message.includes('InvalidAccessError') || err.message.includes("applicationServerKey is not valid"))) {
        console.error('❗️ VAPID key буруу байх магадлалтай. Ашиглаж буй key:', vapidKeyFromServer, ' Firebase Console-оос авсан Key pair-г дахин шалгана уу.');
    }
    return null;
  }
};

// ✅ Foreground Notification хүлээн авах
export const onMessageListener = (): Promise<any> =>
  new Promise((resolve) => {
    if (!messagingInstance) {
      console.warn('Firebase Messaging is not initialized. Cannot listen for messages.');
      return resolve(null); 
    }
    onMessage(messagingInstance, (payload) => {
      console.log('📩 Foreground message received:', payload);
      resolve(payload);
    });
  });

export { app, auth, db, analytics, messagingInstance as messaging };
