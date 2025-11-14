import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Custom hook to subscribe to a single order in real-time
 * Uses onSnapshot to get live updates when order status changes
 * 
 * @param {string} orderId - The order document ID
 * @returns {Object} { order, loading, error }
 */
export const useOrder = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    // Create a reference to the order document
    const orderRef = doc(db, 'orders', orderId);

    // Subscribe to real-time updates using onSnapshot
    // onSnapshot automatically updates whenever the document changes
    // This is more efficient than polling and provides instant updates
    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setOrder({ id: snapshot.id, ...snapshot.data() });
          setError(null);
        } else {
          setOrder(null);
          setError('Order not found');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error subscribing to order:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup: unsubscribe when component unmounts or orderId changes
    return () => unsubscribe();
  }, [orderId]);

  return { order, loading, error };
};

export default useOrder;

