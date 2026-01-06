import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import * as Icons from '../Icons';
// ✅ FIX 1: Import useContext hook and the AuthContext itself
import { AuthContext } from '../../context/AuthContext'; 

// This component is rendered by MessagesTab when message.messageType === 'quotation'
const QuotationCard = ({ message, senderName, convId }) => {
    const navigate = useNavigate();
    // ✅ FIX 2: Use the useContext hook correctly to access the user object
    const { user } = useContext(AuthContext); 
    
    // State to hold the design and its current status
    const [design, setDesign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Helper to fetch the design status (used for initial load and refreshing after action)
    const fetchDesignDetails = async () => {
        if (!message.designSubmission) {
            setLoading(false);
            return;
        }
        try {
            // Fetch the full design details using the ID stored in the message
            const res = await api.get(`/designs/${message.designSubmission}`);
            setDesign(res.data);
            return res.data;
        } catch (err) {
            console.error("Error fetching design for quote:", err);
            setError("Could not load design details.");
        } finally {
            setLoading(false);
        }
    };

    // 1. Fetch the full Design Submission details on mount
    useEffect(() => {
        fetchDesignDetails();
    }, [message.designSubmission]);
    
    // Derived state for easier access
    const currentStatus = design?.status;
    const isBuyer = user && design && design.user?._id.toString() === user._id.toString();
    // Buyer can only approve/decline if the design is currently 'quoted'
    const isActionable = currentStatus === 'quoted' && isBuyer; 
    
    // Attempt to extract the price from the design object or the message text
    const quotedPrice = design?.finalPrice 
        ? `₱${design.finalPrice.toLocaleString()}` 
        : (message.text?.match(/₱([\d,]+\.?\d{0,2})/)?.[0] || 'Price Pending');

    
    // --- Action Handlers ---

    const handleAction = async (actionType) => {
        if (!design || !isActionable) return;

        setSubmitting(true);
        setError(null);

        try {
            // ✅ FIX 3: Use the correct API route and method (POST) for status change
            const endpoint = `/designs/${design._id}/${actionType}`; 
            await api.post(endpoint); 
            
            // Re-fetch design details to update the card's status display
            const updatedDesign = await fetchDesignDetails(); 

            // Redirect to checkout only upon successful 'approve'
            if (actionType === 'approve' && updatedDesign?.status === 'approved') {
                // The checkout page handles fetching the approved design details
                navigate(`/checkout?designId=${design._id}`); 
            }

        } catch (err) {
            console.error(`${actionType} failed:`, err);
            setError(err.response?.data?.message || `Failed to ${actionType} the quote. Status must be 'quoted'.`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = () => handleAction('approve');
    const handleDecline = () => handleAction('decline');
    
    // --- Render Logic ---

    if (loading) return <div className="text-center py-4 text-[#B0A69D] dark:text-[#E6DCCF]"><Icons.LoadingSpinner className="w-5 h-5 inline mr-2" /> Loading Quote...</div>;
    
    // If user is not the buyer or design not found, just display the quote details (non-interactive)
    if (!design) return <div className="text-center text-red-500 py-4">Design details unavailable.</div>;


    return (
        <div className="w-full max-w-md mx-auto bg-white dark:bg-[#2C2622] rounded-lg shadow-md overflow-hidden border border-[#E6DCCF] dark:border-[#4A403A] transition-all">
            {/* Invoice Header */}
            <div className="bg-[#F9F7F2] dark:bg-[#1E1A17] p-4 border-b border-[#E6DCCF] dark:border-[#4A403A] flex justify-between items-center">
                <div className="flex items-center gap-2 text-[#C59D5F]">
                    <Icons.CurrencyDollarIcon className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-widest">Quotation</span>
                </div>
                <span className="text-xs font-mono text-[#B0A69D]">#{design._id.slice(-6).toUpperCase()}</span>
            </div>

            <div className="p-6">
                {/* Invoice Details */}
                <div className="flex justify-between mb-6">
                    <div>
                        <p className="text-[10px] uppercase text-[#B0A69D] font-bold mb-1">From</p>
                        <p className="font-bold text-[#4A403A] dark:text-[#F3EFE0] text-sm">{senderName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase text-[#B0A69D] font-bold mb-1">Status</p>
                        <p className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full inline-block ${currentStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {currentStatus}
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-[10px] uppercase text-[#B0A69D] font-bold mb-2">Description</p>
                    <div className="bg-[#F9F7F2] dark:bg-[#4A403A]/30 p-3 rounded-lg border border-[#E6DCCF] dark:border-[#4A403A]/50">
                        <p className="text-sm font-medium text-[#4A403A] dark:text-[#F3EFE0]">Custom Cake Design</p>
                        {message.text && (
                            <p className="text-xs text-[#B0A69D] dark:text-[#E6DCCF] mt-1 italic">
                                "{message.text.split('**').pop().replace('.', '').trim()}"
                            </p>
                        )}
                    </div>
                </div>

                {/* Total Section */}
                <div className="flex justify-between items-end border-t border-dashed border-[#E6DCCF] dark:border-[#4A403A] pt-4 mb-6">
                    <span className="font-bold text-[#4A403A] dark:text-[#F3EFE0]">Total Amount</span>
                    <span className="text-2xl font-extrabold text-[#C59D5F]">{quotedPrice}</span>
                </div>

                {error && <p className="text-red-500 text-xs my-2 text-center">{error}</p>}

                {/* Actions */}
                {isActionable && (
                    <div className="flex gap-3">
                        <button
                            onClick={handleApprove}
                            disabled={submitting}
                            className="flex-1 flex items-center justify-center py-3 px-3 bg-[#C59D5F] text-white rounded-lg font-bold shadow-md hover:bg-[#B0894F] transition disabled:opacity-50"
                        >
                            {submitting ? <Icons.LoadingSpinner className="w-5 h-5 mr-2" /> : <Icons.Check className="w-5 h-5 mr-2" />}
                            Approve & Pay
                        </button>
                        
                        <button
                            onClick={handleDecline}
                            disabled={submitting}
                            className="flex-1 flex items-center justify-center py-3 px-3 border border-red-500 text-red-500 rounded-lg font-bold shadow-sm hover:bg-red-50 transition disabled:opacity-50 dark:hover:bg-[#4A403A]"
                        >
                            {submitting ? '...' : 'Decline'}
                        </button>
                    </div>
                )}
                
                {!isActionable && (currentStatus === 'approved' || currentStatus === 'ordered') && (
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/30">
                        <p className="text-sm text-green-700 dark:text-green-400 font-bold flex items-center justify-center gap-2">
                            <Icons.CheckCircleIcon className="w-5 h-5" /> Approved
                        </p>
                    </div>
                )}
                
                {!isActionable && currentStatus === 'declined' && (
                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/30">
                        <p className="text-sm text-red-700 dark:text-red-400 font-bold">Declined</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuotationCard;