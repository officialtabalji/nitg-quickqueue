import { formatCurrency, formatRelativeTime, getStatusColor } from '../utils/helpers';
import { Clock, CheckCircle, Package } from 'lucide-react';

/**
 * Reusable OrderCard component for displaying order information
 * Used in LiveQueue, OrderStatus, and AdminOrders pages
 * 
 * @param {Object} order - Order data object
 * @param {boolean} showUserInfo - Whether to show user information (admin only)
 * @param {Function} onStatusChange - Callback when status changes (admin only)
 * @param {boolean} compact - Compact view for list items
 */
const OrderCard = ({ 
  order, 
  showUserInfo = false, 
  onStatusChange = null,
  compact = false 
}) => {
  if (!order) return null;

  // Support both "status" and "orderStatus" fields for compatibility
  const currentStatus = order.status || order.orderStatus || 'placed';

  const statusColors = {
    'placed': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'preparing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'ready': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'picked': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'completed': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };

  const statusIcons = {
    'placed': Clock,
    'preparing': Clock,
    'ready': CheckCircle,
    'picked': Package,
    'completed': Package
  };

  const StatusIcon = statusIcons[currentStatus] || Package;
  const statusColor = statusColors[currentStatus] || statusColors['placed'];

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-primary-500 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  #{order.queueNumber || 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <StatusIcon className="w-4 h-4 text-gray-500" />
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                  {currentStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {order.items?.slice(0, 2).map(item => item.name).join(', ')}
                {order.items?.length > 2 && ` +${order.items.length - 2} more`}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {formatRelativeTime(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(order.totalAmount || 0)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-primary-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                #{order.queueNumber || 'N/A'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order #{order.id?.slice(0, 8) || 'N/A'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatRelativeTime(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <StatusIcon className="w-5 h-5 text-gray-500" />
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
              {currentStatus.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(order.totalAmount || 0)}
          </p>
        </div>
      </div>

      {showUserInfo && order.userId && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            User ID: <span className="font-mono text-xs">{order.userId}</span>
          </p>
        </div>
      )}

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          Items ({order.items?.length || 0}):
        </h4>
        <div className="space-y-2">
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <div className="flex items-center space-x-3">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(item.price)} × {item.quantity}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {onStatusChange && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {currentStatus === 'placed' && (
              <button
                onClick={() => onStatusChange(order.id, 'preparing')}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Start Preparing
              </button>
            )}
            {currentStatus === 'preparing' && (
              <button
                onClick={() => onStatusChange(order.id, 'ready')}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Mark as Ready
              </button>
            )}
            {currentStatus === 'ready' && (
              <button
                onClick={() => {
                  if (window.confirm('Mark this order as picked?')) {
                    onStatusChange(order.id, 'picked');
                  }
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Mark as Picked
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;

