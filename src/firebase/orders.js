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

// Create a new order with transaction-based queue number
export const createOrder = async (orderData) => {
  try {
    // Use transaction to generate unique queue number
    const result = await runTransaction(db, async (transaction) => {
      // Get or create counter document
      const counterRef = doc(db, 'meta', 'counters');
      const counterDoc = await transaction.get(counterRef);
      
      let queueNumber;
      if (!counterDoc.exists()) {
        // Initialize counter if it doesn't exist
        queueNumber = 1;
        transaction.set(counterRef, { orderCounter: 1 });
      } else {
        // Increment counter
        queueNumber = (counterDoc.data().orderCounter || 0) + 1;
        transaction.update(counterRef, { orderCounter: queueNumber });
      }

      // Create order document
      const ordersRef = collection(db, 'orders');
      const orderDocRef = doc(ordersRef);
      
      // Ensure status field is set (use orderStatus if status not provided for backward compatibility)
      const status = orderData.status || orderData.orderStatus || 'placed';
      
      const orderDataWithQueue = {
        ...orderData,
        status, // Use "status" as primary field
        orderStatus: status, // Keep orderStatus for backward compatibility
        queueNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      transaction.set(orderDocRef, orderDataWithQueue);

      // Create duplicate in user's orders subcollection
      const userOrdersRef = collection(db, 'users', orderData.userId, 'orders');
      const userOrderDocRef = doc(userOrdersRef, orderDocRef.id);
      transaction.set(userOrderDocRef, orderDataWithQueue);

      return { orderId: orderDocRef.id, queueNumber };
    });

    return { success: true, orderId: result.orderId, queueNumber: result.queueNumber };
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

// Get user orders
export const getUserOrders = async (userId) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    // Fetch all orders and filter in memory to avoid index requirement
    const q = query(ordersRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(order => {
        const status = order.status || order.orderStatus;
        return status === 'placed' || status === 'preparing';
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
      status, // Primary field
      orderStatus: status, // Keep for backward compatibility
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }
};

// Real-time listener for user orders
export const subscribeToUserOrders = (userId, callback) => {
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(orders);
  });
};

// Real-time listener for active orders (admin)
export const subscribeToActiveOrders = (callback) => {
  const ordersRef = collection(db, 'orders');
  // Note: Firestore 'in' queries with orderBy require a composite index
  // For now, we'll fetch all and filter, or use separate queries
  // This avoids the index requirement but is less efficient
  const q = query(
    ordersRef,
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(order => {
        const status = order.status || order.orderStatus;
        return status === 'placed' || status === 'preparing';
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
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(orders);
  });
};

