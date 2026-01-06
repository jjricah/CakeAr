import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import SubHeader from '../components/SubHeader';
import * as Icons from '../components/Icons';
import ReviewModal from '../components/review/ReviewModal';
import OrderCard from '../components/buyer/OrderCard';
import DesignRequestCard from '../components/buyer/DesignRequestCard';
import AlertModal from '../components/common/AlertModal';
import ConfirmationModal from '../components/admin/ConfirmationModal';


const MyOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, deleteDesign, savedDesigns } = useContext(AuthContext); 
  const { addToCart } = useContext(CartContext);

  const [activeTab, setActiveTab] = useState('orders'); 
  
  const [orders, setOrders] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: Review state management
  const [reviewableOrders, setReviewableOrders] = useState({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentOrderToReview, setCurrentOrderToReview] = useState(null);

  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });


  // 2. FETCH DATA (Combined logic)
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [orderRes, designRes] = await Promise.all([
        api.get('/orders/my-orders'),
        api.get('/designs/my-designs')
      ]);
      
      const fetchedOrders = orderRes.data;
      setOrders(fetchedOrders);
      setDesigns(designRes.data);
      
      // Check review status for all completed orders
      const reviewChecks = {};
      await Promise.all(fetchedOrders.map(async (order) => {
          // Check reviewable status ONLY if the order is completed
          if (order.orderStatus === 'completed') {
              const res = await api.get(`/reviews/check/${order._id}`);
              reviewChecks[order._id] = res.data;
          }
      }));
      setReviewableOrders(reviewChecks);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      window.history.replaceState({}, document.title);
    }
    fetchData();
  }, [location, fetchData]);

  // --- ACTIONS ---

  const handleConfirmReceipt = async (orderId) => {
    setConfirmModal({
        isOpen: true,
        title: 'Confirm Receipt?',
        message: 'Confirm that you have received this order?',
        onConfirm: async () => {
            try {
                await api.put(`/orders/${orderId}/status`, { status: 'completed' });
                fetchData(); // Refetch to show "Leave Review" button
                setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
            } catch (err) {
                setAlertModal({ isOpen: true, title: 'Error', message: err.response?.data?.message || "Action failed. Please try again." });
            }
        }
    });
  };

  const handleAddToCart = (design) => {
    const itemToBuy = {
        _id: design._id, 
        title: `Custom ${design.config.shape} Design`,
        image: design.snapshotImage,
        price: design.finalPrice || design.estimatedPrice,
        quantity: 1,
        type: 'custom_approved', 
        selectedOptions: design.config,
        bakerId: design.baker?._id
    };
    addToCart(itemToBuy);
    navigate('/cart');
  };

  // Review Submission Handler
  const handleReviewSubmission = async (orderId, rating, comment, image) => {
      try {
          const payload = {
              orderId, rating, comment, image
          };
          await api.post('/reviews', payload);
          setAlertModal({ isOpen: true, title: 'Success', message: 'Review submitted successfully! Thank you for your feedback.' });
          setIsReviewModalOpen(false); 
          fetchData(); 
      } catch (err) {
          setAlertModal({ isOpen: true, title: 'Error', message: err.response?.data?.message || "Failed to submit review." });
          setIsReviewModalOpen(false);
      }
  }

  // Helper function to set up the modal outside of render
  const handleReviewClick = (order) => {
      setCurrentOrderToReview(order); 
      setIsReviewModalOpen(true);
  }

  // --- RENDERERS ---
  const renderOrders = () => (
    <div className="grid animate-fade-in grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.length === 0 ? (
            <div className="text-center py-20 opacity-50">
                <span className="text-4xl block mb-2">📦</span>
                No active orders.
            </div>
        ) : orders.map(order => (
            // 🌟 Use modular OrderCard
            <OrderCard 
                key={order._id}
                order={order}
                handleConfirmReceipt={handleConfirmReceipt}
                reviewStatus={reviewableOrders[order._id]}
                handleReviewClick={handleReviewClick}
            />
        ))}
    </div>
  );

  const renderRequests = () => {
    const filteredDesigns = designs.filter(d => ['pending', 'discussion', 'quoted', 'reviewed', 'approved', 'declined', 'ordered'].includes(d.status));

    return (
      <div className="grid animate-fade-in grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDesigns.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <span className="text-4xl block mb-2">🎨</span>
            No design requests.
            <button onClick={() => navigate('/cake-builder')} className="block mx-auto mt-4 text-[#C59D5F] font-bold underline">Create Design</button>
          </div>
        ) : (
          filteredDesigns.map(design => (
            // 🌟 Use modular DesignRequestCard
            <DesignRequestCard 
              key={design._id}
              design={design}
              handleAddToCart={handleAddToCart}
              refetch={fetchData} // Pass fetchData as refetch prop
            />
          ))
        )}
      </div>
    );
  };
  
  const renderSavedDesigns = () => {
    const filteredSavedDesigns = savedDesigns || [];
    
    return (
      <div className="grid animate-fade-in grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSavedDesigns.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <span className="text-4xl block mb-2">💡</span>
            <p>No designs saved locally.</p>
            <button onClick={() => navigate('/cake-builder')} className="block mx-auto mt-4 text-[#C59D5F] font-bold underline">Start Building</button>
          </div>
        ) : filteredSavedDesigns.map(d => (
          <div key={d.id} className="bg-white dark:bg-[#4A403A] p-4 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#2C2622]">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">DRAFT</span>
                <div className="text-xs text-[#B0A69D] mt-1">Saved: {new Date(d.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="flex gap-4 mb-3">
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-[#E6DCCF]">
                {d.snapshotImage ? <img src={d.snapshotImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🍰</div>}
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#B0A69D] dark:text-[#E6DCCF] mb-1">{d.config.layers.length} Tier • {d.config.frosting}</p>
                <p className="font-bold text-[#4A403A] dark:text-[#F3EFE0]">{d.config.shape} Cake</p>
                <div className="font-bold text-lg text-[#C59D5F]">
                  ~₱{d.estimatedPrice.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-[#F3EFE0] dark:border-[#2C2622]">
              <button 
                onClick={() => navigate('/cake-builder', { state: { initialConfig: d.config, mode: 'edit' } })}
                className="flex-1 bg-[#4A403A] dark:bg-[#C59D5F] text-white py-2.5 rounded-xl font-bold shadow-md hover:opacity-90 transition text-sm flex items-center justify-center gap-2"
              >
                <Icons.Edit /> Load & Edit
              </button>
              <button 
                onClick={() => deleteDesign(d.id)} 
                className="w-1/4 bg-red-100 text-red-500 py-2.5 rounded-xl font-bold hover:bg-red-200 transition text-sm flex items-center justify-center"
              >
                <Icons.Trash />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };


    return (
        <>
            <AlertModal
                isOpen={alertModal.isOpen}
                title={alertModal.title}
                message={alertModal.message}
                onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
            />
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
            />
            <div className="min-h-screen font-sans text-[#4A403A] dark:text-[#F3EFE0] bg-[#F9F7F2] dark:bg-[#1E1A17] pb-8">
                <SubHeader title="My Activities" />

                {/* TABS */}
                <div className="sticky top-[60px] z-20 bg-[#F9F7F2] dark:bg-[#1E1A17] pt-2 pb-4 px-6">
                    <div className="flex p-1 bg-[#E6DCCF] dark:bg-[#2C2622] rounded-xl">
                        <button onClick={() => setActiveTab('orders')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-[#4A403A] shadow-sm text-[#4A403A] dark:text-[#F3EFE0]' : 'text-[#B0A69D] dark:text-[#E6DCCF]'}`}>
                            Orders
                        </button>
                        <button onClick={() => setActiveTab('requests')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'requests' ? 'bg-white dark:bg-[#4A403A] shadow-sm text-[#4A403A] dark:text-[#F3EFE0]' : 'text-[#B0A69D] dark:text-[#E6DCCF]'}`}>
                            Requests
                        </button>
                        <button onClick={() => setActiveTab('saved')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'saved' ? 'bg-white dark:bg-[#4A403A] shadow-sm text-[#4A403A] dark:text-[#F3EFE0]' : 'text-[#B0A69D] dark:text-[#E6DCCF]'}`}>
                            Saved ({savedDesigns.length})
                        </button>
                    </div>
                </div>
                <div className="px-4 md:px-6">
                    {loading ? <div className="text-center mt-20 opacity-50">Loading...</div> : (
                        activeTab === 'orders' ? renderOrders() : 
                        activeTab === 'requests' ? renderRequests() : 
                        renderSavedDesigns()
                    )}
                </div>
      
                {/* RENDER MODAL */}
                {currentOrderToReview && isReviewModalOpen && (
                    <ReviewModal 
                        order={currentOrderToReview} 
                        isOpen={isReviewModalOpen} 
                        onClose={() => setIsReviewModalOpen(false)} 
                        onSubmit={handleReviewSubmission} 
                    />
                )}
            </div>
        </>
    );
};

export default MyOrders;