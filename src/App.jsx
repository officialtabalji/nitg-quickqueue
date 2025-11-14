import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import { useState, useEffect } from 'react';
import { handleGoogleRedirect } from './firebase/auth';
import toast from 'react-hot-toast';

// Pages
import Login from './components/Auth/Login';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import FavoritesPage from './pages/FavoritesPage';
import OrderStatus from './pages/OrderStatus';
import LiveQueue from './pages/LiveQueue';
import MockPayment from './pages/MockPayment';
import AdminDashboard from './pages/admin/AdminDashboard';
import MenuManagement from './pages/admin/MenuManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import AnalyticsPage from './pages/admin/AnalyticsPage';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return children;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  // Handle Google redirect on app load
  useEffect(() => {
    handleGoogleRedirect().then((result) => {
      if (result.success && result.user) {
        toast.success('Logged in with Google!');
      }
    });
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router future={{ v7_startTransition: true }}>
            <Toaster position="top-right" />
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Admin Routes - Completely separated with AdminRoute and AdminLayout */}
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route path="" element={<AdminDashboard />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="orders" element={<OrdersManagement />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>
              
              {/* Student Routes - Use regular ProtectedRoute and AppLayout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<MenuPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                        <Route path="/order-status/:orderId" element={<OrderStatus />} />
                        <Route path="/live-queue" element={<LiveQueue />} />
                        <Route path="/mock-payment" element={<MockPayment />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/favorites" element={<FavoritesPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

