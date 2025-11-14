import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { addToFavorites, removeFromFavorites, isFavorite } from '../../firebase/favorites';
import { Heart, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';

const MenuCard = ({ item }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [favorite, setFavorite] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      if (user) {
        const fav = await isFavorite(user.uid, item.id);
        setFavorite(fav);
      }
      setCheckingFavorite(false);
    };
    checkFavorite();
  }, [user, item.id]);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      if (favorite) {
        await removeFromFavorites(user.uid, item.id);
        setFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await addToFavorites(user.uid, item.id);
        setFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleAddToCart = () => {
    if (!item.available) {
      toast.error('This item is currently unavailable');
      return;
    }
    addToCart(item);
    setAdded(true);
    toast.success('Added to cart!');
    setTimeout(() => setAdded(false), 2000);
  };

  if (!item.available) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden opacity-60 relative">
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Out of Stock
            </span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
            <button
              onClick={handleFavorite}
              className={`p-1 rounded-full transition-colors ${
                favorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.category}</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(item.price)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <button
          onClick={handleFavorite}
          className={`absolute top-2 right-2 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md transition-colors ${
            favorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          }`}
          disabled={checkingFavorite}
        >
          <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.category}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(item.price)}
          </span>
          <button
            onClick={handleAddToCart}
            className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;

