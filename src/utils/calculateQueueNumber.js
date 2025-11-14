import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Calculate the next queue number for a new order
 * Queue numbers are assigned based on active orders (not failed/expired)
 * @returns {Promise<number>} The next queue number
 */
export const calculateQueueNumber = async () => {
  try {
    const ordersRef = collection(db, 'orders');
    
    // Use only paymentStatus filter to avoid composite index requirement
    // Filter by status client-side
    const q = query(
      ordersRef,
      where('paymentStatus', '==', 'paid')
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // No active orders, start from 1
      return 1;
    }
    
    // Filter for active statuses and get the highest queue number
    let maxQueueNumber = 0;
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      // Only consider orders with active status
      if (['new', 'preparing', 'ready'].includes(data.status) &&
          data.queueNumber && 
          typeof data.queueNumber === 'number' && 
          data.queueNumber > maxQueueNumber) {
        maxQueueNumber = data.queueNumber;
      }
    });
    
    return maxQueueNumber + 1;
  } catch (error) {
    console.error('Error calculating queue number:', error);
    // Fallback: try to get all orders and find max queue number
    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      
      let maxQueueNumber = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.queueNumber && typeof data.queueNumber === 'number' && data.queueNumber > maxQueueNumber) {
          maxQueueNumber = data.queueNumber;
        }
      });
      
      return maxQueueNumber + 1;
    } catch (fallbackError) {
      console.error('Fallback queue number calculation failed:', fallbackError);
    }
    
    // Ultimate fallback: return 1
    return 1;
  }
};

