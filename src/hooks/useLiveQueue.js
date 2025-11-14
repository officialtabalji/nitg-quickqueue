import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Custom hook to subscribe to live queue of all orders
 * Orders are sorted by queueNumber ascending to show queue order
 * Uses onSnapshot with query to get real-time updates
 * 
 * @param {Object} options - Optional filters
 * @param {string} options.status - Filter by order status
 * @returns {Object} { orders, loading, error }
 */
export const useLiveQueue = (options = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create query for orders collection
    // Filter by paid orders only (they have queue numbers)
    // Note: We can't use orderBy('queueNumber') directly because:
    // 1. Some orders might not have queueNumber yet
    // 2. Firestore requires an index for orderBy
    // So we'll fetch paid orders and sort client-side
    let ordersQuery = query(
      collection(db, 'orders'),
      where('paymentStatus', '==', 'paid')
    );

    // Subscribe to real-time updates using onSnapshot
    // onSnapshot automatically updates whenever any order in the query changes
    // This provides instant updates across all clients viewing the queue
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        let ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter by status in memory if provided
        if (options.status) {
          ordersData = ordersData.filter(order => {
            const status = order.status || order.orderStatus;
            return status === options.status;
          });
        }

        // Filter to only show orders with queue numbers (active orders)
        ordersData = ordersData.filter(order => order.queueNumber && typeof order.queueNumber === 'number');

        // Sort by queueNumber ascending (1, 2, 3...)
        ordersData.sort((a, b) => {
          return a.queueNumber - b.queueNumber;
        });

        setOrders(ordersData);
        setError(null);
        setLoading(false);
      },
      (err) => {
        // Handle permission errors gracefully
        if (err.code === 'permission-denied') {
          console.warn('Permission denied for live queue. User may need to login.');
          setError('Authentication required to view live queue');
        } else {
          console.error('Error subscribing to live queue:', err);
          setError(err.message);
        }
        setLoading(false);
      }
    );

    // Cleanup: unsubscribe when component unmounts
    return () => unsubscribe();
  }, [options.status]);

  return { orders, loading, error };
};

export default useLiveQueue;

