/* eslint-disable no-undef */
/* global importScripts, firebase */

// Import Firebase scripts for service worker
// Using compat versions for service worker compatibility
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
// IMPORTANT: Replace these values with your actual Firebase config
// You can get these from Firebase Console > Project Settings > General > Your apps
// Or use environment variables if you have a build process that injects them
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'Order Update';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new order update',
    icon: '/pwa-192x192.png', // Use your app icon
    badge: '/pwa-192x192.png',
    tag: payload.data?.orderId || 'order-notification',
    requireInteraction: false,
    data: {
      url: payload.data?.url || '/live-queue',
      orderId: payload.data?.orderId || '',
      queueNumber: payload.data?.queueNumber || ''
    }
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();

  // Get the URL from notification data or default to live queue
  const urlToOpen = event.notification.data?.url || '/live-queue';
  const orderId = event.notification.data?.orderId;

  // If orderId exists, navigate to order status page
  const finalUrl = orderId ? `/order-status/${orderId}` : urlToOpen;

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === finalUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(finalUrl);
      }
    })
  );
});

