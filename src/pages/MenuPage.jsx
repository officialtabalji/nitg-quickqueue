import { useState, useEffect } from 'react';
import { getAvailableMenuItems } from '../firebase/menu';
import MenuCard from '../components/Menu/MenuCard';
import { Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const MenuPage = () => {
  const { darkMode } = useTheme();
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategory, menuItems]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const items = await getAvailableMenuItems();
      setMenuItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error('Failed to load menu:', error);
      // Don't show error toast, just use empty array
      setMenuItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  // Menu data matching the image
  const menuData = {
    juices: [
      { name: 'Watermelon Juice', price: 40 },
      { name: 'Orange Juice', price: 40 },
      { name: 'Pineapple Juice', price: 40 },
      { name: 'Mixed Fruit Juice', price: 40 },
      { name: 'Mango Juice (Maaza)', price: 20 },
      { name: 'Mango Juice (Slice)', price: 30 },
    ],
    breakfast: [
      { name: 'Poha', price: 80, description: 'Sliced potatoes and onions with three types of cheese' },
      { name: 'Aloo Paratha', price: 90, description: 'Stuffed paratha with spiced potatoes' },
      { name: 'Goan Pav Bhaji', price: 100, description: 'Spiced vegetable curry served with soft bread rolls' },
      { name: 'Sada Dosa', price: 70, description: 'Crispy crepe made from fermented rice and lentil batter' },
      { name: 'Masala Dosa', price: 80, description: 'Crispy dosa filled with spiced potato masala' },
      { name: 'Idli Sambhar', price: 100, description: 'Steamed rice cakes served with lentil curry' },
    ],
    milkshake: [
      { name: 'Banana Milkshake', price: 60 },
      { name: 'Chocolate Milkshake', price: 60 },
      { name: 'Rose Milkshake', price: 60 },
      { name: 'Pista Milkshake', price: 60 },
      { name: 'Vanilla Milkshake', price: 60 },
      { name: 'Oreo Milkshake', price: 60 },
    ],
    beverages: [
      { name: 'Chai', price: 40 },
      { name: 'Cold Coffee', price: 50 },
      { name: 'Filter Coffee', price: 40 },
      { name: 'Coffee', price: 40 },
      { name: 'Cappuccino', price: 30 },
      { name: 'Green Tea', price: 50 },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-gray-900 py-8 px-4 w-full transition-colors duration-200">
      <div className="max-w-7xl mx-auto relative">
        {/* Decorative torn tape */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-30 dark:opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M20,20 L80,20 L75,30 L25,30 Z"
              fill={darkMode ? "#6B4E3D" : "#E8B4B8"}
              stroke={darkMode ? "#8B6F47" : "#D4A5A9"}
              strokeWidth="2"
            />
            <path
              d="M20,20 L15,25 L20,30 L25,30 L30,25 Z"
              fill={darkMode ? "#6B4E3D" : "#E8B4B8"}
            />
            <path
              d="M80,20 L85,25 L80,30 L75,30 L70,25 Z"
              fill={darkMode ? "#6B4E3D" : "#E8B4B8"}
            />
          </svg>
        </div>

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-5xl font-bold text-[#6B4E3D] dark:text-amber-200 mb-2 tracking-wide transition-colors duration-200">MENU</h1>
          <p className="text-2xl text-[#8B6F47] dark:text-amber-300 font-medium italic transition-colors duration-200">NIT'GOA canteen</p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 relative z-10">
          {/* JUICES Section */}
          <div className="relative">
            <div className="absolute -top-8 -left-4 opacity-20 dark:opacity-10">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <path
                  d="M30 10 L35 25 L40 30 L35 35 L30 50 L25 35 L20 30 L25 25 Z"
                  fill={darkMode ? "#F59E0B" : "#FFD700"}
                  stroke={darkMode ? "#D97706" : "#FFA500"}
                  strokeWidth="2"
                />
                <circle cx="30" cy="30" r="8" fill={darkMode ? "#FCD34D" : "#FFE4B5"} />
                <path d="M25 20 L30 15 L35 20" stroke={darkMode ? "#D97706" : "#FFA500"} strokeWidth="2" fill="none" />
              </svg>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border-2 border-[#D4C5B9] dark:border-gray-700 transition-colors duration-200">
              <h2 className="text-2xl font-bold text-[#6B4E3D] dark:text-amber-200 mb-4 pb-2 border-b-2 border-[#D4C5B9] dark:border-gray-700 transition-colors duration-200">
                JUICES
              </h2>
              <div className="space-y-3">
                {menuData.juices.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-[#E8DDD4] dark:border-gray-700 last:border-0 transition-colors duration-200">
                    <span className="text-[#6B4E3D] dark:text-gray-200 font-medium transition-colors duration-200">{item.name}</span>
                    <span className="text-[#8B6F47] dark:text-amber-400 font-bold transition-colors duration-200">Rs {item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BREAKFAST Section */}
          <div className="relative">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border-2 border-[#D4C5B9] dark:border-gray-700 transition-colors duration-200">
              <h2 className="text-2xl font-bold text-[#6B4E3D] dark:text-amber-200 mb-4 pb-2 border-b-2 border-[#D4C5B9] dark:border-gray-700 transition-colors duration-200">
                BREAKFAST
              </h2>
              <div className="space-y-3">
                {menuData.breakfast.map((item, index) => (
                  <div key={index} className="py-2 border-b border-[#E8DDD4] dark:border-gray-700 last:border-0 transition-colors duration-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[#6B4E3D] dark:text-gray-200 font-bold transition-colors duration-200">{item.name}</span>
                      <span className="text-[#8B6F47] dark:text-amber-400 font-bold transition-colors duration-200">Rs {item.price}</span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-[#8B6F47] dark:text-gray-400 italic mt-1 transition-colors duration-200">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MILKSHAKE Section */}
          <div className="relative">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border-2 border-[#D4C5B9] dark:border-gray-700 transition-colors duration-200">
              <h2 className="text-2xl font-bold text-[#6B4E3D] dark:text-amber-200 mb-4 pb-2 border-b-2 border-[#D4C5B9] dark:border-gray-700 transition-colors duration-200">
                MILKSHAKE
              </h2>
              <div className="space-y-3">
                {menuData.milkshake.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-[#E8DDD4] dark:border-gray-700 last:border-0 transition-colors duration-200">
                    <span className="text-[#6B4E3D] dark:text-gray-200 font-medium transition-colors duration-200">{item.name}</span>
                    <span className="text-[#8B6F47] dark:text-amber-400 font-bold transition-colors duration-200">Rs {item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BEVERAGES Section */}
          <div className="relative">
            <div className="absolute -top-6 -right-4 opacity-20 dark:opacity-10">
              <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                <path
                  d="M25 5 L20 15 L15 20 L20 25 L25 45 L30 25 L35 20 L30 15 Z"
                  fill={darkMode ? "#F59E0B" : "#8B6F47"}
                  opacity="0.3"
                />
                <ellipse cx="25" cy="20" rx="8" ry="12" fill={darkMode ? "#6B7280" : "#D4C5B9"} opacity="0.5" />
                <path d="M20 15 Q25 10 30 15" stroke={darkMode ? "#F59E0B" : "#8B6F47"} strokeWidth="2" fill="none" opacity="0.5" />
              </svg>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border-2 border-[#D4C5B9] dark:border-gray-700 transition-colors duration-200">
              <h2 className="text-2xl font-bold text-[#6B4E3D] dark:text-amber-200 mb-4 pb-2 border-b-2 border-[#D4C5B9] dark:border-gray-700 transition-colors duration-200">
                BEVERAGES
              </h2>
              <div className="space-y-3">
                {menuData.beverages.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-[#E8DDD4] dark:border-gray-700 last:border-0 transition-colors duration-200">
                    <span className="text-[#6B4E3D] dark:text-gray-200 font-medium transition-colors duration-200">{item.name}</span>
                    <span className="text-[#8B6F47] dark:text-amber-400 font-bold transition-colors duration-200">Rs {item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Food Images Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto relative z-10">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-lg border-2 border-[#D4C5B9] dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200">
            <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-[#F5E6D3] to-[#E8DDD4] dark:from-gray-700 dark:to-gray-800">
              <img 
                src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop&q=80&auto=format" 
                alt="Dosa with Sambhar and Chutney"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full h-full flex items-center justify-center';
                  fallback.innerHTML = `<p class="text-[#6B4E3D] dark:text-gray-200 font-medium">Dosa with Sambhar</p>`;
                  e.target.parentElement.appendChild(fallback);
                }}
              />
            </div>
            <p className="text-sm text-[#6B4E3D] dark:text-gray-200 font-medium mt-2 text-center transition-colors duration-200">Dosa with Sambhar</p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-lg border-2 border-[#D4C5B9] dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200">
            <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-[#F5E6D3] to-[#E8DDD4] dark:from-gray-700 dark:to-gray-800">
              <img 
                src="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop&q=80&auto=format" 
                alt="Paratha with Chutney and Pickles"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full h-full flex items-center justify-center';
                  fallback.innerHTML = `<p class="text-[#6B4E3D] dark:text-gray-200 font-medium">Paratha with Chutney</p>`;
                  e.target.parentElement.appendChild(fallback);
                }}
              />
            </div>
            <p className="text-sm text-[#6B4E3D] dark:text-gray-200 font-medium mt-2 text-center transition-colors duration-200">Paratha with Chutney</p>
          </div>
        </div>

        {/* Optional: Keep the original menu grid for interactive items */}
        {filteredItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-[#6B4E3D] dark:text-amber-200 mb-6 text-center transition-colors duration-200">Order Now</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
