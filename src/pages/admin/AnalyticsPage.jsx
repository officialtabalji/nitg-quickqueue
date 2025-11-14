import { useState, useEffect } from 'react';
import { subscribeToAllOrders } from '../../firebase/orders';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders((ordersData) => {
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Process data for charts
  const processData = () => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const ordersByDay = last7Days.map((day, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      return orders.filter(order => {
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        return orderDate >= date && orderDate < nextDay;
      }).length;
    });

    const revenueByDay = last7Days.map((day, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      return orders
        .filter(order => {
          const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
          return orderDate >= date && orderDate < nextDay;
        })
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    });

    // Orders by hour (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = orders.filter(order => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      return orderDate >= today && orderDate < tomorrow;
    });

    const ordersByHour = Array.from({ length: 24 }, (_, hour) => {
      return todayOrders.filter(order => {
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        return orderDate.getHours() === hour;
      }).length;
    });

    const hourLabels = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      return `${hour}:00`;
    });

    // Popular items
    const itemCounts = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    const popularItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Today's stats
    const todayStats = {
      totalOrders: todayOrders.length,
      totalRevenue: todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      avgOrderValue: todayOrders.length > 0
        ? todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / todayOrders.length
        : 0
    };

    return {
      ordersByDay,
      revenueByDay,
      popularItems,
      last7Days,
      ordersByHour,
      hourLabels,
      todayStats
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { ordersByDay, revenueByDay, popularItems, last7Days, ordersByHour, hourLabels, todayStats } = processData();

  const ordersChartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Orders',
        data: ordersByDay,
        backgroundColor: 'rgba(20, 184, 166, 0.5)',
        borderColor: 'rgba(20, 184, 166, 1)',
        borderWidth: 2
      }
    ]
  };

  const revenueChartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Revenue (₹)',
        data: revenueByDay,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };

  const popularItemsData = {
    labels: popularItems.map(item => item[0]),
    datasets: [
      {
        data: popularItems.map(item => item[1]),
        backgroundColor: [
          'rgba(20, 184, 166, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(251, 146, 60, 0.8)'
        ]
      }
    ]
  };

  const ordersByHourData = {
    labels: hourLabels,
    datasets: [
      {
        label: 'Orders',
        data: ordersByHour,
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Real-time insights and performance metrics
        </p>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Today's Orders</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.totalOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Today's Revenue</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(todayStats.totalRevenue)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Order Value</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(todayStats.avgOrderValue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Orders Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Orders (Last 7 Days)
          </h2>
          <div className="h-64">
            <Bar data={ordersChartData} options={chartOptions} />
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Revenue (Last 7 Days)
          </h2>
          <div className="h-64">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Orders by Hour */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Orders by Hour (Today)
        </h2>
        <div className="h-64">
          <Line data={ordersByHourData} options={chartOptions} />
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Most Popular Items
        </h2>
        <div className="h-64">
          <Doughnut data={popularItemsData} options={chartOptions} />
        </div>
        <div className="mt-4 space-y-2">
          {popularItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <span className="text-gray-900 dark:text-white">{item[0]}</span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                {item[1]} orders
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

