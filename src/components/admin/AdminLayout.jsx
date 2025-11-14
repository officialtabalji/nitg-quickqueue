import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';

/**
 * AdminLayout - Layout wrapper for all admin pages
 * Includes sidebar navigation and header
 * Uses <Outlet /> for nested routes
 */
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:ml-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Admin Dashboard
              </h2>
            </div>
          </div>
        </header>

        {/* Page Content - Outlet renders nested admin routes */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

