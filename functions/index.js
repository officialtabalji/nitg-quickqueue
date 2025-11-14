const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function: Send FCM Push Notification when Order Status becomes "Ready"
 * 
 * Triggered when an order document is updated in Firestore
 * Sends push notification if:
 * - Previous status was NOT "ready"
 * - New status IS "ready"
 * - Device token exists (from order.deviceToken or user document)
 * 
 * To deploy:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login: firebase login
 * 3. Initialize: firebase init functions
 * 4. Deploy: firebase deploy --only functions
 * 
 * To add FCM server key:
 * 1. Go to Firebase Console > Project Settings > Cloud Messaging
 * 2. Copy Server Key (for legacy) or use Service Account JSON
 * 3. The function uses firebase-admin which auto-authenticates
 */
exports.onOrderStatusUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    const previousStatus = before.status || before.orderStatus;
    const newStatus = after.status || after.orderStatus;
    const orderId = context.params.orderId;
    const queueNumber = after.queueNumber;

    // Only send notification when status changes to "Ready"
    // Check: new status is "ready" AND previous status was NOT "ready"
    if (newStatus !== 'ready' || previousStatus === 'ready') {
      console.log('Status not changed to ready, skipping notification');
      return null;
    }

    // Get device token from order document first, fallback to user document
    let deviceToken = after.deviceToken;

    if (!deviceToken && after.userId) {
      // Fallback: get token from user document
      const userDoc = await admin.firestore().collection('users').doc(after.userId).get();
      deviceToken = userDoc.data()?.deviceToken || userDoc.data()?.fcmToken;
    }

    if (!deviceToken) {
      console.log('No device token found for order:', orderId);
      return null;
    }

    // Prepare FCM notification message
    const message = {
      notification: {
        title: '🎉 Order Ready for Pickup!',
        body: `Your order #${queueNumber || orderId.slice(0, 8)} is ready for pickup.`
      },
      data: {
        orderId: orderId,
        queueNumber: queueNumber?.toString() || '',
        status: newStatus,
        type: 'order_ready',
        click_action: 'FLUTTER_NOTIFICATION_CLICK' // For mobile apps
      },
      token: deviceToken,
      // Optional: Add Android and iOS specific config
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'order_updates'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    try {
      // Send notification using firebase-admin messaging
      const response = await admin.messaging().send(message);
      console.log('FCM notification sent successfully:', response);
      return null;
    } catch (error) {
      console.error('Error sending FCM notification:', error);
      
      // If token is invalid, remove it from user document
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        console.log('Invalid token, removing from user document');
        if (after.userId) {
          await admin.firestore().collection('users').doc(after.userId).update({
            deviceToken: admin.firestore.FieldValue.delete(),
            fcmToken: admin.firestore.FieldValue.delete()
          });
        }
      }
      
      return null;
    }
  });

// Update payment status after Razorpay webhook
exports.updatePaymentStatus = functions.https.onRequest(async (req, res) => {
  // Verify Razorpay webhook signature here
  // This is a simplified version - implement proper verification in production

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { orderId, paymentId, status } = req.body;

  if (!orderId || !paymentId) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    await orderRef.update({
      paymentStatus: status === 'captured' ? 'paid' : 'failed',
      paymentId: paymentId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).send('Payment status updated');
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).send('Internal Server Error');
  }
});

// Calculate queue position and ETA
exports.calculateQueueMetrics = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderData = snap.data();
    
    // Get all active orders before this one
    const activeOrders = await admin.firestore()
      .collection('orders')
      .where('orderStatus', 'in', ['placed', 'preparing'])
      .where('createdAt', '<=', orderData.createdAt)
      .orderBy('createdAt', 'asc')
      .get();

    const queuePosition = activeOrders.size;
    const avgPrepTime = 5; // minutes per order
    const estimatedMinutes = queuePosition * avgPrepTime;

    // Update order with queue metrics
    await snap.ref.update({
      queuePosition: queuePosition,
      estimatedMinutes: estimatedMinutes
    });

    return null;
  });

