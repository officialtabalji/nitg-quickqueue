import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { messaging, db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

/**
 * Request FCM notification permission and get device token
 * Saves token to /users/{uid}.deviceToken for Cloud Function to use
 * 
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
export const requestFCMToken = async () => {
  if (!messaging) {
    console.warn('Firebase Messaging not available');
    return null;
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Get FCM token
    // VAPID key is required for web push notifications
    // Get it from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    
    if (!vapidKey) {
      console.warn('VAPID key not found. Add VITE_FIREBASE_VAPID_KEY to .env');
      return null;
    }

    const token = await getToken(messaging, { vapidKey });
    
    if (token) {
      console.log('FCM token obtained:', token);
      return token;
    } else {
      console.log('No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Save FCM token to user document
 * 
 * @param {string} userId - User ID
 * @param {string} token - FCM token
 */
export const saveFCMTokenToUser = async (userId, token) => {
  if (!userId || !token) return;

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      deviceToken: token,
      fcmToken: token, // Keep both for compatibility
      fcmTokenUpdatedAt: new Date()
    });
    console.log('FCM token saved to user document');
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

/**
 * Request permission and save token to user document
 * 
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} FCM token or null
 */
export const requestAndSaveFCMToken = async (userId) => {
  const token = await requestFCMToken();
  if (token && userId) {
    await saveFCMTokenToUser(userId, token);
  }
  return token;
};

/**
 * Listen for foreground FCM messages
 * Call this in your app component to handle notifications when app is open
 */
export const setupForegroundMessageListener = () => {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    
    // Show browser notification
    if (payload.notification) {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png'
      });
    }

    // Handle navigation if orderId is in data
    if (payload.data?.orderId) {
      // You can navigate to order status page
      // window.location.href = `/order-status/${payload.data.orderId}`;
    }
  });
};

export default {
  requestFCMToken,
  saveFCMTokenToUser,
  requestAndSaveFCMToken,
  setupForegroundMessageListener
};

