import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';

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
    // Check if user is authenticated before subscribing
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    // Create query for orders collection
    // Order by queueNumber ascending to show queue order (1, 2, 3...)
    let ordersQuery = query(
      collection(db, 'orders'),
      orderBy('queueNumber', 'asc')
    );

    // If status filter is provided, add where clause
    // Note: Firestore requires composite index for multiple where clauses
    // For now, we'll filter in memory if status is provided
    // In production, you might want to create a composite index

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
          ordersData = ordersData.filter(order => order.orderStatus === options.status);
        }

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

