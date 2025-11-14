import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { subscribeToUserOrders } from '../firebase/orders';
import { formatDate, formatRelativeTime, getStatusColor, getStatusIcon } from '../utils/helpers';
import { formatCurrency } from '../utils/helpers';
import { Clock, Package, Hash, ArrowRight } from 'lucide-react';

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserOrders(user.uid, (ordersData) => {
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Package className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          No orders yet
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Your order history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        My Orders
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Order #{order.id.slice(0, 8)}
                  </span>
                  {order.queueNumber && (
                    <div className="flex items-center space-x-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">
                      <Hash className="w-4 h-4" />
                      <span className="text-sm font-bold">Queue #{order.queueNumber}</span>
                    </div>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      order.status || order.orderStatus
                    )}`}
                  >
                    {getStatusIcon(order.status || order.orderStatus)} {(order.status || order.orderStatus || 'pending').toUpperCase().replace('_', ' ')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatRelativeTime(order.createdAt)}</span>
                  </div>
                  {order.estimatedTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>ETA: {order.estimatedTime} min</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 sm:mt-0 flex items-center space-x-4">
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(order.totalAmount)}
                </span>
                <button
                  onClick={() => navigate(`/order-status/${order.id}`)}
                  className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  <span className="text-sm font-medium">View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Items:
              </h3>
              <div className="space-y-1">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {order.paymentStatus && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Payment: <span className={`font-semibold ${
                    order.paymentStatus === 'paid' ? 'text-green-600 dark:text-green-400' :
                    order.paymentStatus === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>{order.paymentStatus.toUpperCase()}</span>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;

