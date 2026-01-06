// frontend/src/components/buyer/DesignRequestCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; 
import { getOrderStatusColor, getStatusText } from '../common/StatusHelpers';
import * as Icons from '../Icons';

// Assuming the component receives the design data and a way to refresh the list
const DesignRequestCard = ({ design, refetch }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // ✅ FIX: Add the missing handleAcceptQuote function
    const handleAcceptQuote = async () => {
        const confirmAccept = window.confirm(
            `Are you sure you want to accept this quote of ₱${design.finalPrice.toLocaleString()}?`
        );

        if (!confirmAccept) return;

        setLoading(true);
        try {
            // 1. Approve the design on the backend
            await api.post(`/designs/${design._id}/approve`);
            // 2. Navigate to checkout with the design ID
            navigate(`/checkout?designId=${design._id}`);
        } catch (error) {
            console.error('Failed to accept quote:', error);
            alert('Failed to accept quote. Please try again.');
            setLoading(false);
        }
    };

    // Function to handle the customer declining the final quote
    const handleDeclineQuote = async () => {
        const confirmDecline = window.confirm(
            `Are you sure you want to decline this quote of ₱${design.finalPrice.toLocaleString()}?`
        );

        if (!confirmDecline) return;

        setLoading(true);
        try {
            // Call the backend endpoint to decline the quote
            // The backend's declineDesignQuote expects a POST request
            await api.post(`/designs/${design._id}/decline`);
            alert('Quote declined successfully.');
            if (refetch) refetch(); // Refresh the list to update status
        } catch (error) {
            console.error('Failed to decline quote:', error);
            alert('Failed to decline quote. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to format date
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

    const isQuoted = design.status === 'quoted';
    const isOrdered = design.status === 'ordered';
    const isApproved = design.status === 'approved'; // ✅ NEW: Check for approved status
    const canView = design.status !== 'declined';

    return (
        <div className="bg-white dark:bg-[#2C2622] rounded-2xl shadow-lg overflow-hidden border border-[#E6DCCF] dark:border-[#4A403A] transition hover:shadow-xl">
            {/* Design Preview and Status Header */}
            <div className="flex items-start p-4 border-b border-[#E6DCCF] dark:border-[#4A403A]">
                {/* Snapshot/Image */}
                <img 
                    src={design.snapshotImage || '/placeholder.png'} 
                    alt="Cake Design" 
                    className="w-20 h-20 object-cover rounded-xl mr-4"
                />
                <div className="flex-1">
                    <div className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${getOrderStatusColor(design.status)}`}>
                        {getStatusText(design.status)}
                    </div>
                    <h3 className="mt-1 font-bold text-lg leading-tight">
                        Design Request #{design._id?.slice(-6) || '---'}
                    </h3>
                    <p className="text-xs text-[#B0A69D] dark:text-[#E6DCCF]">
                        Target Date: {design.targetDate ? formatDate(design.targetDate) : 'N/A'}
                    </p>
                </div>
            </div>

            {/* Price and Action Section */}
            <div className="p-4 space-y-3">
                {/* Estimated Price */}
                <div className="flex justify-between items-center text-sm">
                    <span className="text-[#B0A69D] dark:text-[#E6DCCF] font-medium">Estimated Price:</span>
                    <span className="font-bold text-[#8B5E3C] dark:text-[#F3EFE0]">
                        ₱{design.estimatedPrice?.toLocaleString() || '---'}
                    </span>
                </div>

                {/* Final Price & Action Button (Quoted Status) */}
                {isQuoted && design.finalPrice && (
                    <div className="pt-2 border-t border-dashed border-[#E6DCCF] dark:border-[#4A403A]">
                        <div className="flex justify-between items-center text-base mb-3">
                            <span className="font-bold text-[#4A403A] dark:text-[#F3EFE0]">Final Quote:</span>
                            <span className="font-extrabold text-[#C59D5F] text-xl">
                                ₱{design.finalPrice.toLocaleString()}
                            </span>
                        </div>
                        {/* NEW: Flex container for Accept and Decline buttons */}
                        <div className="flex gap-2">
                            <button 
                                onClick={handleAcceptQuote} 
                                disabled={loading}
                                className="flex-1 flex justify-center items-center gap-2 py-3 bg-[#4A403A] text-white rounded-xl font-bold shadow-md hover:bg-[#2C2622] disabled:opacity-70 transition"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        <Icons.Check />
                                        Accept & Order
                                    </>
                                )}
                            </button>
                            <button 
                                onClick={handleDeclineQuote} 
                                disabled={loading}
                                className="flex-1 flex justify-center items-center gap-2 py-3 bg-red-500 text-white rounded-xl font-bold shadow-md hover:bg-red-600 disabled:opacity-70 transition"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        <Icons.XCircleIcon className="w-5 h-5" />
                                        Decline Quote
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* ✅ NEW: Button to go back to checkout if already approved */}
                {isApproved && (
                    <div className="pt-2 border-t border-dashed border-[#E6DCCF] dark:border-[#4A403A]">
                        <button 
                            onClick={() => navigate(`/checkout?designId=${design._id}`)}
                            className="w-full flex justify-center items-center gap-2 py-3 bg-green-600 text-white rounded-xl font-bold shadow-md hover:bg-green-700 transition"
                        >
                            <Icons.Check /> Proceed to Checkout
                        </button>
                    </div>
                )}

                {/* Other Actions */}
                <div className="flex flex-wrap justify-end gap-2 text-sm pt-2">
                    {/* Edit Button - Only for pending/discussion */}
                    {(design.status === 'pending' || design.status === 'discussion') && (
                        <button 
                            onClick={() => navigate('/cake-builder', { state: { initialConfig: design.config, mode: 'edit', designId: design._id } })}
                            className="px-3 py-1.5 rounded-xl border border-[#C59D5F] text-[#C59D5F] hover:bg-[#C59D5F]/10 transition flex items-center gap-1"
                        >
                            <Icons.Edit className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                        </button>
                    )}

                    {/* View Design Button (always show if not declined) */}
                    {canView && (
                        <button 
                            onClick={() => navigate(`/cake-builder`, { 
                                state: { 
                                    initialConfig: design.config, 
                                    isReadOnly: true,
                                    mode: 'review',
                                    // Pass relevant IDs for context if needed
                                } 
                            })}
                            className="px-3 py-1.5 rounded-xl border border-[#C59D5F] text-[#C59D5F] hover:bg-[#C59D5F]/10 transition"
                        >
                            View Design
                        </button>
                    )}
                    
                    {/* Additional actions for pending/discussion */}
                    {(design.status === 'pending' || design.status === 'discussion') && (
                        <button 
                            onClick={() => navigate(`/messages?designId=${design._id}`)} // Updated to navigate to chat
                            className="px-3 py-1.5 rounded-xl bg-[#F3EFE0] dark:bg-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] hover:bg-[#E6DCCF] transition"
                        >
                            Chat with Baker
                        </button>
                    )}

                    {isOrdered && (
                        <button 
                            onClick={() => navigate('/my-orders')}
                            className="px-3 py-1.5 rounded-xl bg-[#C59D5F] text-white hover:bg-[#B0894F] transition"
                        >
                            View Order
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesignRequestCard;