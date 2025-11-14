import { useState, useEffect } from 'react';
import { subscribeToAllOrders } from '../firebase/orders';

/**
 * Custom hook to subscribe to all orders in real-time
 * Returns orders sorted by queueNumber for admin dashboard
 * 
 * @returns {Object} { orders, loading, error }
 */
export const useOrdersLive = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders((ordersData) => {
      // Sort by queueNumber ascending (if available), then by createdAt
      const sortedOrders = [...ordersData].sort((a, b) => {
        // First, sort by queueNumber if both have it
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
      
      setOrders(sortedOrders);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  return { orders, loading, error };
};

export default useOrdersLive;

