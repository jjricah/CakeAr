import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import logo from '../assets/creake_logo.png';
import * as Icons from '../components/Icons';

// --- MODULAR COMPONENTS ---
import { SellerSidebar, SellerMobileNav } from '../components/seller/SellerLayout';
import SellerStats from '../components/seller/SellerStats';
import ProductManager from '../views/seller/ProductManager';
import OrderManager from '../views/seller/OrderManager';
import DesignInbox from '../views/seller/DesignInbox';
import MessagesTab from '../components/MessagesTab';
import ShopSettings from '../components/seller/ShopSettings';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [shopDetails, setShopDetails] = useState(null);
  const [dashboardOrders, setDashboardOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chat State
  const [activeChat, setActiveChat] = useState(null);

  // Modal States
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // --- 1. HANDLE REDIRECTION ---
  useEffect(() => {
    // If navigating from DesignInbox (Quote/Decline Action), switch tab
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }

    // If a specific chat object was passed (from DesignInbox), open it immediately
    if (location.state?.activeChat) {
      setActiveChat(location.state.activeChat);
      // Clear history state to prevent stuck navigation on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // --- 2. DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const shopRes = await api.get('/shop/me');
        setShopDetails(shopRes.data.shop);

        const orderRes = await api.get('/orders/seller-orders');
        setDashboardOrders(orderRes.data);
      } catch (error) {
        if (error.response?.status === 404) navigate('/become-seller');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  const confirmLogout = () => { logout(); navigate('/login'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F3EFE0] dark:bg-[#2C2622] text-[#8B5E3C] dark:text-[#C59D5F]">Loading Studio...</div>;

  return (
    <div className="min-h-screen md:pl-64 pt-16 md:pt-20 pb-20 md:pb-0 font-sans text-[#4A403A] dark:text-[#F3EFE0] bg-[#F9F7F2] dark:bg-[#1E1A17]">

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#2C2622] rounded-[2rem] p-6 w-full max-w-xs shadow-2xl border border-[#E6DCCF] dark:border-[#4A403A] transform scale-100 transition-all">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><Icons.Logout /></div>
              <h3 className="text-xl font-bold text-[#4A403A] dark:text-[#F3EFE0] mb-2">Log Out?</h3>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#F3EFE0] dark:bg-[#4A403A] transition">Cancel</button>
                <button onClick={confirmLogout} className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-red-500 transition">Log Out</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Sidebar & Layout */}
      <SellerSidebar
        shopName={shopDetails?.shopName}
        shopRating={shopDetails?.rating || 5.0}
        shopLogo={shopDetails?.shopLogo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSwitchToBuying={() => navigate('/dashboard')}
      />

      {/* Top Header */}
      <header className="bg-[#F3EFE0]/95 dark:bg-[#2C2222]/95 backdrop-blur-md h-16 md:h-20 flex items-center justify-between px-4 md:px-8 fixed top-0 left-0 right-0 md:left-64 z-20 border-b border-[#E6DCCF] dark:border-[#4A403A]">
        <div className="flex items-center gap-3">
          <img src={logo} alt="CREAKE" className="h-8 w-auto bg-white p-1 rounded-lg md:hidden" />
          <h1 className="text-lg md:text-2xl font-bold capitalize tracking-tight">{activeTab.replace('_', ' ')}</h1>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[10px] bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full text-[#C59D5F] font-bold uppercase">Seller Mode</span>
            <button onClick={() => navigate('/dashboard')} className="md:hidden w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#C59D5F] border border-[#E6DCCF] shadow-sm"><Icons.ShoppingBag /></button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {activeTab === 'dashboard' && (
          <SellerStats
            shopDetails={shopDetails}
            orders={dashboardOrders}
            setActiveTab={setActiveTab}
            setShopDetails={setShopDetails} // ✅ Pass setter to update UI after cashout
          />
        )}

        {activeTab === 'messages' && (
          <div className="bg-white dark:bg-[#4A403A] rounded-2xl md:rounded-[2rem] shadow-sm border border-[#E6DCCF] dark:border-[#2C2622] overflow-hidden p-0 md:p-6 h-[calc(100dvh-170px)] md:h-[calc(100dvh-180px)]">
            <MessagesTab
              activeChat={activeChat}
              setActiveChat={setActiveChat}
              user={user}
              mode="seller"
            />
          </div>
        )}

        {activeTab === 'designs' && <DesignInbox />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'orders' && <OrderManager />}
        {activeTab === 'settings' && (
          <ShopSettings
            currentShopDetails={shopDetails}
            setShopDetails={setShopDetails}
            onLogout={() => setShowLogoutConfirm(true)}
          />
        )}
      </main>

      <SellerMobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default SellerDashboard;