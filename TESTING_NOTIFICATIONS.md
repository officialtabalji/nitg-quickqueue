# 🧪 Testing Guide: Live Pickup Notifications & Real-Time Updates

This guide will help you verify that all notification and real-time features are working correctly.

## ✅ Pre-Testing Checklist

Before testing, ensure:
- [ ] Environment variables are set (`.env` file)
- [ ] Service worker Firebase config is updated (`public/firebase-messaging-sw.js`)
- [ ] Cloud Function is deployed (`firebase deploy --only functions`)
- [ ] Browser supports notifications (Chrome, Firefox, Edge)
- [ ] Browser notification permissions are enabled

---

## 🔍 Step 1: Check FCM Token Generation

### Test in Browser Console:

1. **Open your app** in the browser
2. **Login as a student**
3. **Open Browser DevTools** (F12)
4. **Go to Console tab**
5. **Look for these messages:**
   ```
   FCM token obtained: [long-token-string]
   FCM token saved to Firestore
   ```

### Check Firestore:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Firestore Database**
3. Open `users/{your-user-id}` document
4. **Verify these fields exist:**
   - `deviceToken` - Should contain a long token string
   - `fcmToken` - Should also contain the token
   - `notificationEnabled` - Should be `true`

**✅ If token is saved:** FCM setup is working!
**❌ If no token:** Check browser console for errors, verify VAPID key is set

---

## 🔍 Step 2: Test Real-Time Order Status Updates

### Test Flow:

1. **Open two browser windows/tabs:**
   - Tab 1: Student view (logged in as student)
   - Tab 2: Admin view (logged in as admin)

2. **In Student Tab:**
   - Place an order
   - Navigate to `/order-status/{orderId}`
   - Keep this tab open

3. **In Admin Tab:**
   - Navigate to `/admin/orders`
   - Find the order you just placed
   - Click **"Start Preparing"** button

4. **Check Student Tab:**
   - Status should update **instantly** (within 1-2 seconds)
   - No page refresh needed
   - Status should change from "placed" to "preparing"

5. **In Admin Tab:**
   - Click **"Mark as Ready"** button

6. **Check Student Tab:**
   - Status should update to "ready" **instantly**
   - **Green highlight with pulse animation** should appear
   - Message should show: "🎉 Your order is ready for pickup!"

**✅ If updates are instant:** Real-time Firestore is working!
**❌ If updates are slow/missing:** Check Firestore security rules, check browser console for errors

---

## 🔍 Step 3: Test Foreground Notifications (App Open)

### Test Flow:

1. **Login as student**
2. **Place an order**
3. **Keep the app open** (don't minimize)
4. **Open Admin tab/window**
5. **Mark order as "Ready"**

### Expected Result:

- **Toast notification** should appear in student tab
- Message: "Your order #X is ready for pickup!"
- **Order status page** should update to "ready" with green highlight

### Check Browser Console:

Look for:
```
Foreground message received: {notification: {...}, data: {...}}
Foreground notification received: {orderId: "...", ...}
```

**✅ If toast appears:** Foreground notifications working!
**❌ If no toast:** Check `src/main.jsx` setup, check browser console

---

## 🔍 Step 4: Test Background Notifications (App Closed/Minimized)

### Test Flow:

1. **Login as student**
2. **Place an order**
3. **Minimize browser or switch to another tab** (keep browser open)
4. **Open Admin tab/window**
5. **Mark order as "Ready"**

### Expected Result:

- **Browser notification** should appear (system notification)
- Title: "🎉 Order Ready for Pickup!"
- Body: "Your order #X is ready for pickup."
- **Clicking notification** should open the app and navigate to order status

### Check Service Worker:

1. **Open Browser DevTools** (F12)
2. **Go to Application tab** (Chrome) or **Storage tab** (Firefox)
3. **Click "Service Workers"** in left sidebar
4. **Verify:**
   - Service worker is registered
   - Status shows "activated and running"
   - URL shows `/firebase-messaging-sw.js`

**✅ If notification appears:** Background notifications working!
**❌ If no notification:** 
- Check service worker registration
- Verify `firebase-messaging-sw.js` is accessible
- Check browser notification permissions
- Check Cloud Function logs

---

## 🔍 Step 5: Test Cloud Function

### Check Function Logs:

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Navigate to Functions** in left sidebar
3. **Click on `onOrderStatusUpdate` function**
4. **Go to "Logs" tab**
5. **Mark an order as "Ready"** (as admin)
6. **Check logs for:**
   ```
   FCM notification sent successfully: [message-id]
   ```

### Expected Log Messages:

**Success:**
```
Status changed to ready, sending notification
FCM notification sent successfully: projects/.../messages/...
```

**Errors to watch for:**
```
No device token found for order: [orderId]
Error sending FCM notification: [error]
Invalid token, removing from user document
```

**✅ If logs show success:** Cloud Function is working!
**❌ If errors appear:** 
- Check device token exists in Firestore
- Verify token format is correct
- Check function deployment status

---

## 🔍 Step 6: Test Live Queue Updates

### Test Flow:

1. **Open two browser windows:**
   - Window 1: Student view at `/live-queue`
   - Window 2: Admin view at `/admin/orders`

2. **In Admin Window:**
   - Mark an order as "Ready"

3. **In Student Window:**
   - Order should move to "Ready" section **instantly**
   - Queue numbers should update in real-time
   - No page refresh needed

**✅ If queue updates instantly:** Live queue is working!
**❌ If updates are delayed:** Check `useLiveQueue` hook, check Firestore query

---

## 🔍 Step 7: Browser Console Checks

### Open Console and Look For:

**Good Signs:**
```javascript
// Token generation
FCM token obtained: [token]
FCM token saved to Firestore

// Real-time updates
[Firestore] Listening to orders collection
[Firestore] Document updated: orders/{orderId}

// Notifications
Foreground message received: {...}
[firebase-messaging-sw.js] Received background message
```

**Error Signs:**
```javascript
// Missing VAPID key
VITE_FIREBASE_VAPID_KEY is not set
Error getting notification token: Missing required parameter

// Service worker issues
Failed to register service worker
Service worker registration failed

// Firestore errors
Firestore permission denied
Missing or insufficient permissions
```

---

## 🔍 Step 8: Network Tab Checks

### Check Service Worker Registration:

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Filter by "firebase-messaging-sw.js"**
4. **Reload page**
5. **Verify:**
   - File loads successfully (Status: 200)
   - File is served from root path

### Check FCM Requests:

1. **In Network tab**
2. **Filter by "fcm" or "firebase"**
3. **Mark an order as Ready**
4. **Look for:**
   - POST requests to `fcm.googleapis.com`
   - Status should be 200 (success)

---

## 🔍 Step 9: Firestore Security Rules Check

### Verify Rules Allow:

1. **Students can read their own orders:**
   ```javascript
   match /orders/{orderId} {
     allow read: if request.auth != null;
   }
   ```

2. **Admins can update orders:**
   ```javascript
   match /orders/{orderId} {
     allow update: if request.auth != null && 
       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
   }
   ```

3. **Users can update their own deviceToken:**
   ```javascript
   match /users/{userId} {
     allow write: if request.auth != null && request.auth.uid == userId;
   }
   ```

---

## 🐛 Troubleshooting Common Issues

### Issue: No FCM Token Generated

**Check:**
- [ ] VAPID key is set in `.env` file
- [ ] Browser notification permission is granted
- [ ] Firebase config is correct
- [ ] Check browser console for errors

**Fix:**
```bash
# Verify .env file has:
VITE_FIREBASE_VAPID_KEY=your-vapid-key-here
```

### Issue: Notifications Not Appearing

**Check:**
- [ ] Service worker is registered
- [ ] `firebase-messaging-sw.js` is accessible
- [ ] Browser notification permissions
- [ ] Cloud Function is deployed
- [ ] Device token exists in Firestore

**Fix:**
1. Clear browser cache
2. Re-register service worker
3. Check Cloud Function logs

### Issue: Real-Time Updates Not Working

**Check:**
- [ ] Firestore security rules allow read
- [ ] `onSnapshot` is properly set up
- [ ] No console errors
- [ ] Network connection is stable

**Fix:**
1. Check Firestore rules
2. Verify `useOrder` and `useLiveQueue` hooks
3. Check browser console for Firestore errors

### Issue: Cloud Function Not Triggering

**Check:**
- [ ] Function is deployed: `firebase functions:list`
- [ ] Function logs show activity
- [ ] Order document structure is correct

**Fix:**
```bash
# Redeploy function
firebase deploy --only functions

# Check logs
firebase functions:log --only onOrderStatusUpdate
```

---

## ✅ Complete Test Checklist

Run through this complete flow:

- [ ] **FCM Token:** Token is generated and saved to Firestore
- [ ] **Real-Time Status:** Order status updates instantly when admin changes it
- [ ] **Green Highlight:** Green highlight appears when status is "Ready"
- [ ] **Foreground Notification:** Toast appears when app is open
- [ ] **Background Notification:** System notification appears when app is minimized
- [ ] **Notification Click:** Clicking notification navigates to order status
- [ ] **Live Queue:** Queue updates in real-time
- [ ] **Cloud Function:** Function logs show successful notification send
- [ ] **Service Worker:** Service worker is registered and active
- [ ] **No Console Errors:** Browser console shows no errors

---

## 📊 Quick Test Script

Copy and paste this in browser console to check status:

```javascript
// Check FCM token
(async () => {
  const { messaging } = await import('./src/firebase/config.js');
  if (messaging) {
    const { getToken } = await import('firebase/messaging');
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });
    console.log('FCM Token:', token ? '✅ Generated' : '❌ Not generated');
  } else {
    console.log('❌ Messaging not available');
  }
})();

// Check service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Service Workers:', registrations.length > 0 ? '✅ Registered' : '❌ Not registered');
  });
} else {
  console.log('❌ Service Workers not supported');
}

// Check notification permission
console.log('Notification Permission:', Notification.permission);
```

---

## 🎯 Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| User logs in | FCM token saved to Firestore |
| Admin marks order "Ready" | Status updates instantly on student screen |
| Admin marks order "Ready" | Green highlight appears (if on order status page) |
| Admin marks order "Ready" | Toast notification (if app open) |
| Admin marks order "Ready" | System notification (if app minimized) |
| Click notification | Navigates to order status page |
| View live queue | Updates in real-time when status changes |

---

## 📞 Still Having Issues?

1. **Check all console errors** - They usually point to the problem
2. **Verify environment variables** - All Firebase config must be correct
3. **Check Cloud Function logs** - Most notification issues show up here
4. **Test in incognito mode** - Rules out cache/browser extension issues
5. **Check Firestore rules** - Permissions must allow read/write

Good luck testing! 🚀

