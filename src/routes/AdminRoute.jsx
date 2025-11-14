import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute - Protects admin routes by checking user role
 * Only users with role: "admin" in /users/{uid} can access
 * Others are redirected to "/"
 */
const AdminRoute = ({ children }) => {
  const { user, userData, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  // Role is stored in /users/{uid} document with field "role"
  if (userData?.role !== 'admin') {
    // Redirect non-admin users to home page
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has admin role
  return children;
};

export default AdminRoute;

