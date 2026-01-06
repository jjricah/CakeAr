// frontend/src/views/buyer/HomeTab.jsx

import React, { useState, useEffect, useMemo } from 'react';
// ✅ FIX 1a: Import the hook
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
// ✅ FIX 2: Use NAMED IMPORTS for stability
import { Check, CakeOutline, CakeSolid } from '../../components/Icons'; 
import ProductCard from '../../components/product/ProductCard';
import FeaturedCarousel from '../../components/product/FeaturedCarousel';

// FIX 1b: Component no longer accepts 'navigate' as a prop
const HomeTab = ({ /* navigate removed from props */ }) => { 
  
  // ✅ FIX 1c: Initialize the navigate function internally
  const navigate = useNavigate();
  
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  // 💡 NEW STATE: For Modals/Overlays and Sorting
  const [sortOption, setSortOption] = useState('newest'); 
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const categories = [
    { id: 'All', label: 'All Cakes' }, 
    { id: 'Birthday', label: 'Birthday' }, 
    { id: 'Wedding', label: 'Wedding' }, 
    { id: 'Bento', label: 'Bento' }, 
    { id: 'Themed', label: 'Themed' }
  ];

  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'priceLow', label: 'Price: Low to High' },
    { id: 'priceHigh', label: 'Price: High to Low' },
  ];
  
  // Map sort option ID to its display label for the button
  const currentSortLabel = useMemo(() => {
    return sortOptions.find(o => o.id === sortOption)?.label || 'Sort';
  }, [sortOption]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        // Ensure products are array and include a default date for sorting stability
        setProducts(res.data.map(p => ({
            ...p,
            createdAt: p.createdAt || new Date(0) // Default to a very old date if missing
        })));

        // Set featured products (e.g., the first 5 newest)
        setFeaturedProducts(res.data.slice(0, 5));
      } catch (error) {
        console.error("Failed to load marketplace:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter and Sort Logic in a Memoized Hook
  const sortedAndFilteredProducts = useMemo(() => {
    let filtered = category === 'All'
      ? products
      : products.filter(product => product.category === category);

    switch (sortOption) {
      case 'priceLow':
        filtered.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'priceHigh':
        filtered.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'newest':
      default:
        // Sort by actual creation date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    
    return filtered;
  }, [products, category, sortOption]);
  
  // --- HANDLERS ---
  const handleCategorySelect = (id) => {
    setCategory(id);
    setShowCategoryModal(false);
  };
  
  const handleSortSelect = (id) => {
    setSortOption(id);
    setShowSortModal(false);
  };


  // --- MODAL RENDER FUNCTION (Aesthetic Overlay) ---

  const renderFilterModal = (show, options, currentSelection, onSelect, onClose, title) => {
      if (!show) return null;
      
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#2C2622] w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-[#C59D5F]">
                <div className="flex justify-between items-center mb-6 border-b border-[#E6DCCF] dark:border-[#4A403A] pb-3">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500">✕</button>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => onSelect(option.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                                option.id === currentSelection 
                                    ? 'bg-[#C59D5F] text-white font-bold' 
                                    : 'bg-[#F9F7F2] dark:bg-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] hover:bg-[#E6DCCF] dark:hover:bg-[#5C5047]'
                            }`}
                        >
                            {option.label}
                            {/* FIX: Use named import for Check */}
                            {option.id === currentSelection && <Check />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      );
  };
  // ----------------------------------------------

  return (
    <div className="space-y-6">
      
      {/* NEW: Featured Products Carousel */}
      {!loading && featuredProducts.length > 0 && (
        <div className="mb-8">
          <FeaturedCarousel title="Featured Cakes" products={featuredProducts} />
        </div>
      )}

      {/* RENDER MODALS */}
      {renderFilterModal(
        showCategoryModal, 
        categories, 
        category, 
        handleCategorySelect, 
        () => setShowCategoryModal(false), 
        "Filter by Category"
      )}
      {renderFilterModal(
        showSortModal, 
        sortOptions, 
        sortOption, 
        handleSortSelect, 
        () => setShowSortModal(false), 
        "Sort Products"
      )}
      
      {/* REFINED HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg bg-gradient-to-r from-[#C59D5F] to-[#8B5E3C] h-48 md:h-64 lg:h-72 group transition-all">
        {/* Background Decor */}
        <div className="absolute -right-8 -bottom-8 transform rotate-12 text-white opacity-20 scale-125 pointer-events-none">
            {/* FIX: Use named import */}
            <CakeOutline />
        </div>
        <div className="absolute top-4 right-20 text-white opacity-10 transform -rotate-12 scale-50 pointer-events-none">
            {/* FIX: Use named import */}
            <CakeSolid />
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-8 z-10">
          <span className="bg-white text-[#8B5E3C] text-[10px] font-bold px-2 py-1 rounded mb-3 tracking-wide w-fit shadow-sm">3D STUDIO</span>
          <h2 className="text-white text-2xl md:text-3xl font-bold mb-2 leading-tight drop-shadow-md">Design Your <br />Dream Cake</h2>
          {/* FIX: This now uses the local navigate function */}
          <button onClick={() => navigate('/cake-builder')} className="mt-4 bg-white text-[#8B5E3C] px-5 py-2.5 rounded-full font-bold w-fit shadow-xl hover:bg-[#F3EFE0] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 text-sm z-20 cursor-pointer">
            CREAKE Now! <span className="text-lg">→</span>
          </button>
        </div>
      </div>
      {/* END REFINED HERO */}

      {/* 💡 NEW: FILTER/SORT BUTTONS (Sticky for better UX) */}
      <div className="sticky top-[72px] bg-[#F9F7F2] dark:bg-[#1E1A17] z-10 py-3 px-4 md:px-6 border-b border-[#E6DCCF] dark:border-[#4A403A] flex justify-between gap-3">
        
        <button 
            onClick={() => setShowCategoryModal(true)} 
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-[#E6DCCF] dark:border-[#4A403A] shadow-sm bg-white dark:bg-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] active:scale-95 transition"
        >
            {/* Filter Icon (Inlined SVG) */}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filter: <span className="text-[#C59D5F]">{category}</span>
        </button>
        
        <button 
            onClick={() => setShowSortModal(true)} 
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-[#E6DCCF] dark:border-[#4A403A] shadow-sm bg-white dark:bg-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] active:scale-95 transition"
        >
            {/* Sort Icon (Inlined SVG) */}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l-4-4m4 4H10" /></svg>
            Sort: <span className="text-[#C59D5F]">{currentSortLabel}</span>
        </button>
      </div>
      {/* END FILTER/SORT BUTTONS */}

      {/* Products */}
      {loading ? (
        <div className="text-center py-20 text-[#B0A69D]"><p className="animate-pulse">Loading fresh cakes...</p></div>
      ) : sortedAndFilteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 pt-4">
          {sortedAndFilteredProducts.map(p => (
            // FIX: ProductCard now handles its own navigation, removing the prop.
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-[#B0A69D]">
          <div className="text-4xl opacity-50 mb-2">🍰</div>
          <p className="text-sm font-bold">No cakes found</p>
        </div>
      )}
    </div>
  );
};

export default HomeTab;