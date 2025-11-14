import { createOrder } from '../firebase/orders';

/**
 * Order Service - Helper functions for order operations
 * Handles order creation with queue numbers and device tokens
 */

/**
 * Create order with queue number using Firestore transaction
 * 
 * Transactions ensure atomic operations:
 * 1. Atomically increments /meta/counters.orderCounter
 * 2. Assigns unique queueNumber to order
 * 3. Creates order document in /orders/{orderId}
 * 4. Creates duplicate in /users/{uid}/orders/{orderId}
 * 
 * This prevents race conditions where multiple orders could get the same queue number
 * 
 * @param {Array} cartItems - Array of cart items
 * @param {Object} user - Firebase auth user object
 * @param {string} deviceToken - FCM device token for push notifications (optional)
 * @returns {Promise<Object>} { success, orderId, queueNumber, error }
 */
export const createOrderWithQueue = async (cartItems, user, deviceToken = null) => {
  if (!user || !user.uid) {
    return { success: false, error: 'User not authenticated' };
  }

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: 'Cart is empty' };
  }

  // Calculate total amount
  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // Prepare order data matching Firestore schema
  const orderData = {
    userId: user.uid,
    items: cartItems.map(item => ({
      itemId: item.id,
      name: item.name,
      qty: item.quantity,
      price: item.price,
      // Optional fields
      imageUrl: item.imageUrl || null,
      category: item.category || null
    })),
    totalAmount: totalAmount,
    status: 'placed', // Initial status: "placed" | "preparing" | "ready" | "picked"
    // queueNumber will be assigned by transaction
    // createdAt will be set by serverTimestamp
    deviceToken: deviceToken || null // FCM token for push notifications
  };

  // Use existing createOrder function which handles transaction
  const result = await createOrder(orderData);

  return result;
};

/**
 * Example usage:
 * 
 * import { createOrderWithQueue } from '../services/orderService';
 * import { useAuth } from '../context/AuthContext';
 * import { useCart } from '../context/CartContext';
 * 
 * const { user } = useAuth();
 * const { cart } = useCart();
 * const deviceToken = await getFCMToken(); // Get from user document or request permission
 * 
 * const result = await createOrderWithQueue(cart, user, deviceToken);
 * if (result.success) {
 *   console.log(`Order created with queue number: ${result.queueNumber}`);
 *   navigate(`/order-status/${result.orderId}`);
 * }
 */

export default {
  createOrderWithQueue
};

