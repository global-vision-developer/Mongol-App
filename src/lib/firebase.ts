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
import { getStorage, type Storage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyASai6a1N3BVpG8n6CMzssFQbxdzzRhdPc",
  authDomain: "setgelzuin-app.firebaseapp.com",
  projectId: "setgelzuin-app",
  storageBucket: "setgelzuin-app.firebasestorage.app",
  messagingSenderId: "397784045864",
  appId: "1:397784045864:web:dd035abe90938e4725581d",
  measurementId: "G-GNT80QXXF4"
};

const app: FirebaseApp = initializeApp(firebaseConfig);
console.log("Firebase App initialized");

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: Storage = getStorage(app);
console.log("Auth, Firestore, and Storage initialized");

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

let messagingSingleton: Messaging | null = null;
let messagingPromise: Promise<Messaging | null> | null = null;

const getInitializedMessaging = (): Promise<Messaging | null> => {
    if (messagingSingleton) {
        return Promise.resolve(messagingSingleton);
    }
    if (messagingPromise) {
        return messagingPromise;
    }

    messagingPromise = new Promise(async (resolve) => {
        if (typeof window !== 'undefined') {
            try {
                const supported = await isMessagingSupported();
                if (supported) {
                    console.log("Firebase.ts: Messaging is supported. Initializing...");
                    messagingSingleton = getMessaging(app);
                    console.log("Firebase.ts: Messaging SDK initialized.");
                    resolve(messagingSingleton);
                } else {
                    console.log("Firebase.ts: Firebase Messaging is not supported by isMessagingSupported().");
                    messagingSingleton = null; // Ensure it's null if not supported
                    resolve(null);
                }
            } catch (err) {
                console.error('Firebase.ts: Failed to initialize Firebase Messaging SDK:', err);
                messagingSingleton = null; // Ensure it's null on error
                resolve(null);
            }
        } else {
            console.log("Firebase.ts: Not in a browser environment, Firebase Messaging not initialized.");
            messagingSingleton = null; // Ensure it's null
            resolve(null);
        }
    });
    return messagingPromise;
};


export const requestForToken = async (): Promise<string | null> => {
  const messaging = await getInitializedMessaging();
  if (!messaging) {
    console.warn('requestForToken: Firebase Messaging instance is not available.');
    return null;
  }

  const vapidKeyFromServer = "BNz9Zeh0p8jBbVb9Ib_JudJkS5kfKI6-xkezgpEoomhJQ6vn1GyRAPst2W2FJ-H-I3f2kD_KwEU1tE73gB5ledQ";
  console.log("Attempting to get FCM token with VAPID key:", vapidKeyFromServer);

  try {
    const currentToken = await getToken(messaging, {
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

export const setupOnMessageListener = async (callback: (payload: any) => void): Promise<(() => void) | null> => {
  const messaging = await getInitializedMessaging();
  if (!messaging) {
    console.warn('setupOnMessageListener: Firebase Messaging instance is not available.');
    return null;
  }
  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('📩 Foreground message received:', payload);
      callback(payload);
    });
    return unsubscribe;
  } catch (error) {
     console.error("Error setting up onMessage listener:", error);
     return null;
  }
};

export { app, auth, db, analytics, storage };
// Removed direct export of 'messagingInstance as messaging'
// AppInit.tsx will use the async setupOnMessageListener and requestForToken.
