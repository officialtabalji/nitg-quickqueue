import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

/**
 * Request notification permission and get FCM token
 * Saves token to Firestore at users/{uid}.deviceToken
 * 
 * @param {string} userId - User ID to save token for
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
export const requestNotificationPermission = async (userId) => {
  if (!messaging) {
    console.warn('Firebase Messaging is not available');
    return null;
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Get VAPID key from environment variables
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      
      if (!vapidKey) {
        console.error('VITE_FIREBASE_VAPID_KEY is not set in environment variables');
        toast.error('Notification setup incomplete. Please configure VAPID key.');
        return null;
      }

      // Get FCM token
      const token = await getToken(messaging, { vapidKey });
      
      if (token) {
        // Save token to Firestore
        if (userId) {
          try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
              deviceToken: token,
              fcmToken: token, // Support both field names
              notificationEnabled: true,
              tokenUpdatedAt: new Date()
            });
            console.log('FCM token saved to Firestore');
          } catch (error) {
            console.error('Error saving FCM token to Firestore:', error);
          }
        }
        
        return token;
      } else {
        console.warn('No FCM token available');
        return null;
      }
    } else {
      console.log('Notification permission denied');
      toast.error('Notification permission denied. You won\'t receive order updates.');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification token:', error);
    toast.error('Failed to setup notifications');
    return null;
  }
};

/**
 * Setup foreground message listener
 * Shows toast notification when app is in foreground
 * 
 * @param {Function} callback - Optional callback to handle message
 */
export const setupForegroundMessageListener = (callback) => {
  if (!messaging) {
    console.warn('Firebase Messaging is not available');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    
    // Show toast notification
    if (payload.notification) {
      toast.success(payload.notification.body || payload.notification.title, {
        duration: 5000,
        icon: '🔔'
      });
    }

    // Call custom callback if provided
    if (callback) {
      callback(payload);
    }
  });
};

/**
 * Check if notifications are supported
 * @returns {boolean}
 */
export const isNotificationSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Check current notification permission
 * @returns {string} 'granted', 'denied', or 'default'
 */
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
};

