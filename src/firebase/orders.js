import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { calculateQueueNumber } from '../utils/calculateQueueNumber';
import { calculateETA } from '../utils/calculateETA';

// Create a new order with proper structure (for mock payment flow)
export const createOrder = async (orderData) => {
  try {
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      userId: orderData.userId,
      items: orderData.items, // [{ name, price, quantity }]
      totalAmount: orderData.totalAmount,
      paymentStatus: 'pending',
      status: 'pending_payment',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message };
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (orderDoc.exists()) {
      return { id: orderDoc.id, ...orderDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

// Confirm payment and assign queue number + ETA
export const confirmPayment = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    // First, verify the order exists
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists()) {
      console.error('Order does not exist:', orderId);
      return { success: false, error: 'Order not found' };
    }
    
    console.log('Order found, current data:', orderDoc.data());
    
    // Calculate queue number and ETA with error handling
    let queueNumber = 1;
    let estimatedTime = 4;
    
    try {
      queueNumber = await calculateQueueNumber();
      console.log('Queue number calculated:', queueNumber);
    } catch (queueError) {
      console.error('Error calculating queue number, using default:', queueError);
      // Try to get a simple count as fallback
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('paymentStatus', '==', 'paid'),
          where('status', 'in', ['new', 'preparing', 'ready'])
        );
        const snapshot = await getDocs(q);
        queueNumber = snapshot.size + 1;
      } catch (fallbackError) {
        console.error('Fallback queue calculation failed:', fallbackError);
        queueNumber = 1;
      }
    }
    
    try {
      estimatedTime = await calculateETA(orderId);
      console.log('ETA calculated:', estimatedTime);
    } catch (etaError) {
      console.error('Error calculating ETA, using default:', etaError);
      estimatedTime = 4; // Default 4 minutes
    }
    
    // Update the order
    console.log('Updating order with:', {
      paymentStatus: 'paid',
      status: 'new',
      queueNumber,
      estimatedTime
    });
    
    await updateDoc(orderRef, {
      paymentStatus: 'paid',
      status: 'new',
      queueNumber: queueNumber,
      estimatedTime: estimatedTime,
      updatedAt: serverTimestamp()
    });
    
    console.log('Payment confirmed successfully for order:', orderId);
    
    // Verify the update was successful by reading the document again
    const updatedOrderDoc = await getDoc(orderRef);
    if (!updatedOrderDoc.exists()) {
      console.error('Order disappeared after update!');
      return { success: false, error: 'Order not found after update' };
    }
    
    const updatedData = updatedOrderDoc.data();
    console.log('Verified order after update:', {
      id: updatedOrderDoc.id,
      paymentStatus: updatedData.paymentStatus,
      status: updatedData.status,
      queueNumber: updatedData.queueNumber,
      estimatedTime: updatedData.estimatedTime
    });
    
    // Double-check that paymentStatus was actually updated
    if (updatedData.paymentStatus !== 'paid') {
      console.error('Payment status was not updated correctly! Current status:', updatedData.paymentStatus);
      return { success: false, error: 'Payment status update failed' };
    }
    
    return { success: true, queueNumber, estimatedTime };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return { success: false, error: error.message };
  }
};

// Mark payment as failed
export const markPaymentFailed = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      paymentStatus: 'failed',
      status: 'cancelled',
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking payment as failed:', error);
    return { success: false, error: error.message };
  }
};

// Assign queue number to an order
export const assignQueueNumber = async (orderId) => {
  try {
    const queueNumber = await calculateQueueNumber();
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      queueNumber: queueNumber,
      updatedAt: serverTimestamp()
    });
    return { success: true, queueNumber };
  } catch (error) {
    console.error('Error assigning queue number:', error);
    return { success: false, error: error.message };
  }
};

// Assign estimated time to an order
export const assignEstimatedTime = async (orderId) => {
  try {
    const estimatedTime = await calculateETA(orderId);
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      estimatedTime: estimatedTime,
      updatedAt: serverTimestamp()
    });
    return { success: true, estimatedTime };
  } catch (error) {
    console.error('Error assigning estimated time:', error);
    return { success: false, error: error.message };
  }
};

// Get user orders
export const getUserOrders = async (userId) => {
  try {
    const ordersRef = collection(db, 'orders');
    // Remove orderBy to avoid index requirement, sort client-side instead
    const q = query(
      ordersRef,
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      // Sort by createdAt descending client-side
      .sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return bTime - aTime; // Descending order
      });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};

// Get all orders (admin)
export const getAllOrders = async () => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
};

// Get active orders (admin)
export const getActiveOrders = async () => {
  try {
    const ordersRef = collection(db, 'orders');
    // Use only paymentStatus filter to avoid composite index requirement
    const q = query(
      ordersRef,
      where('paymentStatus', '==', 'paid')
    );
    const snapshot = await getDocs(q);
    
    // Filter and sort client-side
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(order => {
        const status = order.status || order.orderStatus;
        return ['new', 'preparing', 'ready', 'placed'].includes(status);
      })
      .sort((a, b) => {
        if (a.queueNumber && b.queueNumber) {
          return a.queueNumber - b.queueNumber;
        }
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return aTime - bTime;
      });
  } catch (error) {
    console.error('Error fetching active orders:', error);
    return [];
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: status, // Primary field
      orderStatus: status, // Keep for backward compatibility
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }
};

// Real-time listener for a single order
export const subscribeToOrder = (orderId, callback) => {
  const orderRef = doc(db, 'orders', orderId);
  
  return onSnapshot(orderRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

// Real-time listener for user orders
export const subscribeToUserOrders = (userId, callback) => {
  const ordersRef = collection(db, 'orders');
  // Remove orderBy to avoid index requirement, sort client-side instead
  const q = query(
    ordersRef,
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      // Sort by createdAt descending client-side
      .sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return bTime - aTime; // Descending order
      });
    callback(orders);
  }, (error) => {
    console.error('Error in user orders subscription:', error);
    callback([]);
  });
};

// Real-time listener for active orders (admin)
export const subscribeToActiveOrders = (callback) => {
  const ordersRef = collection(db, 'orders');
  // Use only paymentStatus filter to avoid composite index requirement
  // We'll filter and sort client-side
  const q = query(
    ordersRef,
    where('paymentStatus', '==', 'paid')
  );
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      // Filter for active statuses client-side
      .filter(order => {
        const status = order.status || order.orderStatus;
        return ['new', 'preparing', 'ready', 'placed'].includes(status);
      })
      // Sort by queue number if available, otherwise by createdAt
      .sort((a, b) => {
        if (a.queueNumber && b.queueNumber) {
          return a.queueNumber - b.queueNumber;
        }
        // Fallback to createdAt if queue numbers not available
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return aTime - bTime;
      });
    callback(orders);
  }, (error) => {
    console.error('Error in active orders subscription:', error);
    callback([]);
  });
};

// Real-time listener for all orders (admin)
export const subscribeToAllOrders = (callback) => {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(
    q, 
    (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(orders);
    },
    (error) => {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.warn('Permission denied for all orders. Admin access required.');
        callback([]);
      } else {
        console.error('Error in all orders subscription:', error);
        callback([]);
      }
    }
  );
};

