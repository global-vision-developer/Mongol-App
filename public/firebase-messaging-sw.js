// public/firebase-messaging-sw.js

// Scripts for Firebase v10.12.2
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// It's crucial that this firebaseConfig matches the one in your web app (src/lib/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyASai6a1N3BVpG8n6CMzssFQbxdzzRhdPc",
  authDomain: "setgelzuin-app.firebaseapp.com",
  projectId: "setgelzuin-app",
  storageBucket: "setgelzuin-app.firebasestorage.app",
  messagingSenderId: "397784045864", // This MUST match your project's Sender ID
  appId: "1:397784045864:web:dd035abe90938e4725581d",
  measurementId: "G-GNT80QXXF4"
};

// Initialize Firebase
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('[SW] Firebase app initialized in Service Worker.');
  } else {
    firebase.app(); // if already initialized, use that one
    console.log('[SW] Firebase app already initialized in Service Worker.');
  }
} catch (e) {
  console.error('[SW] Error initializing Firebase app in Service Worker:', e);
}


let messaging;
try {
  if (firebase.messaging.isSupported()) {
    messaging = firebase.messaging();
    console.log('[SW] Firebase Messaging initialized in Service Worker.');

    // Background message handler
    messaging.onBackgroundMessage((payload) => {
      console.log('[SW] Received background message: ', payload);

      if (payload.notification) {
        const notificationTitle = payload.notification.title || 'New Message';
        const notificationOptions = {
          body: payload.notification.body || 'You have a new message.',
          icon: payload.notification.icon || '/icons/icon-192x192.png', // Default icon
          image: payload.notification.image, // Optional image
          badge: '/icons/badge-72x72.png', // Optional badge
          data: payload.data || {}, // Pass along any data for click action
        };

        // Ensure self.registration is available
        if (self.registration) {
          return self.registration.showNotification(notificationTitle, notificationOptions);
        } else {
          console.warn('[SW] self.registration is not available. Cannot show notification.');
          // Fallback or alternative handling if needed
        }
      } else {
        console.log("[SW] Background message payload did not contain a 'notification' object.");
      }
    });
  } else {
    console.log('[SW] Firebase Messaging is not supported in this service worker environment.');
  }
} catch (e) {
  console.error('[SW] Error initializing Firebase Messaging in Service Worker:', e);
}


// Optional: Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click Received.', event.notification);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/'; // Use data.url or fallback to home

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        // Check if the client's URL matches the one we want to open
        // and if it's focused.
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no existing window is found or it's not focused, open a new one.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed: ', event);
  // Here you might want to re-subscribe the user and send the new token to your server
});

self.addEventListener('install', (event) => {
  console.log('[SW] Service worker installed');
  // event.waitUntil(self.skipWaiting()); // Optional: activate new SW immediately
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service worker activated');
  // event.waitUntil(self.clients.claim()); // Optional: take control of open clients
});
