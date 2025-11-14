import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { createOrder, confirmPayment, markPaymentFailed } from '../../firebase/orders';
import { processPayment } from '../../utils/razorpay';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';

const PaymentModal = ({ cart, totalAmount, onClose }) => {
  const { user, userData } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const hasNavigated = useRef(false);

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    setLoading(true);

    try {
      // Create order in Firestore first
      const orderData = {
        userId: user.uid,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: totalAmount,
        paymentStatus: 'pending',
        orderStatus: 'placed',
        createdAt: new Date()
      };

      const orderResult = await createOrder(orderData);
      
      if (!orderResult.success) {
        toast.error('Failed to create order');
        setLoading(false);
        return;
      }

      // Process payment with Razorpay
      console.log('Starting Razorpay payment...');
      const paymentResult = await processPayment(
        totalAmount,
        orderResult.orderId,
        userData
      );

      console.log('Payment result:', paymentResult);

      if (paymentResult.success) {
        // Prevent multiple navigations
        if (hasNavigated.current) {
          console.log('Already navigated, skipping...');
          return;
        }
        hasNavigated.current = true;
        
        console.log('Payment successful! Confirming payment and assigning queue number...');
        console.log('Order ID:', orderResult.orderId);
        
        // Small delay to ensure order document is fully created in Firestore
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Confirm payment and assign queue number + ETA
        try {
          console.log('Calling confirmPayment for order:', orderResult.orderId);
          const confirmResult = await confirmPayment(orderResult.orderId);
          console.log('confirmPayment result:', confirmResult);
          
          if (confirmResult.success) {
            console.log('Payment confirmed! Queue number:', confirmResult.queueNumber);
            
            // Clear the cart immediately
            clearCart();
            
            // Show success message
            toast.success(`Payment successful! Your queue number is #${confirmResult.queueNumber}`);
            
            // Close modal first (unmount it) - this prevents any popup from showing
            onClose();
            
            // Small delay to ensure Firestore update is processed
            setTimeout(() => {
              // Redirect to order status page to see queue number
              navigate(`/order-status/${orderResult.orderId}`, { replace: true });
            }, 500);
          } else {
            console.error('Payment confirmation failed:', confirmResult.error);
            console.error('Full error details:', confirmResult);
            // Payment succeeded but confirmation failed - mark payment as failed
            try {
              await markPaymentFailed(orderResult.orderId);
            } catch (markError) {
              console.error('Failed to mark payment as failed:', markError);
            }
            toast.error(`Payment succeeded but order confirmation failed: ${confirmResult.error || 'Unknown error'}. Please contact support.`);
            setLoading(false);
            hasNavigated.current = false;
          }
        } catch (confirmError) {
          console.error('Error confirming payment:', confirmError);
          console.error('Error stack:', confirmError.stack);
          // Payment succeeded but confirmation error - mark payment as failed
          try {
            await markPaymentFailed(orderResult.orderId);
          } catch (markError) {
            console.error('Failed to mark payment as failed:', markError);
          }
          toast.error(`Payment succeeded but order confirmation failed: ${confirmError.message || 'Unknown error'}. Please contact support.`);
          setLoading(false);
          hasNavigated.current = false;
        }
      } else {
        console.error('Payment failed:', paymentResult.error);
        // Mark payment as failed in Firestore
        if (orderResult.orderId) {
          try {
            await markPaymentFailed(orderResult.orderId);
          } catch (error) {
            console.error('Error marking payment as failed:', error);
          }
        }
        toast.error(paymentResult.error || 'Payment failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An error occurred during payment');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Summary
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-gray-700 dark:text-gray-300"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Total Amount:
              </span>
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Secure payment powered by Razorpay
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;

