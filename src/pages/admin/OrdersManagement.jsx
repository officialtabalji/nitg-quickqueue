import { useState, useEffect } from 'react';
import { subscribeToActiveOrders, updateOrderStatus } from '../../firebase/orders';
import { formatDate, formatRelativeTime, getStatusColor } from '../../utils/helpers';
import { formatCurrency } from '../../utils/helpers';
import { CheckCircle, Clock, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToActiveOrders((ordersData) => {
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        toast.success('Order status updated!');
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

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
          No active orders
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          New orders will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Active Orders
      </h1>

      <div className="space-y-4">
        {orders.map((order, index) => (
          <div
            key={order.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order #{order.id.slice(0, 8)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Position: #{index + 1} in queue
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(order.createdAt)}
                </p>
              </div>
              <div className="mt-2 lg:mt-0">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Items:
              </h3>
              <div className="space-y-1">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
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

            <div className="flex flex-wrap gap-2">
              {order.orderStatus === 'placed' && (
                <button
                  onClick={() => handleStatusUpdate(order.id, 'preparing')}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  <span>Start Preparing</span>
                </button>
              )}
              {order.orderStatus === 'preparing' && (
                <button
                  onClick={() => handleStatusUpdate(order.id, 'ready')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Ready</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersManagement;

