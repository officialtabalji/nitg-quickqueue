import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../firebase/orders';
import { formatCurrency, formatDate } from '../utils/helpers';
import { CheckCircle, Loader2, Home, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        toast.error('Invalid order ID');
        navigate('/orders');
        return;
      }

      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        
        if (orderData) {
          setOrder(orderData);
        } else {
          toast.error('Order not found');
          navigate('/orders');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Package className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Order Not Found
        </h2>
        <button
          onClick={() => navigate('/orders')}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors mt-4"
        >
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your order has been received and is being prepared.
        </p>
      </div>

      {/* Queue Number Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 mb-6 text-center text-white">
        <p className="text-lg font-medium mb-2">Your Queue Number</p>
        <p className="text-6xl font-bold mb-2">{order.queueNumber || 'N/A'}</p>
        <p className="text-primary-100 text-sm">
          Please remember this number for order pickup
        </p>
      </div>

      {/* Order Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Order Details
        </h2>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              order.orderStatus === 'placed' || order.orderStatus === 'preparing'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : order.orderStatus === 'ready'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1) || 'Placed'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Order Date:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
            <span className="font-semibold text-primary-600 dark:text-primary-400 text-lg">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Order Items
          </h3>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="flex-1 flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <Package className="w-5 h-5" />
          <span>View My Orders</span>
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Back to Menu</span>
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

