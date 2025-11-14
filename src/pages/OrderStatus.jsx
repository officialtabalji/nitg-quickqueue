import { useParams, useNavigate } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';
import OrderCard from '../components/OrderCard';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

/**
 * OrderStatus Page - Real-time single order view
 * Shows live status updates using onSnapshot
 * Includes optional speech synthesis alert when order is ready
 */
const OrderStatus = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { order, loading, error } = useOrder(orderId);
  const hasAnnouncedReady = useRef(false);

  // Speech synthesis alert when order becomes ready
  useEffect(() => {
    const currentStatus = order?.status || order?.orderStatus;
    
    if (currentStatus === 'ready' && !hasAnnouncedReady.current) {
      hasAnnouncedReady.current = true;
      
      // Check if browser supports speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Your order number ${order.queueNumber} is ready for pickup!`
        );
        utterance.volume = 1;
        utterance.rate = 1;
        utterance.pitch = 1;
        
        // Try to use a pleasant voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || voice.name.includes('Samantha')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        window.speechSynthesis.speak(utterance);
        toast.success(`Order #${order.queueNumber} is ready! 🎉`);
      } else {
        toast.success(`Order #${order.queueNumber} is ready! 🎉`);
      }
    }

    // Reset announcement flag if order status changes back
    if (currentStatus !== 'ready') {
      hasAnnouncedReady.current = false;
    }
  }, [order?.status, order?.orderStatus, order?.queueNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error || 'The order you are looking for does not exist.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Go to Menu
          </button>
        </div>
      </div>
    );
  }

  // Status-specific messages and colors
  const currentStatus = order.status || order.orderStatus || 'placed';
  const statusMessages = {
    'placed': {
      message: 'Your order has been placed and is in the queue.',
      color: 'text-blue-600 dark:text-blue-400'
    },
    'preparing': {
      message: 'Your order is being prepared. Please wait...',
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    'ready': {
      message: '🎉 Your order is ready for pickup!',
      color: 'text-green-600 dark:text-green-400'
    },
    'picked': {
      message: 'Order has been picked up. Thank you!',
      color: 'text-gray-600 dark:text-gray-400'
    },
    'completed': {
      message: 'Order completed. Thank you!',
      color: 'text-gray-600 dark:text-gray-400'
    }
  };

  const statusInfo = statusMessages[currentStatus] || statusMessages['placed'];

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Order Status
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time updates
          </p>
        </div>
      </div>

      {/* Status Message */}
      <div className={`mb-6 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md ${statusInfo.color}`}>
        <p className="text-lg font-semibold">{statusInfo.message}</p>
      </div>

      {/* Order Card */}
      <OrderCard order={order} />

      {/* Additional Actions */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={() => navigate('/live-queue')}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          View Live Queue
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          My Orders
        </button>
      </div>
    </div>
  );
};

export default OrderStatus;

