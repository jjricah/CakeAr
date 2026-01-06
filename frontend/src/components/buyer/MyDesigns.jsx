// frontend/src/components/buyer/MyDesigns.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CartContext } from '../../context/CartContext';
import * as Icons from '../Icons';
// ✅ NEW IMPORT: Import the StatusPill component for centralized status display
import { StatusPill } from '../common/StatusHelpers';

// Helper to construct the chat link with the design ID
const getChatLink = (designId) => `/messages?designId=${designId}`;

const MyDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const res = await api.get('/designs/my-designs');
      setDesigns(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleAddToCart = (design) => {
    // Convert the approved design into a Cart Item
    const itemToBuy = {
        _id: design._id, // Use Design ID so we can link it later
        title: `Custom ${design.config.shape} Cake (Approved)`,
        image: design.snapshotImage,
        price: design.finalPrice || design.estimatedPrice,
        quantity: 1,
        type: 'custom_approved', // Special flag for the backend
        selectedOptions: design.config,
        bakerId: design.baker?._id // Important: Link to specific baker
    };

    addToCart(itemToBuy);
    alert("Added to Cart! Proceed to checkout.");
    navigate('/cart');
  };

  // --- NEW: Function to handle navigation to the dedicated design chat ---
  const handleGoToChat = (designId) => {
      navigate(getChatLink(designId));
  };
  // ----------------------------------------------------------------------


  if (loading) return <div className="p-8 text-center text-[#B0A69D]">Loading requests...</div>;

  return (
    <div className="min-h-screen pb-24 font-sans text-[#4A403A] dark:text-[#F3EFE0] bg-[#F9F7F2] dark:bg-[#1E1A17]">
        {/* Simple Header */}
        <div className="sticky top-0 z-30 px-4 py-3 bg-[#F3EFE0]/95 dark:bg-[#2C2622]/95 backdrop-blur-md border-b border-[#E6DCCF] dark:border-[#4A403A] flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#4A403A] rounded-full border border-[#E6DCCF] dark:border-[#2C2622] shadow-sm"><Icons.Back /></button>
            <h1 className="text-lg font-bold">My Custom Requests</h1>
        </div>

        <div className="p-4 space-y-4">
            {designs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <div className="text-4xl mb-2">🎨</div>
                    <p>No designs yet.</p>
                    <button onClick={() => navigate('/cake-builder')} className="mt-4 text-[#C59D5F] font-bold underline">Create One</button>
                </div>
            ) : (
                designs.map(d => (
                    <div key={d._id} className="bg-white dark:bg-[#4A403A] p-4 rounded-2xl shadow-sm border border-[#E6DCCF] dark:border-[#2C2622] flex flex-col gap-3">
                        {/* Header Status */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">Request #{d._id.slice(-4)}</span>
                                {d.baker && <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500">To: {d.baker.shopName || "Baker"}</span>}
                            </div>
                            {/* ✅ FIX: Use the reusable StatusPill component */}
                            <StatusPill status={d.status} />
                        </div>

                        {/* Content */}
                        <div className="flex gap-4 bg-[#F9F7F2] dark:bg-[#2C2622] p-3 rounded-xl">
                            <div className="w-20 h-20 bg-white rounded-lg border border-[#E6DCCF] overflow-hidden flex-shrink-0">
                                {d.snapshotImage ? <img src={d.snapshotImage} alt="Design Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🍰</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-[#B0A69D] mb-1">{d.config.layers.length} Tier • {d.config.frosting}</p>
                                {/* Only show bakerNote if status is discussion or quoted */}
                                {(d.bakerNote && (d.status === 'discussion' || d.status === 'quoted')) && (
                                    <div className="text-xs italic bg-white dark:bg-[#4A403A] p-2 rounded border border-[#E6DCCF] dark:border-[#4A403A] mb-2">
                                        " {d.bakerNote} "
                                    </div>
                                )}
                                <div className="font-bold text-lg text-[#C59D5F]">
                                    {d.finalPrice ? `₱${d.finalPrice.toLocaleString()}` : `~₱${d.estimatedPrice.toLocaleString()}`}
                                </div>
                            </div>
                        </div>

                        {/* Actions: Conditional Buttons */}
                        {(d.status === 'pending' || d.status === 'discussion') && (
                            <button 
                                onClick={() => navigate('/cake-builder', { state: { initialConfig: d.config, mode: 'edit', designId: d._id } })}
                                className="w-full border border-[#C59D5F] text-[#C59D5F] py-2 rounded-xl font-bold hover:bg-[#C59D5F]/10 transition active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Icons.Edit className="w-4 h-4" /> Edit Request
                            </button>
                        )}

                        {d.status === 'discussion' && (
                            <button onClick={() => handleGoToChat(d._id)} className="w-full bg-[#3B82F6] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#2563EB] transition active:scale-95 flex items-center justify-center gap-2">
                                <Icons.Chat className="w-5 h-5" /> Go to Discussion Chat
                            </button>
                        )}
                        
                        {d.status === 'quoted' && (
                            <button onClick={() => handleGoToChat(d._id)} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition active:scale-95 flex items-center justify-center gap-2">
                                <Icons.Money className="w-5 h-5" /> Review Quote & Message
                            </button>
                        )}

                        {d.status === 'approved' && !d.isOrdered && (
                            <button onClick={() => handleAddToCart(d)} className="w-full bg-[#C59D5F] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#B0894F] transition active:scale-95">
                                Add to Cart & Checkout (Approved)
                            </button>
                        )}
                        
                        {d.status === 'declined' && (
                            <div className="w-full text-center py-2 text-xs font-bold text-red-600 bg-red-50 rounded-xl">
                                Request Declined ❌
                            </div>
                        )}
                        
                        {d.status === 'ordered' && (
                            <div className="w-full text-center py-2 text-xs font-bold text-green-600 bg-green-50 rounded-xl">
                                Order Placed ✅
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default MyDesigns;