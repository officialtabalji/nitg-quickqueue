# 🔔 Live Pickup Notifications + Real-Time Order Status Setup Guide

This guide will help you set up push notifications and real-time order status updates for your QuickQueue app.

## 📋 Prerequisites

1. Firebase project with Firestore enabled
2. Firebase Cloud Messaging (FCM) enabled
3. VAPID key generated from Firebase Console

## 🔧 Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) > **General** tab
4. Scroll down to **Your apps** section
5. Copy your Firebase config values

## 🔑 Step 2: Generate VAPID Key

1. In Firebase Console, go to **Project Settings** > **Cloud Messaging** tab
2. Scroll to **Web Push certificates** section
3. Click **Generate key pair** (if not already generated)
4. Copy the **Key pair** (VAPID key)

## 📝 Step 3: Update Environment Variables

Create or update your `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key-here
```

## 🔧 Step 4: Update Service Worker

Edit `public/firebase-messaging-sw.js` and replace the Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

**Note:** Service workers can't access environment variables directly, so you need to hardcode the config here or use a build script to inject it.

## 🚀 Step 5: Deploy Cloud Function

The Cloud Function is already set up in `functions/index.js`. To deploy:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

The function `onOrderStatusUpdate` will automatically send push notifications when an order status changes to "Ready".

## ✅ Step 6: Test Notifications

1. **Request Permission:**
   - When a user logs in, the app will automatically request notification permission
   - The FCM token will be saved to `users/{uid}.deviceToken` in Firestore

2. **Test Order Status Update:**
   - Place an order as a student
   - As admin, mark the order as "Ready"
   - The student should:
     - See the status update instantly on the order status page
     - Receive a browser push notification

## 📱 How It Works

### Student Flow:
1. User logs in → FCM token is requested and saved
2. User places order → Order created in Firestore
3. Admin marks order as "Ready" → Cloud Function triggers
4. Cloud Function sends FCM notification
5. Student receives notification (foreground or background)
6. Order status page updates in real-time via `onSnapshot`

### Admin Flow:
1. Admin views orders in `/admin/orders`
2. Admin clicks "Mark as Ready" button
3. Status updates in Firestore using `updateDoc`
4. Real-time updates reflect on student screens instantly
5. Cloud Function sends push notification

## 🔍 Troubleshooting

### Notifications Not Working?

1. **Check Browser Support:**
   - Ensure browser supports notifications (Chrome, Firefox, Edge)
   - Check if notifications are blocked in browser settings

2. **Check FCM Token:**
   - Verify token is saved in Firestore: `users/{uid}.deviceToken`
   - Check browser console for token generation errors

3. **Check Service Worker:**
   - Verify `firebase-messaging-sw.js` is accessible at `/firebase-messaging-sw.js`
   - Check browser DevTools > Application > Service Workers

4. **Check Cloud Function:**
   - Verify function is deployed: `firebase functions:list`
   - Check function logs: `firebase functions:log`

5. **Check VAPID Key:**
   - Ensure VAPID key is correctly set in `.env` file
   - Verify key matches the one in Firebase Console

### Service Worker Not Registering?

1. Ensure `firebase-messaging-sw.js` is in the `public/` folder
2. Check that the file is being served at the root path
3. Clear browser cache and reload

### Real-Time Updates Not Working?

1. Check Firestore security rules allow read access
2. Verify `onSnapshot` is properly set up in components
3. Check browser console for Firestore errors

## 📚 Files Overview

- `src/utils/notifications.js` - FCM token management
- `src/context/AuthContext.jsx` - Saves FCM token after login
- `src/pages/OrderStatus.jsx` - Real-time order status with green highlight
- `src/pages/LiveQueue.jsx` - Real-time queue list
- `src/pages/admin/OrdersManagement.jsx` - Admin order management with status buttons
- `public/firebase-messaging-sw.js` - Service worker for background notifications
- `functions/index.js` - Cloud Function for sending notifications
- `src/main.jsx` - Foreground message handler

## 🎯 Next Steps

1. Update Firebase config in service worker
2. Set environment variables
3. Deploy Cloud Function
4. Test with a real order flow
5. Monitor Cloud Function logs for any issues

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Firebase Console > Functions > Logs
3. Verify all environment variables are set correctly
4. Ensure service worker is properly registered

