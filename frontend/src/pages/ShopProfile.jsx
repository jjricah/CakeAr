import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import SubHeader from '../components/SubHeader'; // Import SubHeader
import * as Icons from '../components/Icons';
import AlertModal from '../components/common/AlertModal';

const ShopProfile = () => {
  const { bakerId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [shopDetails, setShopDetails] = useState(null); // Store full shop details
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [isFollowing, setIsFollowing] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const [productsRes] = await Promise.all([
          api.get('/products'),
          api.get(`/shop/profile/${bakerId}`).then(res => setShopDetails(res.data)).catch(() => {}) // Fetch Shop Details
        ]);

        const shopProducts = productsRes.data.filter(p => p.baker?._id === bakerId);
        setProducts(shopProducts);

        // Note: bakerName is derived from shopDetails or products now
      } catch (error) { console.error("Failed to load shop:", error); } 
      finally { setLoading(false); }
    };
    fetchShopData();
  }, [bakerId]);
  
  const bakerName = shopDetails?.shopName || (products.length > 0 ? products[0].baker?.shopName : "Baker's Shop");

  useEffect(() => { if (user && user.following && user.following.includes(bakerId)) setIsFollowing(true); }, [user, bakerId]);

  const handleFollow = async () => {
    if (!user) return navigate('/login');
    try {
      const res = await api.put(`/users/follow/${bakerId}`);
      setIsFollowing(res.data.isFollowing);
      let newFollowing = [...(user.following || [])];
      if (res.data.isFollowing) newFollowing.push(bakerId);
      else newFollowing = newFollowing.filter(id => id !== bakerId);
      updateUser({ ...user, following: newFollowing });
    } catch (err) { console.error("Follow error", err); }
  };


  // ✅ UPDATED: Function to start a direct chat conversation
  const handleStartChat = async () => {
    if (!user) return navigate('/login');
    // Prevent user from starting a chat with themselves
    // Check if the current user owns this shop
    if ((shopDetails?.user === user._id) || user._id === bakerId) {
        return setAlertModal({ isOpen: true, title: 'Action Not Allowed', message: 'You cannot start a chat with your own shop profile.' });
    }
    
    // Use the confirmed Baker ID from shopDetails if available, otherwise fallback to URL param
    const targetId = shopDetails?._id || bakerId;

    setChatLoading(true);

    try {
        const res = await api.post('/chat/direct', {
            recipientId: targetId
        });
        
        // Navigate to the Dashboard
        navigate('/dashboard', { 
            state: { 
                // FIX: Use 'message' to match the Dashboard.jsx tab name
                activeTab: 'message', 
                // ✅ FIX: Use 'initiateChat' key to match Dashboard.jsx logic
                initiateChat: {
                    _id: res.data.conversationId,
                    otherUser: res.data.otherUser,
                    otherUserId: res.data.otherUserId,
                    // ✅ FIX: Provide a safe design placeholder to prevent render errors
                    design: { 
                        snapshotImage: '/placeholder.png', 
                        status: 'DIRECT CHAT',
                        estimatedPrice: 0 
                    } 
                } 
            } 
        });

    } catch (error) {
        console.error("Chat initiation error:", error.response || error);
        
        if (error.response && error.response.status === 401) {
            setAlertModal({ isOpen: true, title: 'Session Expired', message: 'Your session has expired. Please log in again.' });
            navigate('/login');
        } else {
            setAlertModal({ isOpen: true, title: 'Error', message: 'Failed to start chat. Please check your network connection and API URL setup.' });
        }
    } finally {
        setChatLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#4A403A] dark:text-[#F3EFE0]">Loading Shop...</div>;

  return (
    <>
        <AlertModal
            isOpen={alertModal.isOpen}
            title={alertModal.title}
            message={alertModal.message}
            onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
        />
        <div className="min-h-screen bg-[#F3EFE0] dark:bg-[#1E1A17] pb-24 transition-colors duration-300 font-sans">
          
          {/* Replaced fixed header with SubHeader for consistent navigation */}
          <SubHeader title={bakerName} />

          <div className="max-w-xl mx-auto"> 
            {/* HEADER IMAGE - Retained for visual identity */}
            <div className="relative h-32 w-full bg-[#2C2622] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#4A403A] to-[#2C2622]"></div>
            </div>

            {/* PROFILE INFO CARD */}
            <div className="px-4 -mt-16 relative z-10 mb-6">
              <div className="bg-white dark:bg-[#2C2622] rounded-[2rem] p-5 shadow-xl border border-[#E6DCCF] dark:border-[#4A403A] flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-2xl bg-[#F3EFE0] dark:bg-[#4A403A] border-4 border-white dark:border-[#2C2622] flex items-center justify-center text-[#8B5E3C] dark:text-[#C59D5F] text-3xl font-bold shadow-sm -mt-16">
                      {bakerName.charAt(0)}
                  </div>
                  
                  <div className="w-full mt-3">
                      <h1 className="text-xl font-extrabold text-[#4A403A] dark:text-[#F3EFE0]">{bakerName}</h1>
                      <div className="flex justify-center items-center gap-3 text-xs text-[#B0A69D] dark:text-[#E6DCCF] mt-1 mb-5">
                          <span className="flex items-center gap-1 bg-[#F9F7F2] dark:bg-[#4A403A] px-2 py-1 rounded-md">
                              <Icons.Star /> <span className="font-bold text-[#4A403A] dark:text-[#F3EFE0]">4.9</span>
                          </span>
                          <span>•</span>
                          <span className="text-green-600 font-bold bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md">Online</span>
                      </div>

                      <div className="flex gap-3 w-full">
                          <button onClick={handleFollow} className={`flex-1 py-3 rounded-xl border text-sm font-bold transition ${isFollowing ? 'bg-[#4A403A] text-white border-[#4A403A]' : 'border-[#E6DCCF] dark:border-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0]'}`}>
                              {isFollowing ? 'Following' : 'Follow'}
                          </button>
                          <button onClick={handleStartChat} disabled={chatLoading} className="flex-1 py-3 rounded-xl bg-[#C59D5F] text-white text-sm font-bold shadow-lg shadow-[#C59D5F]/30 hover:bg-[#b08d55] flex items-center justify-center gap-2 disabled:opacity-70">
                              {chatLoading ? <Icons.LoadingSpinner className="w-5 h-5 animate-spin" /> : <><Icons.Chat /> Chat</>}
                          </button>
                      </div>
                  </div>
              </div>
            </div>

            {/* TABS & PRODUCTS */}
            <div className="px-4">
                <div className="flex border-b border-[#E6DCCF] dark:border-[#4A403A] mb-4">
                    {['Products', 'About'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())}
                          className={`flex-1 pb-3 text-sm font-bold transition-all relative ${activeTab === tab.toLowerCase() ? 'text-[#C59D5F]' : 'text-[#B0A69D] dark:text-[#888]'}`}>
                            {tab}
                            {activeTab === tab.toLowerCase() && <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-[#C59D5F] rounded-full"></span>}
                        </button>
                    ))}
                </div>

                {activeTab === 'products' ? (
                    <div className="animate-fade-in pb-10">
                      {products.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                              {products.map(p => (
                                  <div key={p._id} onClick={() => navigate(`/product/${p._id}`)} className="bg-white dark:bg-[#2C2622] rounded-2xl overflow-hidden shadow-sm border border-[#E6DCCF] dark:border-[#4A403A] cursor-pointer">
                                      <div className="h-36 w-full flex items-center justify-center bg-[#F9F7F2] dark:bg-[#1a1614] overflow-hidden">
                                          {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="text-[#C59D5F] opacity-50"><Icons.CakeSolid /></div>}
                                      </div>
                                      <div className="p-3">
                                          <h3 className="font-bold text-xs truncate text-[#4A403A] dark:text-[#F3EFE0] mb-1">{p.title}</h3>
                                          <span className="text-[#C59D5F] font-bold text-sm">₱{p.basePrice?.toLocaleString()}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : <div className="text-center py-20 text-[#B0A69D]"><p>No products found.</p></div>}
                    </div>
                ) : <div className="text-center py-20 text-[#B0A69D]">
                     <p className="text-sm">{shopDetails?.shopDescription || "This baker hasn't provided a shop description yet."}</p>
                  </div>}
            </div>
          </div>
        </div>
    </>
  );
};
export default ShopProfile;