// frontend/src/components/MainLayout.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import api from '../services/api';
import logo from '../assets/creake_logo.png';
import * as Icons from './Icons';

const MainLayout = ({ children, activeTab, setActiveTab, showNav = true, fullWidth = false }) => {
  const { user } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  
  // --- NOTIFICATION STATE (Moved here so it works everywhere) ---
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if(!user) return;
      try {
        const res = await api.get('/notifications');
        setUnreadCount(res.data.filter(n => !n.read).length);
      } catch (err) {
        console.log("Notif check failed", err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Icons.Home },
    { id: 'search', label: 'Search', icon: Icons.Search },
    { id: 'message', label: 'Message', icon: Icons.Message },
    { id: 'profile', label: 'Me', icon: Icons.User },
  ];

  return (
    // UPDATED BG CLASS to be consistent with index.css
    <div className="min-h-screen font-sans selection:bg-[#C59D5F] selection:text-white transition-colors duration-300 bg-[#F5F2E9] dark:bg-[#221C18] flex flex-col">
      
      {/* --- HEADER --- */}
      {showNav && (
      <header className="fixed top-0 left-0 w-full bg-[#F3EFE0]/95 dark:bg-[#2C2622]/95 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center transition-colors duration-300 border-b border-[#E6DCCF] dark:border-[#4A403A]">
        <img src={logo} alt="CREAKE" className="h-8 w-auto" />
        
        {/* 🌟 NEW: Desktop Navigation (Centered) */}
        {setActiveTab && (
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            {['home', 'search', 'message', 'profile'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-bold uppercase tracking-wide transition-colors ${
                  activeTab === tab ? 'text-[#C59D5F]' : 'text-[#B0A69D] dark:text-[#E6DCCF] hover:text-[#8B5E3C] dark:hover:text-[#F3EFE0]'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        )}

        <div className="flex gap-4 items-center">
          
          {/* NEW: Admin Panel Button (only if user is admin) */}
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin-dashboard')} className="relative p-2 rounded-full hover:bg-white/50 dark:hover:bg-white/5 text-[#8B5E3C] dark:text-[#C59D5F] transition" title="Go to Admin Panel">
              <Icons.Shield />
            </button>
          )}

          <button onClick={() => navigate('/cart')} className="relative p-2 rounded-full hover:bg-white/50 dark:hover:bg-white/5 text-[#8B5E3C] dark:text-[#C59D5F] transition">
            <Icons.Cart />
            {cartItems.length > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-[#F3EFE0] dark:ring-[#2C2622]">{cartItems.length}</span>}
          </button>
          
          {/* Only show Notifications for logged-in users */}
          {user ? (
            <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-full hover:bg-white/50 dark:hover:bg-white/5 text-[#8B5E3C] dark:text-[#C59D5F] transition">
              <Icons.Bell />
              {unreadCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-[#F3EFE0] dark:ring-[#2C2622]">{unreadCount}</span>}
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="px-4 py-2 bg-[#C59D5F] text-white rounded-xl font-bold text-xs md:text-sm shadow-sm hover:bg-[#B0894F] transition">
              Login
            </button>
          )}
        </div>
      </header>
      )}

      {/* --- PAGE CONTENT (Injected Here) --- */}
      {/* 🌟 FIX: Removed max-width constraints here so Dashboard/Home can use max-w-7xl */}
      <main className={`flex-grow flex flex-col pb-24 md:pb-6 ${showNav ? 'pt-20' : ''} ${fullWidth ? '' : 'px-4 md:px-6'}`}> 
        {children}
      </main>

      {/* --- BOTTOM NAV (Only shows if setActiveTab is passed) --- */}
      {setActiveTab && showNav && (
        <div className="fixed bottom-0 left-0 w-full z-50 px-6 pb-6 pt-4 pointer-events-none flex justify-center bg-gradient-to-t from-[#F5F2E9] dark:from-[#2C2622] to-transparent md:hidden">
          <nav className="bg-white dark:bg-[#4A403A] shadow-[0_8px_30px_rgba(197,157,95,0.15)] dark:shadow-none border border-[#E6DCCF] dark:border-[#2C2622] rounded-full px-6 py-2.5 flex justify-between items-center w-full max-w-xs pointer-events-auto transition-all duration-300">
            {NAV_ITEMS.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                className={`flex flex-col items-center gap-0.5 transition-all duration-300 p-1.5 rounded-xl ${
                  activeTab === item.id
                    ? 'text-[#C59D5F] bg-[#F9F7F2] dark:bg-[#C59D5F]/10 transform -translate-y-1' 
                    : 'text-[#B0A69D] dark:text-[#E6DCCF] hover:text-[#8B5E3C] dark:hover:text-[#F3EFE0]'
                }`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[9px] font-bold">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default MainLayout;