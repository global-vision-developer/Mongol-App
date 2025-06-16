// public/firebase-messaging-sw.js

// Firebase SDK-ийн шинэ хувилбарыг ашиглах (жишээ нь, v10.x)
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Firebase аппыг service worker дотор initialize хийх
// Вэб хуудсандаа Firebase аппаа initialize хийсний дараа service worker-г бүртгэхээ мартуузай.
const firebaseConfig = {
  apiKey: "AIzaSyASai6a1N3BVpG8n6CMzssFQbxdzzRhdPc",
  authDomain: "setgelzuin-app.firebaseapp.com",
  projectId: "setgelzuin-app",
  storageBucket: "setgelzuin-app.firebasestorage.app",
  messagingSenderId: "397784045864", // Энэ ID нь таны Firebase төслийн Sender ID-тай таарч байх ёстой!
  appId: "1:397784045864:web:dd035abe90938e4725581d",
  measurementId: "G-GNT80QXXF4"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Энд notification-г өөрийн хүссэнээр тохируулж болно
  const notificationTitle = payload.notification?.title || 'Шинэ Мэдэгдэл';
  const notificationOptions = {
    body: payload.notification?.body || 'Танд шинэ мэдэгдэл ирлээ.',
    icon: payload.notification?.icon || '/icons/icon-192x192.png', // Өөрийн icon-ий замыг зааж өгнө үү
    data: payload.data // Энэ нь notification click хийх үед data-г ашиглах боломжийг олгоно
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Нэмэлт: Notification click хийх үйлдэл
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification);

  event.notification.close();

  // Энэ хэсэг нь нээлттэй байгаа цонхыг фокуслахыг оролдоно
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Хэрэв notification data дотор URL байвал тэр URL-г нээнэ
        const urlToOpen = event.notification.data?.url || '/'; // URL байхгүй бол үндсэн хуудас руу

        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Хэрэв тохирох client олдвол эсвэл шинэ цонх нээх боломжтой бол
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
