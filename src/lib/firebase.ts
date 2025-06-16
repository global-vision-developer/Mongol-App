
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
    // =====================================================================================
    // !!! ЧУХАЛ: ЭНЭ ХЭСЭГТ ӨӨРИЙН FIREBASE ТӨСЛИЙН ЖИНХЭНЭ VAPID KEY-Г ОРУУЛНА УУ !!!
    // Firebase Console > Project Settings > Cloud Messaging таб > Web Push certificates хэсэгт "Key pair" гэсэн утгыг хуулж авна.
    // =====================================================================================
    const vapidKeyFromServer = "TH8etw_bcQc_GGSMbcUUrgPNXHjylTtSSJmVi_J2SSU"; // <-- ЭНЭ ХЭСГИЙГ ӨӨРИЙН KEY-Р СОЛИНО УУ!

    if (vapidKeyFromServer === "YOUR_GENERATED_VAPID_KEY_FROM_FIREBASE_CONSOLE") {
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.error("VAPID Key оруулаагүй байна! src/lib/firebase.ts файлыг засна уу.");
        console.error("Firebase Console > Project Settings > Cloud Messaging > Web Push certificates -> Key pair");
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        return null;
    }

    const currentToken = await getToken(messagingInstance, {
      vapidKey: vapidKeyFromServer
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
    // InvalidAccessError: Failed to execute 'subscribe' on 'PushManager': The provided applicationServerKey is not valid.
    // Энэ алдаа нь ихэвчлэн VAPID key буруу үед гардаг.
    if (err instanceof Error && err.name === 'InvalidAccessError') {
        console.error('❗️ VAPID key буруу байх магадлалтай. Firebase Console-оос авсан Key pair-г шалгана уу.');
    }
    return null;
  }
};

// ✅ Foreground Notification хүлээн авах
export const onMessageListener = (): Promise<any> =>
  new Promise((resolve) => {
    if (!messagingInstance) {
      console.warn('Firebase Messaging is not initialized. Cannot listen for messages.');
      // Resolve with null or an empty object if messaging is not available
      return resolve(null); 
    }
    onMessage(messagingInstance, (payload) => {
      console.log('📩 Foreground message received:', payload);
      resolve(payload);
    });
  });

export { app, auth, db, analytics, messagingInstance as messaging };
