import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Calculate estimated time for order preparation
 * @param {string} orderId - The order ID to calculate ETA for
 * @param {number} avgPrepTimePerOrder - Average preparation time per order in minutes (default: 4)
 * @returns {Promise<number>} Estimated time in minutes
 */
export const calculateETA = async (orderId, avgPrepTimePerOrder = 4) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const currentOrderDoc = await getDoc(orderRef);
    
    if (!currentOrderDoc.exists()) {
      return avgPrepTimePerOrder;
    }
    
    const currentOrder = currentOrderDoc.data();
    const currentOrderTime = currentOrder.createdAt;
    
    const ordersRef = collection(db, 'orders');
    
    // Get all paid orders (filter client-side to avoid index requirement)
    // We'll filter by status and sort by createdAt client-side
    const q = query(
      ordersRef,
      where('paymentStatus', '==', 'paid')
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // No pending orders, return base prep time
      return avgPrepTimePerOrder;
    }
    
    // Filter and count orders before this one
    let ordersBefore = 0;
    const currentTime = currentOrderTime?.toMillis ? currentOrderTime.toMillis() : (currentOrderTime || 0);
    
    snapshot.docs.forEach((doc) => {
      const orderData = doc.data();
      // Only count orders that:
      // 1. Are not the current order
      // 2. Have status 'new' or 'preparing'
      // 3. Were created before this order
      if (doc.id !== orderId && 
          ['new', 'preparing'].includes(orderData.status) &&
          orderData.createdAt) {
        const orderTime = orderData.createdAt.toMillis ? orderData.createdAt.toMillis() : orderData.createdAt;
        if (orderTime < currentTime) {
          ordersBefore++;
        }
      }
    });
    
    // Calculate: (orders before * avg time) + base prep time
    const estimatedTime = ordersBefore * avgPrepTimePerOrder + avgPrepTimePerOrder;
    
    return Math.max(estimatedTime, avgPrepTimePerOrder); // At least base prep time
  } catch (error) {
    console.error('Error calculating ETA:', error);
    // Fallback: return base prep time
    return avgPrepTimePerOrder;
  }
};

