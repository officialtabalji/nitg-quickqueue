const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Send notification when order status changes
exports.onOrderStatusUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only send notification if status changed
    if (before.orderStatus === after.orderStatus) {
      return null;
    }

    const userId = after.userId;
    const orderId = context.params.orderId;
    const newStatus = after.orderStatus;

    // Get user's FCM token
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (!fcmToken) {
      console.log('No FCM token for user:', userId);
      return null;
    }

    // Prepare notification message
    let title = 'Order Update';
    let body = '';

    switch (newStatus) {
      case 'preparing':
        title = 'Order Being Prepared';
        body = `Your order #${orderId.slice(0, 8)} is now being prepared!`;
        break;
      case 'ready':
        title = 'Order Ready for Pickup!';
        body = `Your order #${orderId.slice(0, 8)} is ready for pickup.`;
        break;
      default:
        body = `Your order status has been updated to ${newStatus}`;
    }

    const message = {
      notification: {
        title: title,
        body: body
      },
      data: {
        orderId: orderId,
        status: newStatus,
        type: 'order_update'
      },
      token: fcmToken
    };

    try {
      await admin.messaging().send(message);
      console.log('Notification sent successfully');
      return null;
    } catch (error) {
      console.error('Error sending notification:', error);
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

