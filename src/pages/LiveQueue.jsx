import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useLiveQueue } from '../hooks/useLiveQueue';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime, getStatusColor } from '../utils/helpers';
import { formatCurrency } from '../utils/helpers';
import { ArrowLeft, Loader2, RefreshCw, Hash, Clock, CheckCircle, Package, Radio } from 'lucide-react';

/**
 * LiveQueue Page - Real-time queue list for all orders
 * Shows all paid orders with queue numbers, ordered by queueNumber ascending
 * Updates in real-time using onSnapshot query
 * Highlights user's order when redirected after payment
 */
const LiveQueue = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { orders, loading, error } = useLiveQueue();
  const highlightOrderId = searchParams.get('highlight');
  const highlightedOrderRef = useRef(null);

  // Scroll to highlighted order when it loads
  useEffect(() => {
    if (highlightOrderId && highlightedOrderRef.current) {
      setTimeout(() => {
        highlightedOrderRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500);
    }
  }, [highlightOrderId, orders]);

  // Debug logging
  useEffect(() => {
    console.log('LiveQueue component state:', { orders: orders.length, loading, error });
  }, [orders, loading, error]);

  // Filter orders by status for better organization
  const newOrders = orders.filter(order => {
    const status = order.status || order.orderStatus;
    return status === 'new' || status === 'placed';
  });

  const preparingOrders = orders.filter(order => {
    const status = order.status || order.orderStatus;
    return status === 'preparing';
  });

  const readyOrders = orders.filter(order => {
    const status = order.status || order.orderStatus;
    return status === 'ready';
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

  const QueueCard = ({ order, index }) => {
    const status = order.status || order.orderStatus;
    const isHighlighted = order.id === highlightOrderId;
    const isUserOrder = user && order.userId === user.uid;
    
    const statusColors = {
      'new': 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
      'placed': 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
      'preparing': 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      'ready': 'border-green-500 bg-green-50 dark:bg-green-900/20',
      'completed': 'border-gray-400 bg-gray-50 dark:bg-gray-800',
    };
    const borderColor = statusColors[status] || 'border-gray-300 bg-white dark:bg-gray-800';
    
    // Add highlight styling for user's order or highlighted order
    const highlightClass = isHighlighted || isUserOrder 
      ? 'ring-2 ring-primary-500 ring-opacity-50 shadow-lg' 
      : '';

    return (
      <div
        ref={isHighlighted ? highlightedOrderRef : null}
        className={`${borderColor} ${highlightClass} rounded-lg shadow-md p-4 mb-3 border-l-4 cursor-pointer hover:shadow-lg transition-all relative`}
        onClick={() => navigate(`/order-status/${order.id}`)}
      >
        {/* Highlight indicator */}
        {(isHighlighted || isUserOrder) && (
          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
            <Radio className="w-3 h-3" />
            <span>{isHighlighted ? 'Your Order' : 'My Order'}</span>
          </div>
        )}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center space-x-2">
                <Hash className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  #{order.queueNumber}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}
              >
                {status?.toUpperCase() || 'PENDING'}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
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
            {order.items && order.items.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Items:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {order.items.slice(0, 2).map(item => `${item.name} × ${item.quantity}`).join(', ')}
                  {order.items.length > 2 && ` +${order.items.length - 2} more`}
                </p>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(order.totalAmount || 0)}
            </p>
          </div>
        </div>
      </div>
    );
  };

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
              Live Queue Tracking
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time order tracking • Updates automatically
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-400">
          <div className="relative">
            <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <RefreshCw className="w-4 h-4 animate-spin" />
          </div>
          <span className="font-semibold">Live</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total in Queue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">New Orders</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{newOrders.length}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Preparing</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{preparingOrders.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Ready</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{readyOrders.length}</p>
        </div>
      </div>

      {/* Queue List - All orders in queue order */}
      {orders.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>All Orders ({orders.length} active)</span>
          </h2>
          
          {/* Status-based sections */}
          {newOrders.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>New Orders ({newOrders.length})</span>
              </h3>
              <div className="space-y-2">
                {newOrders.map((order) => (
                  <QueueCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}

          {preparingOrders.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Preparing ({preparingOrders.length})</span>
              </h3>
              <div className="space-y-2">
                {preparingOrders.map((order) => (
                  <QueueCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}

          {readyOrders.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Ready for Pickup ({readyOrders.length})</span>
              </h3>
              <div className="space-y-2">
                {readyOrders.map((order) => (
                  <QueueCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}

          {/* All orders in queue order (alternative view) */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Hash className="w-5 h-5" />
              <span>Complete Queue (Sorted by Queue Number)</span>
            </h3>
            <div className="space-y-2">
              {orders.map((order, index) => (
                <QueueCard key={order.id} order={order} index={index} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center mb-8">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            No orders in the queue yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            Orders will appear here after payment is confirmed
          </p>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Make sure to complete payment for your order. 
              Once payment is confirmed, your order will appear here with a queue number.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveQueue;
