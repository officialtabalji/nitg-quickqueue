import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

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
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Check if user is authenticated before subscribing
    if (!user) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    // Create query for orders collection
    // Note: We can't use orderBy('queueNumber') directly because:
    // 1. Some orders might not have queueNumber yet
    // 2. Firestore requires an index for orderBy
    // So we'll fetch all orders and sort client-side
    let ordersQuery = query(collection(db, 'orders'));

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

        // Sort by queueNumber ascending (orders with queueNumber first, then by createdAt)
        ordersData.sort((a, b) => {
          // If both have queueNumber, sort by queueNumber
          if (a.queueNumber && b.queueNumber) {
            return a.queueNumber - b.queueNumber;
          }
          // If only one has queueNumber, prioritize it
          if (a.queueNumber && !b.queueNumber) return -1;
          if (!a.queueNumber && b.queueNumber) return 1;
          // Fallback to createdAt
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
          const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
          return aTime - bTime;
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
  }, [options.status, user, authLoading]);

  return { orders, loading, error };
};

export default useLiveQueue;

