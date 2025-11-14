import { useOrder } from './useOrder';

/**
 * Alias for useOrder hook - provides real-time live updates for a single order
 * This is a wrapper around useOrder for consistency with useOrdersLive naming
 * 
 * @param {string} orderId - The order document ID
 * @returns {Object} { order, loading, error }
 */
export const useOrderLive = (orderId) => {
  return useOrder(orderId);
};

export default useOrderLive;

