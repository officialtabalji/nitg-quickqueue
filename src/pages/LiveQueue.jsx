import { useNavigate } from 'react-router-dom';
import { useLiveQueue } from '../hooks/useLiveQueue';
import OrderCard from '../components/OrderCard';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

/**
 * LiveQueue Page - Real-time queue list for all orders
 * Shows all orders ordered by queueNumber ascending
 * Updates in real-time using onSnapshot query
 */
const LiveQueue = () => {
  const navigate = useNavigate();
  const { orders, loading, error } = useLiveQueue();

  // Filter orders by status for better organization
  // Support both "status" and "orderStatus" fields
  const activeOrders = orders.filter(order => {
    const status = order.status || order.orderStatus;
    return status === 'placed' || status === 'preparing' || status === 'ready';
  });
  const completedOrders = orders.filter(order => {
    const status = order.status || order.orderStatus;
    return status === 'picked' || status === 'completed';
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading queue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Live Queue
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time order tracking • Updates automatically
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Live</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Orders</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeOrders.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">In Queue</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {orders.filter(o => {
              const s = o.status || o.orderStatus;
              return s === 'placed' || s === 'preparing';
            }).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ready</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {orders.filter(o => (o.status || o.orderStatus) === 'ready').length}
          </p>
        </div>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Active Orders ({activeOrders.length})
          </h2>
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/order-status/${order.id}`)}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <OrderCard order={order} compact />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center mb-8">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No active orders in the queue
          </p>
        </div>
      )}

      {/* Completed Orders (Collapsed) */}
      {completedOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recently Completed ({completedOrders.length})
          </h2>
          <div className="space-y-2">
            {completedOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border-l-4 border-gray-400 opacity-75"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Queue #{order.queueNumber}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {formatRelativeTime(order.createdAt)}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                    {(order.status || order.orderStatus || 'unknown').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveQueue;

