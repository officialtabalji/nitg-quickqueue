import { useState, useEffect } from 'react';
import { subscribeToAllOrders, updateOrderStatus } from '../../firebase/orders';
import { formatDate, formatRelativeTime, getStatusColor } from '../../utils/helpers';
import { formatCurrency } from '../../utils/helpers';
import { CheckCircle, Clock, Package, ArrowRight, CreditCard, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    // Subscribe to all orders for admin to see everything
    const unsubscribe = subscribeToAllOrders((ordersData) => {
      // Sort by createdAt (oldest first) for queue order
      const sortedOrders = [...ordersData].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateA - dateB;
      });
      setOrders(sortedOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        toast.success(`Order status updated to ${newStatus}!`);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('An error occurred');
    } finally {
      setUpdatingId(null);
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

  // Filter orders by status for better organization
  // Support both "status" and "orderStatus" fields
  const activeOrders = orders.filter(order => {
    const status = order.status || order.orderStatus;
    return status === 'placed' || status === 'preparing';
  });
  const readyOrders = orders.filter(order => {
    const status = order.status || order.orderStatus;
    return status === 'ready';
  });
  const completedOrders = orders.filter(order => {
    const status = order.status || order.orderStatus;
    return status === 'picked' || status === 'completed';
  });

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Order Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage all orders. Update status: Preparing → Ready → Picked
        </p>
      </div>

      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Active Orders ({activeOrders.length})
          </h2>
          <div className="space-y-4">
            {activeOrders.map((order, index) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-yellow-500"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2 flex-wrap">
                      {order.queueNumber && (
                        <div className="flex items-center space-x-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">
                          <Hash className="w-4 h-4" />
                          <span className="text-sm font-bold">Queue #{order.queueNumber}</span>
                        </div>
                      )}
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Order #{order.id.slice(0, 8)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.status || order.orderStatus
                        )}`}
                      >
                        {(order.status || order.orderStatus || 'pending').toUpperCase()}
                      </span>
                      {order.paymentStatus && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                            order.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : order.paymentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>{order.paymentStatus.toUpperCase()}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <p>
                        Created: {formatDate(order.createdAt)} ({formatRelativeTime(order.createdAt)})
                      </p>
                      {order.estimatedTime && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>ETA: {order.estimatedTime} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 lg:mt-0">
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {formatCurrency(order.totalAmount || 0)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Items ({order.items?.length || 0}):
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
                  {((order.status || order.orderStatus) === 'placed') && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'preparing')}
                      disabled={updatingId === order.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Start Preparing</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  {((order.status || order.orderStatus) === 'preparing') && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'ready')}
                      disabled={updatingId === order.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Ready</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ready Orders Section */}
      {readyOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Ready for Pickup ({readyOrders.length})
          </h2>
          <div className="space-y-4">
            {readyOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2 flex-wrap">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Queue #{order.queueNumber || 'N/A'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Order ID: #{order.id.slice(0, 8)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Created: {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="mt-2 lg:mt-0">
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {formatCurrency(order.totalAmount || 0)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Items ({order.items?.length || 0}):
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

                <div className="mt-4">
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'picked')}
                    disabled={updatingId === order.id}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Picked</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Orders Section */}
      {completedOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Completed Orders ({completedOrders.length})
          </h2>
          <div className="space-y-2">
            {completedOrders.slice(0, 10).map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-gray-400"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Queue #{order.queueNumber || 'N/A'} - Order #{order.id.slice(0, 8)}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(order.totalAmount || 0)}
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
          <Package className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No orders yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Orders will appear here when customers place them
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;

