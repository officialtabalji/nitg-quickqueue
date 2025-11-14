import { useState, useEffect } from 'react';
import { subscribeToAllOrders, getActiveOrders } from '../../firebase/orders';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { ShoppingBag, Users, DollarSign, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders((ordersData) => {
      setOrders(ordersData);
      calculateStats(ordersData);
    });

    return () => unsubscribe();
  }, []);

  const calculateStats = (ordersData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = ordersData.filter(order => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      return orderDate >= today;
    });

    const activeOrders = ordersData.filter(
      order => order.orderStatus === 'placed' || order.orderStatus === 'preparing'
    );

    const totalRevenue = todayOrders.reduce((sum, order) => {
      return sum + (order.totalAmount || 0);
    }, 0);

    const avgOrderValue = todayOrders.length > 0
      ? totalRevenue / todayOrders.length
      : 0;

    setStats({
      totalOrders: todayOrders.length,
      activeOrders: activeOrders.length,
      totalRevenue,
      avgOrderValue
    });
  };

  const statCards = [
    {
      title: 'Today\'s Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Today\'s Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(stats.avgOrderValue),
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard Overview
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recent Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.orderStatus === 'ready'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : order.orderStatus === 'preparing'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

