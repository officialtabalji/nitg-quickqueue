import { useState } from 'react';
import { useOrdersLive } from '../../hooks/useOrdersLive';
import { updateOrderStatus } from '../../firebase/orders';
import { formatCurrency, formatRelativeTime, getStatusColor } from '../../utils/helpers';
import { CheckCircle, Clock, Package, Hash, CreditCard, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { orders, loading } = useOrdersLive();
  const [updatingId, setUpdatingId] = useState(null);

  // Filter orders by status
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

  const completedOrders = orders.filter(order => {
    const status = order.status || order.orderStatus;
    return status === 'completed' || status === 'picked';
  });

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

  const OrderCard = ({ order }) => {
    const status = order.status || order.orderStatus;
    const isUpdating = updatingId === order.id;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-3 border-l-4 border-primary-500">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            {order.queueNumber && (
              <div className="flex items-center space-x-1 mb-1">
                <Hash className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  Queue #{order.queueNumber}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Order #{order.id.slice(0, 8)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {formatCurrency(order.totalAmount || 0)}
            </p>
            {order.estimatedTime && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ETA: {order.estimatedTime} min
              </p>
            )}
          </div>
        </div>

        <div className="mb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {formatRelativeTime(order.createdAt)}
          </p>
          {order.paymentStatus && (
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold ${
                order.paymentStatus === 'paid'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              <CreditCard className="w-3 h-3" />
              <span>{order.paymentStatus.toUpperCase()}</span>
            </span>
          )}
        </div>

        {order.items && order.items.length > 0 && (
          <div className="mb-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Items:
            </p>
            <div className="space-y-0.5">
              {order.items.slice(0, 3).map((item, idx) => (
                <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                  {item.name} × {item.quantity}
                </p>
              ))}
              {order.items.length > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  +{order.items.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          {status === 'new' || status === 'placed' ? (
            <button
              onClick={() => handleStatusUpdate(order.id, 'preparing')}
              disabled={isUpdating}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <Clock className="w-4 h-4" />
              <span>Start Preparing</span>
            </button>
          ) : status === 'preparing' ? (
            <button
              onClick={() => handleStatusUpdate(order.id, 'ready')}
              disabled={isUpdating}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Ready</span>
            </button>
          ) : status === 'ready' ? (
            <button
              onClick={() => handleStatusUpdate(order.id, 'completed')}
              disabled={isUpdating}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete</span>
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  const Column = ({ title, orders, color, icon: Icon }) => (
    <div className="flex-1 min-w-[280px]">
      <div className={`${color} rounded-t-lg p-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-white" />
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold">
          {orders.length}
        </span>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-b-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No orders</p>
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Live Queue Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Real-time order tracking - Drag orders between columns or use buttons to update status
        </p>
      </div>

      {/* Column Layout */}
      <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto">
        <Column
          title="NEW"
          orders={newOrders}
          color="bg-blue-500"
          icon={Package}
        />
        <Column
          title="PREPARING"
          orders={preparingOrders}
          color="bg-yellow-500"
          icon={Clock}
        />
        <Column
          title="READY"
          orders={readyOrders}
          color="bg-green-500"
          icon={CheckCircle}
        />
        <Column
          title="COMPLETED"
          orders={completedOrders.slice(0, 20)}
          color="bg-gray-500"
          icon={CheckCircle}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
