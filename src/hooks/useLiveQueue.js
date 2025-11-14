import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
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
    // Query all orders - Firestore rules should allow authenticated users to read
    // We'll filter client-side for paid orders with queue numbers
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef);

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        try {
          let ordersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Filter to only show paid orders with queue numbers
          ordersData = ordersData.filter(order => 
            order.paymentStatus === 'paid' && 
            order.queueNumber && 
            typeof order.queueNumber === 'number'
          );

          // Filter by status in memory if provided
          if (options.status) {
            ordersData = ordersData.filter(order => {
              const status = order.status || order.orderStatus;
              return status === options.status;
            });
          }

          // Sort by queueNumber ascending (1, 2, 3...)
          ordersData.sort((a, b) => {
            return a.queueNumber - b.queueNumber;
          });

          setOrders(ordersData);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error('Error processing orders:', err);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error subscribing to live queue:', err);
        if (err.code === 'permission-denied') {
          setError('Permission denied. Please ensure Firestore rules allow authenticated users to read orders collection.');
        } else {
          setError(`Error: ${err.message || 'Failed to load queue'}`);
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

