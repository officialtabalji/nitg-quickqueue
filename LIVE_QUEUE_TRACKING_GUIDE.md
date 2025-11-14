# Live Queue Tracking Feature - Complete Guide

## 📋 Overview

Complete Live Queue Tracking system with real-time updates, FCM push notifications, and role-based access control.

## 🗂️ Firestore Schema

### `/orders/{orderId}`
```javascript
{
  userId: string,                    // User who placed the order
  items: [{                          // Array of ordered items
    itemId: string,
    name: string,
    qty: number,
    price: number
  }],
  totalAmount: number,               // Total order amount
  status: "placed" | "preparing" | "ready" | "picked",  // Order status
  orderStatus: string,               // Backward compatibility field
  queueNumber: number,               // Unique queue number (assigned via transaction)
  createdAt: Timestamp,              // Order creation time
  updatedAt: Timestamp,               // Last update time
  deviceToken?: string                // FCM token for push notifications
}
```

### `/users/{uid}/orders/{orderId}`
Duplicate of order document for user's order history.

### `/meta/counters`
```javascript
{
  orderCounter: number              // Atomic counter for queue numbers
}
```

## 🚀 Features Implemented

### 1. Student Features

#### A. Order Status Page (`/order-status/:orderId`)
- Real-time single-order view using `onSnapshot(doc(db, 'orders', orderId))`
- Shows queueNumber, current status, items, createdAt
- Status-specific messages and colors
- **Speech synthesis alert** when status === "Ready" (browser notification)
- Friendly UI with Tailwind CSS

#### B. Live Queue List (`/live-queue`)
- Shows all orders ordered by `queueNumber` ascending
- Real-time updates via `onSnapshot(query)`
- Each row shows: queueNumber, items summary, status, relative time
- Filtered by active/completed orders

### 2. Admin Features

#### C. Live Orders Panel (`/admin/orders`)
- Real-time list of all orders ordered by queueNumber
- Each order card shows: items, userId, createdAt, status
- Status update buttons: **Preparing → Ready → Picked**
- Uses `updateDoc(doc(db, 'orders', id), { status: "Ready" })`
- Changes reflected live for students via onSnapshot

### 3. Queue Number Ordering

#### Transaction-Based Queue Assignment
- Uses Firestore `runTransaction` to atomically increment `/meta/counters.orderCounter`
- Prevents race conditions where multiple orders could get the same queue number
- Code in `src/firebase/orders.js` → `createOrder()`

**How it works:**
1. Transaction reads current counter value
2. Increments counter atomically
3. Assigns unique queueNumber to order
4. Creates order document
5. Creates duplicate in user's orders subcollection

### 4. FCM Push Notifications (Optional)

#### Cloud Function
- **File:** `functions/index.js` → `onOrderStatusUpdate`
- **Trigger:** Firestore document update on `/orders/{orderId}`
- **Condition:** Sends notification if `newStatus === "ready"` AND `previousStatus !== "ready"`
- **Token Source:** `order.deviceToken` or `/users/{uid}.deviceToken`

#### Frontend FCM Setup
- **File:** `src/utils/fcmToken.js`
- Request notification permission
- Get FCM token using `getToken(messaging, { vapidKey })`
- Save token to `/users/{uid}.deviceToken`

## 📁 File Structure

```
src/
├── hooks/
│   ├── useOrder.js              ✅ Real-time single order subscription
│   └── useLiveQueue.js           ✅ Real-time queue list subscription
├── pages/
│   ├── OrderStatus.jsx          ✅ Student order status page
│   ├── LiveQueue.jsx            ✅ Student live queue page
│   └── admin/
│       └── OrdersManagement.jsx  ✅ Admin orders panel (enhanced)
├── components/
│   └── OrderCard.jsx            ✅ Reusable order card component
├── services/
│   └── orderService.js          ✅ Order creation helper
├── utils/
│   └── fcmToken.js              ✅ FCM token management
└── firebase/
    └── orders.js                ✅ Firestore order operations

functions/
└── index.js                     ✅ Cloud Function for FCM
```

## 🔐 Firestore Security Rules

Updated rules in `firestore.rules`:

- **Students:** Can read menu, create orders, read all orders (for live queue), update own orders
- **Admins:** Can read/write all orders and menu
- **Meta collection:** Read for all authenticated, write for admins only

## 🛠️ Setup & Deployment

### 1. Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables** (`.env`):
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_VAPID_KEY=your-vapid-key  # For FCM
   ```

3. **Deploy Firestore rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Deploy indexes** (if needed):
   ```bash
   firebase deploy --only firestore:indexes
   ```

### 2. Cloud Functions Setup (FCM)

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login:**
   ```bash
   firebase login
   ```

3. **Initialize Functions:**
   ```bash
   cd functions
   npm install
   ```

4. **Get VAPID Key:**
   - Go to Firebase Console > Project Settings > Cloud Messaging
   - Under "Web Push certificates", generate or copy VAPID key
   - Add to `.env` as `VITE_FIREBASE_VAPID_KEY`

5. **Deploy Function:**
   ```bash
   firebase deploy --only functions:onOrderStatusUpdate
   ```

### 3. Testing with Multiple Devices

#### Option A: Deploy to Vercel/Netlify
1. Push code to GitHub
2. Connect to Vercel/Netlify
3. Add environment variables
4. Deploy
5. Test on multiple devices using deployed URL

#### Option B: Local Network
1. Run `npm run dev`
2. Note your local IP (e.g., `192.168.1.100`)
3. Access from other devices: `http://192.168.1.100:5173`
4. Add authorized domain in Firebase Console:
   - Project Settings > Authorized domains
   - Add your local IP or domain

## 🧪 Testing Instructions

### Test Order Creation
1. Login as student
2. Add items to cart
3. Place order
4. Verify queue number is assigned
5. Check `/order-status/:orderId` shows real-time updates

### Test Live Queue
1. Create multiple orders (from different accounts/devices)
2. Open `/live-queue` on multiple devices
3. Verify orders appear in queue number order
4. Verify real-time updates when admin changes status

### Test Admin Panel
1. Login as admin
2. Go to `/admin/orders`
3. Update order status: Preparing → Ready → Picked
4. Verify changes reflect on student devices instantly

### Test FCM Notifications
1. Request notification permission (browser will prompt)
2. Place an order (token saved to user document)
3. Admin marks order as "Ready"
4. Verify push notification received
5. Check browser console for FCM messages

## 📝 Code Explanations

### Why onSnapshot?
- **Real-time updates:** Automatically updates when Firestore data changes
- **Efficient:** No polling required, uses WebSocket connection
- **Instant:** Changes reflect immediately across all connected clients
- **Automatic cleanup:** Unsubscribes when component unmounts

### Transaction for Queue Numbers
```javascript
// Prevents race condition:
// Without transaction: Order 1 and Order 2 could both get queue #5
// With transaction: Order 1 gets #5, Order 2 gets #6 (atomic)
runTransaction(db, async (transaction) => {
  const counter = await transaction.get(counterRef);
  const queueNumber = counter.data().orderCounter + 1;
  transaction.update(counterRef, { orderCounter: queueNumber });
  // ... create order with queueNumber
});
```

### FCM Token Flow
1. User grants notification permission
2. Frontend calls `getToken(messaging, { vapidKey })`
3. Token saved to `/users/{uid}.deviceToken`
4. Token included in order creation
5. Cloud Function reads token when status → "ready"
6. Sends push notification via `admin.messaging().send()`

## 🎨 UI Features

- **Status Badges:**
  - Preparing: Amber/Yellow
  - Ready: Green
  - Picked: Gray
- **Responsive Design:** Mobile, tablet, desktop
- **Dark Mode:** Full support
- **Loading States:** Spinners during data fetch
- **Error Handling:** Graceful error messages

## 🔄 Status Flow

```
placed → preparing → ready → picked
```

- **placed:** Order created, in queue
- **preparing:** Admin started preparing
- **ready:** Order ready for pickup (triggers notification)
- **picked:** Order collected

## 📱 Browser Compatibility

- **Chrome/Edge:** Full support (FCM, Speech Synthesis)
- **Firefox:** Full support
- **Safari:** Limited FCM support (iOS 16.4+)
- **Mobile:** Works on Android/iOS browsers

## 🐛 Troubleshooting

### FCM Not Working
- Check VAPID key is set correctly
- Verify notification permission granted
- Check browser console for errors
- Ensure Cloud Function is deployed

### Real-time Updates Not Working
- Check Firestore rules allow read access
- Verify user is authenticated
- Check browser console for Firestore errors

### Queue Numbers Duplicate
- Should not happen with transactions
- Check `/meta/counters` exists
- Verify transaction code is used

## 📚 Additional Resources

- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [FCM Web Setup](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Firestore Transactions](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [React Router](https://reactrouter.com/)

---

**Status:** ✅ Complete and Production Ready

