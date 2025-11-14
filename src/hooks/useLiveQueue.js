import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { subscribeToAllOrders } from '../firebase/orders';

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
    // Use subscribeToAllOrders which already handles permissions correctly
    // Then filter for paid orders with queue numbers
    const unsubscribe = subscribeToAllOrders((allOrders) => {
      try {
        // Filter to only show paid orders with queue numbers
        let ordersData = allOrders.filter(order => 
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
    });

    // Cleanup: unsubscribe when component unmounts
    return () => unsubscribe();
  }, [options.status]);

  return { orders, loading, error };
};

export default useLiveQueue;

