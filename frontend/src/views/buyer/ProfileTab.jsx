// frontend/src/components/buyer/ProfileTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import * as Icons from '../../components/Icons';
import UserProfileCard from '../../components/user/UserProfileCard';

const ProfileTab = ({ user, navigate, logout, savedDesigns }) => { 
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const [followedShops, setFollowedShops] = useState([]); 
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true); 
  const [totalOrdersCount, setTotalOrdersCount] = useState(0); 

  // --- FETCH ORDERS & FOLLOWED SHOPS ---
  const fetchActivity = useCallback(async () => {
    if(!user) return;
    setLoadingOrders(true);
    setLoadingFollowing(true);

    try {
        const [ordersRes, followingRes] = await Promise.all([
            api.get('/orders/my-orders'),
            api.get('/users/following-details')
        ]);

        // Process Orders
        const fetchedOrders = ordersRes.data;
        const active = fetchedOrders.filter(o => 
            ['pending_review', 'accepted', 'baking', 'ready_to_ship', 'shipped'].includes(o.orderStatus)
        );
        setActiveOrders(active);
        setTotalOrdersCount(fetchedOrders.length);

        // Process Followed Shops
        setFollowedShops(followingRes.data.filter(s => s.role === 'seller'));
        
    } catch (err) { console.error(err); } 
    finally { setLoadingOrders(false); setLoadingFollowing(false); }
  }, [user]);
    
  useEffect(() => {
    fetchActivity();
  }, [user, fetchActivity]);

  // Helper for Progress Bar
  const getStatusStep = (status) => {
      switch(status) {
          case 'pending_review': return 1;
          case 'accepted': return 2;
          case 'baking': return 3;
          case 'ready_to_ship': return 4;
          case 'shipped': return 5;
          default: return 0;
      }
  };

  const handleEditProfile = () => {
      navigate('/settings');
  };

  // Menu Config (Simplified: Merged Order History & Requests into one button)
  const primaryMenuItems = [
    { icon: <Icons.History />, label: 'My Orders & Requests', action: () => navigate('/my-orders') },
    { icon: <Icons.Cart />, label: 'My Cart', action: () => navigate('/cart') },
  ];

  const secondaryMenuItems = [
    { icon: <Icons.Settings />, label: 'Account Settings', action: handleEditProfile }, // Link to settings page
  ];

  return (
    <div className="relative animate-fade-in">
      
      {/* Logout Modal (omitted for brevity) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#2C2622] rounded-[2rem] p-6 w-full max-w-xs shadow-2xl border border-[#E6DCCF] dark:border-[#4A403A] transform scale-100 transition-all">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><Icons.Logout /></div>
              <h3 className="text-xl font-bold text-[#4A403A] dark:text-[#F3EFE0] mb-2">Log Out?</h3>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#F3EFE0] dark:bg-[#4A403A] text-[#8B5E3C] dark:text-[#F3EFE0]">Cancel</button>
                <button onClick={logout} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 shadow-lg">Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* --- USER PROFILE CARD --- */}
      <div className="mb-8 md:mb-0">
        <UserProfileCard 
            user={{ 
                ...user, 
                designsCount: savedDesigns?.length || 0,
                ordersCount: totalOrdersCount
            }} 
            onEditClick={handleEditProfile} 
        />
      </div>
        
      {/* --- FOLLOWED SHOPS SECTION (FIX 3) --- */}
       <div className="mb-8">
            <div className="flex justify-between items-center px-2 mb-3">
                <h3 className="font-bold text-[#4A403A] dark:text-[#F3EFE0] text-sm">Followed Shops ({followedShops.length})</h3>
                {/* FIXED: Navigate to /dashboard and instruct it to show the 'shops' search tab */}
                <button 
                    onClick={() => navigate('/dashboard', { state: { activeTab: 'search', initSearchType: 'shops' } })} 
                    className="text-xs text-[#C59D5F] font-bold"
                >
                    Find More
                </button>
            </div>
            
            {loadingFollowing ? (
                 <div className="text-center py-4 text-gray-400 text-xs">Loading followed shops...</div>
            ) : followedShops.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto px-2 pb-4 no-scrollbar -mx-2">
                    {followedShops.slice(0, 5).map(shop => (
                        <div key={shop._id} onClick={() => navigate(`/shop/${shop._id}`)} className="min-w-[120px] max-w-[120px] bg-white dark:bg-[#4A403A] p-4 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#2C2622] text-center cursor-pointer hover:shadow-lg transition">
                            <div className="w-10 h-10 rounded-full bg-[#F3EFE0] dark:bg-[#2C2622] text-[#8B5E3C] text-xl font-bold flex items-center justify-center mx-auto mb-2">
                                {shop.shopName?.charAt(0) || 'S'}
                            </div>
                            <p className="text-xs font-bold text-[#4A403A] dark:text-[#F3EFE0] truncate">{shop.shopName || shop.name}</p>
                            <p className="text-[10px] text-[#C59D5F] font-bold">Shop</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-[#4A403A] p-4 rounded-2xl border border-dashed border-[#E6DCCF] dark:border-[#2C2622] text-center">
                     <p className="text-sm text-[#B0A69D] dark:text-[#E6DCCF]">You are not following any bakeries.</p>
                </div>
            )}
       </div>
      {/* ----------------------------------- */}

      {/* --- ACTIVE ORDER TRACKING SECTION (omitted for brevity) --- */}
      <div className="mb-8">
          <div className="flex justify-between items-center px-2 mb-3">
              <h3 className="font-bold text-[#4A403A] dark:text-[#F3EFE0] text-sm">Active Orders</h3>
              <button onClick={() => navigate('/my-cakes')} className="text-xs text-[#C59D5F] font-bold">View All</button>
          </div>
          
          {loadingOrders ? (
              <div className="text-center py-8 text-gray-400 text-xs">Checking orders...</div>
          ) : activeOrders.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto px-2 pb-4 no-scrollbar -mx-2">
                  {activeOrders.slice(0, 3).map(order => {
                      const step = getStatusStep(order.orderStatus);
                      return (
                        <div key={order._id} onClick={() => navigate('/my-orders', { state: { activeTab: 'orders' } })} className="min-w-[280px] bg-white dark:bg-[#4A403A] p-4 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#2C2622] relative overflow-hidden group cursor-pointer">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold bg-[#F9F7F2] dark:bg-[#2C2622] px-2 py-1 rounded text-[#8B5E3C] dark:text-[#F3EFE0]">Order #{order._id.slice(-4)}</span>
                                <span className="text-[10px] text-[#B0A69D] dark:text-[#E6DCCF]">{new Date(order.dateNeeded).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-[#4A403A] dark:text-[#F3EFE0] text-sm mb-4 line-clamp-1">{order.items[0]?.title}</h4>
                            
                            {/* Visual Progress Bar */}
                            <div className="relative h-1.5 bg-[#F3EFE0] dark:bg-[#2C2622] rounded-full overflow-hidden mb-2">
                                <div className="absolute top-0 left-0 h-full bg-[#C59D5F] transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>
                            </div>
                            <p className="text-xs text-[#C59D5F] font-bold text-right uppercase">{order.orderStatus.replace('_', ' ')}</p>
                        </div>
                      );
                  })}
              </div>
          ) : (
              <div className="bg-white dark:bg-[#4A403A] p-6 rounded-2xl border border-dashed border-[#E6DCCF] dark:border-[#2C2622] text-center">
                  <p className="text-sm text-[#B0A69D] dark:text-[#E6DCCF]">No active orders right now.</p>
                  <button onClick={() => navigate('/cake-builder')} className="text-[#C59D5F] text-xs font-bold mt-2 hover:underline">Start a new design</button>
              </div>
          )}
      </div>
      {/* ------------------------------------------------ */}

      {/* Menu Actions (omitted for brevity) */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-[#4A403A] rounded-3xl shadow-sm border border-[#E6DCCF] dark:border-[#2C2622] overflow-hidden">
            {primaryMenuItems.map((item, idx) => (
            <div key={idx}>
                <button onClick={item.action} className="w-full flex items-center gap-4 p-5 hover:bg-[#F9F7F2] dark:hover:bg-[#2C2622]/50 text-left transition group">
                    <div className="text-[#C59D5F] bg-[#F3EFE0] dark:bg-[#C59D5F]/20 p-2 rounded-lg">{item.icon}</div>
                    <span className="font-bold text-[#4A403A] dark:text-[#F3EFE0] flex-1 text-sm">{item.label}</span>
                    <Icons.ChevronRight />
                </button>
                {idx !== primaryMenuItems.length - 1 && <div className="h-px bg-[#F3EFE0] dark:bg-[#2C2622] mx-5"></div>}
            </div>
            ))}
        </div>

        <div className="bg-white dark:bg-[#4A403A] rounded-3xl shadow-sm border border-[#E6DCCF] dark:border-[#2C2622] overflow-hidden">
             {secondaryMenuItems.map((item, idx) => (
                <div key={idx}>
                    <button onClick={item.action} className="w-full flex items-center gap-4 p-5 hover:bg-[#F9F7F2] dark:hover:bg-[#2C2622]/50 text-left transition group">
                        <div className="text-[#B0A69D] dark:text-[#E6DCCF] p-2">{item.icon}</div>
                        <span className="font-medium text-[#4A403A] dark:text-[#F3EFE0] flex-1 text-sm">{item.label}</span>
                        <Icons.ChevronRight />
                    </button>
                </div>
            ))}
            <div className="h-px bg-[#F3EFE0] dark:bg-[#2C2622] mx-5"></div>
            <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-4 p-5 hover:bg-red-50 dark:hover:bg-red-900/10 text-left transition text-red-500 group">
                <div className="p-2"><Icons.Logout /></div>
                <span className="font-medium flex-1 text-sm">Log Out</span>
            </button>
        </div>
      </div>
      
      {/* Seller Banner (omitted for brevity) */}
      <div onClick={() => user?.role === 'seller' ? navigate('/seller-dashboard') : navigate('/become-seller')} className="mt-8 bg-gradient-to-r from-[#4A403A] to-[#2C2622] rounded-2xl p-4 flex items-center justify-between shadow-lg cursor-pointer">
          <div>
              <p className="text-white font-bold text-sm">{user?.role === 'seller' ? 'Go to Seller Studio' : 'Become a Seller'}</p>
              <p className="text-white/60 text-xs">Manage your shop & orders</p>
          </div>
          <div className="bg-white/10 p-2 rounded-full text-white"><Icons.Store /></div>
      </div>

    </div>
  );
};

export default ProfileTab;