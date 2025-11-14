import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';
import { subscribeToMenuItems, deleteMenuItem, toggleItemAvailability } from '../../firebase/menu';
import { deleteImage } from '../../firebase/storage';
import AddItemForm from '../../components/admin/AddItemForm';
import EditItemModal from '../../components/admin/EditItemModal';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Real-time subscription to menu items
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToMenuItems((items) => {
      setMenuItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddSuccess = () => {
    // Menu will update automatically via onSnapshot
    setShowAddModal(false);
  };

  const handleEditSuccess = () => {
    // Menu will update automatically via onSnapshot
    setEditingItem(null);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(item.id);

    try {
      // Delete image from Storage if it exists
      if (item.imageUrl) {
        await deleteImage(item.imageUrl);
      }

      // Delete document from Firestore
      const result = await deleteMenuItem(item.id);

      if (result.success) {
        toast.success('Menu item deleted successfully!');
        // Menu will update automatically via onSnapshot
      } else {
        toast.error(result.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete item. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailability = async (item) => {
    setTogglingId(item.id);

    try {
      const newAvailability = !item.available;
      const result = await toggleItemAvailability(item.id, newAvailability);

      if (result.success) {
        toast.success(`Item ${newAvailability ? 'enabled' : 'disabled'} successfully!`);
        // Menu will update automatically via onSnapshot
      } else {
        toast.error(result.error || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update availability. Please try again.');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Menu Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your menu items. Changes are synced in real-time.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Menu Items Grid */}
      {menuItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            No menu items yet
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${
                !item.available ? 'opacity-75' : ''
              }`}
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <p className="text-sm">No Image</p>
                    </div>
                  </div>
                )}
                {!item.available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">Unavailable</span>
                  </div>
                )}
                {/* Availability Badge */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.available
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {item.name}
                </h3>
                {item.category && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {item.category}
                  </p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(item.price)}
                  </p>
                  {item.avgPrepTime && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ⏱️ {item.avgPrepTime} min
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                    title="Edit item"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    disabled={togglingId === item.id}
                    className={`p-2 rounded-lg transition-colors text-sm font-medium ${
                      item.available
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={item.available ? 'Hide item' : 'Show item'}
                  >
                    {togglingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : item.available ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete item"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <AddItemForm
            onClose={() => setShowAddModal(false)}
            onSuccess={handleAddSuccess}
          />
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default MenuManagement;
