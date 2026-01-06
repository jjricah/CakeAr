import { useState, useContext, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import api from '../services/api';
import SubHeader from '../components/SubHeader';
// FIX: Use NAMED IMPORTS for required icons (Adding Clock, Location, Money)
import { Back, Cart, Check, Store, Clock, Location, Money } from '../components/Icons'; 
import { format } from 'date-fns'; // Required for date handling

// --- MOCK CONSTANTS ---
const MIN_LEAD_DAYS = 4;
const STANDARD_DELIVERY_FEE = 150; // Renamed for clarity

// --- NEW HELPER: Calculates the earliest valid date (Today + MIN_LEAD_DAYS)
const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + MIN_LEAD_DAYS);
  return d.toISOString().split('T')[0];
};
// --- NEW HELPER: Parse URL Query Parameters ---
const useQuery = () => new URLSearchParams(useLocation().search);
// -----------------------------------------------------

const Checkout = () => {
    const navigate = useNavigate();
    const query = useQuery(); // Use the new query hook
    const { user } = useContext(AuthContext);
    const { cartItems, removePurchasedItems } = useContext(CartContext); // ✅ FIX: Use removePurchasedItems

    // ✅ FIX: Get designId from URL query parameter
    const designId = query.get('designId'); 

    // --- NEW STATES FOR CUSTOM FLOW ---
    const [isCustomFlow, setIsCustomFlow] = useState(false);
    const [designData, setDesignData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    // ------------------------------------

    // Initial Form State
    const [formData, setFormData] = useState({
        shippingAddress: user?.address || '',
        paymentMethod: 'COD',
        // Default date needed to the minimum valid date
        dateNeeded: getMinDate(), 
        specialRequests: '',
        // ✅ NEW: Payment fields for GCash flow
        proofOfPaymentImage: null, // Base64 string
        paymentReference: ''
    });

    // --- Data Fetching and Initialization ---
    useEffect(() => {
        const initializeCheckout = async () => {
            if (designId) {
                // Case 1: Custom Design Checkout
                setIsCustomFlow(true);
                try {
                    // Fetch the approved design details
                    // ✅ FIX: Use standard api.get instead of undefined getDesignById
                    const res = await api.get(`/designs/${designId}`);
                    const design = res.data;

                    // Critical Check: Ensure design is 'approved'
                    if (design.status !== 'approved' || !design.finalPrice) {
                        setError("Design is not approved or is missing a final price. Status: " + design.status);
                        return;
                    }
                    
                    setDesignData(design);
                    
                    // Pre-fill date from design request, if available and valid
                    if (design.targetDate && new Date(design.targetDate) >= new Date(getMinDate())) {
                        setFormData(prev => ({ 
                            ...prev, 
                            dateNeeded: format(new Date(design.targetDate), 'yyyy-MM-dd') 
                        }));
                    }
                    
                    // ✅ NEW: Enforce Payment Preference if set by Seller
                    if (design.paymentPreference === 'gcash_only') {
                        setFormData(prev => ({ ...prev, paymentMethod: 'GCash' }));
                    }

                } catch (err) {
                    setError(err.response?.data?.message || "Failed to load approved design details.");
                } finally {
                    setLoading(false);
                }
            } else {
                // Case 2: Standard Cart Checkout
                setIsCustomFlow(false);
                
                // ✅ FIX: Retrieve selected items from state OR session storage
                let itemsToBuy = location.state?.itemsToBuy;
                if (!itemsToBuy) {
                    const stored = sessionStorage.getItem('checkoutItems');
                    if (stored) itemsToBuy = JSON.parse(stored);
                }

                if (!itemsToBuy || itemsToBuy.length === 0) {
                    setError("Your cart is empty. Nothing to checkout.");
                    setCheckoutItems([]);
                } else {
                    setCheckoutItems(itemsToBuy);
                }
                setLoading(false);
            }
        };

        initializeCheckout();
    }, [designId, cartItems.length, user]);
    
    // --- Helper Calculations ---
    const calculateSubtotal = () => {
        if (isCustomFlow && designData) {
            return designData.finalPrice || 0;
        }
        // ✅ FIX: Calculate based on checkoutItems, not all cartItems
        if (!isCustomFlow && checkoutItems.length > 0) {
            return checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        }
        return 0;
    };

    // ✅ NEW: Determine Delivery Fee
    const deliveryFee = (isCustomFlow && designData && designData.shippingFee !== undefined) 
        ? designData.shippingFee 
        : STANDARD_DELIVERY_FEE;

    const subtotal = calculateSubtotal();

    // ✅ NEW: Determine amount to pay now
    const amountToPayNow = (isCustomFlow && designData?.downpaymentAmount > 0)
        ? designData.downpaymentAmount
        : (subtotal > 0 ? subtotal + deliveryFee : 0);

    const fullPrice = subtotal > 0 ? subtotal + deliveryFee : 0;

    // --- Form Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError(null);
        try {
            const base64Image = await convertToBase64(file);
            setFormData(prev => ({ ...prev, proofOfPaymentImage: base64Image }));
        } catch (e) {
            setError("Failed to process image.");
            setFormData(prev => ({ ...prev, proofOfPaymentImage: null }));
        }
    };
    
    // --- Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (amountToPayNow <= 0 || submitting) return;
        setSubmitting(true);
        setError(null);

        // Basic validation for GCash
        if (formData.paymentMethod === 'GCash' && !formData.proofOfPaymentImage) {
            setError("Please upload proof of payment for GCash orders.");
            setSubmitting(false);
            return;
        }

        try {
            let orderPayload = {
                ...formData,
                // Ensure date is sent in ISO format
                dateNeeded: new Date(formData.dateNeeded).toISOString(), 
                // Total amount should be verified on the server, but client calculates for display
                totalAmount: amountToPayNow // Send the amount being paid now
            };

            let res;
            if (isCustomFlow && designData) {
                // ✅ CUSTOM FLOW SUBMISSION: Call dedicated route
                orderPayload.designId = designData._id;
                // The backend (orderController.js) handles item creation from designId
                // ✅ FIX: Use standard api.post instead of undefined createOrderFromDesign
                res = await api.post('/orders/design', orderPayload);
            } else {
                // STANDARD CART FLOW SUBMISSION: Call standard route
                // ✅ FIX: Send only the selected items
                orderPayload.items = checkoutItems; 
                res = await api.post('/orders', orderPayload);
                
                // ✅ FIX: Remove only purchased items from cart
                removePurchasedItems(checkoutItems);
                sessionStorage.removeItem('checkoutItems');
            }

            navigate('/my-orders', { state: { successMessage: 'Order placed successfully!' } });

        } catch (err) {
            console.error("Order Submission Error:", err);
            setError(err.response?.data?.message || "Failed to place order. Please check all fields.");
        } finally {
            setSubmitting(false);
        }
    };

    // --- Render Logic ---
    if (loading) return <div className="p-10 text-center text-gray-400">Loading Checkout...</div>;
    if (error && !isCustomFlow && checkoutItems.length === 0) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

    const itemsDisplay = isCustomFlow && designData
        ? [{ title: `Custom Cake Design #${designData._id.slice(-4)}`, price: designData.finalPrice, quantity: 1, image: designData.snapshotImage }]
        : checkoutItems; // ✅ FIX: Use checkoutItems for display

    return (
        <div className="p-4 md:p-8">
            <SubHeader title={isCustomFlow ? 'Custom Cake Order Checkout' : 'Standard Checkout'} />

            {/* Error Banner */}
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Item Summary (Col 1/3) */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-[#2C2622] rounded-xl shadow-lg p-6 mb-8 border border-[#E6DCCF] dark:border-[#4A403A]">
                        <h2 className="text-xl font-bold text-[#C59D5F] mb-4">
                            {isCustomFlow ? 'Approved Design' : 'Items'}
                        </h2>
                        
                        <div className="space-y-3">
                            {itemsDisplay.map((item, index) => (
                                <div key={item._id || index} className="flex justify-between items-center text-sm">
                                    <div className='flex items-center gap-2'>
                                        {isCustomFlow && item.image && (
                                            <img src={item.image} alt="Cake Preview" className="w-8 h-8 object-cover rounded" />
                                        )}
                                        <span className='text-[#4A403A] dark:text-[#E6DCCF]'>{item.title}</span>
                                    </div>
                                    <span className="font-bold text-[#4A403A] dark:text-[#E6DCCF]">
                                        ₱{(item.price * item.quantity).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                    </div>
                    
                    {/* Price Summary */}
                    <div className="sticky top-4 bg-[#F9F7F2] dark:bg-[#1E1A17] rounded-xl p-6 shadow-lg border border-[#C59D5F] space-y-4">
                        <h3 className="text-xl font-bold text-[#C59D5F] mb-4">Total Breakdown</h3>
                        
                        <div className="flex justify-between text-[#4A403A] dark:text-[#E6DCCF]">
                            <span>Subtotal:</span>
                            <span>₱{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[#4A403A] dark:text-[#E6DCCF]">
                            <span>Delivery Fee:</span>
                            <span>₱{deliveryFee.toLocaleString()}</span>
                        </div>
                        
                        <div className="border-t border-[#E6DCCF] dark:border-[#4A403A] pt-4 flex justify-between font-extrabold text-xl text-[#4A403A] dark:text-[#F3EFE0]">
                            {/* ✅ NEW: Differentiate between downpayment and full payment */}
                            {isCustomFlow && designData?.downpaymentAmount > 0 ? (
                                <>
                                    <span>Downpayment Due:</span>
                                    <span className="text-[#C59D5F]">₱{amountToPayNow.toLocaleString()}</span>
                                </>
                            ) : (
                                <>
                                    <span>Total Amount:</span>
                                    <span className="text-[#C59D5F]">₱{amountToPayNow.toLocaleString()}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Shipping & Payment Form (Col 2 & 3) */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Delivery Details */}
                        <div className="bg-white dark:bg-[#2C2622] rounded-xl shadow-lg p-6 border border-[#E6DCCF] dark:border-[#4A403A] space-y-4">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-[#4A403A] dark:text-[#F3EFE0]">
                            <Clock className="w-5 h-5 text-[#C59D5F]" /> Delivery & Date
                            </h3>
                            <label className="block text-sm font-medium text-[#B0A69D]">Date Cake is Needed (Min {MIN_LEAD_DAYS} days)</label>
                            <input
                                type="date"
                                name="dateNeeded"
                                value={formData.dateNeeded}
                                onChange={handleChange}
                                required
                                min={getMinDate()}
                                className="w-full p-3 bg-[#F9F7F2] dark:bg-[#1E1A17] rounded-lg border border-[#E6DCCF] dark:border-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] focus:border-[#C59D5F] outline-none"
                            />
                            <h3 className="flex items-center gap-2 text-lg font-bold text-[#4A403A] dark:text-[#F3EFE0]">
                                <Location className="w-5 h-5 text-[#C59D5F]" /> Shipping Address
                            </h3>
                            <textarea
                                name="shippingAddress"
                                value={formData.shippingAddress}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Full Address"
                                required
                                className="w-full p-3 bg-[#F9F7F2] dark:bg-[#1E1A17] rounded-lg border border-[#E6DCCF] dark:border-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] focus:border-[#C59D5F] outline-none"
                            />
                            <textarea
                                name="specialRequests"
                                value={formData.specialRequests}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Special delivery instructions or order notes (optional)"
                                className="w-full p-3 bg-[#F9F7F2] dark:bg-[#1E1A17] rounded-lg border border-[#E6DCCF] dark:border-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] focus:border-[#C59D5F] outline-none"
                            />
                        </div>
                        
                        {/* Payment Method */}
                        <div className="bg-white dark:bg-[#2C2622] rounded-xl shadow-lg p-6 border border-[#E6DCCF] dark:border-[#4A403A] space-y-4">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-[#4A403A] dark:text-[#F3EFE0]">
                                <Money className="w-5 h-5 text-[#C59D5F]" /> Payment Method
                            </h3>
                            {/* Radio buttons for payment method selection */}
                            <section className="flex flex-col gap-3">
                                {/* ✅ FIX: Conditionally render COD option */}
                                {!((isCustomFlow && designData?.paymentPreference === 'gcash_only') || (isCustomFlow && designData?.downpaymentAmount > 0)) && (
                                    <label key="COD" className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="COD" 
                                            checked={formData.paymentMethod === 'COD'} 
                                            onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'COD', proofOfPaymentImage: null, paymentReference: '' }))} 
                                        />
                                        <span className="font-bold text-sm text-[#4A403A] dark:text-[#E6DCCF]">
                                            Cash on Delivery
                                        </span>
                                    </label>
                                )}
                                <label key="GCash" className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="paymentMethod" value="GCash" checked={formData.paymentMethod === 'GCash'} onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'GCash' }))} />
                                    <span className="font-bold text-sm text-[#4A403A] dark:text-[#E6DCCF]">GCash</span>
                                </label>
                            </section>
                            
                            {/* GCash Proof of Payment Field */}
                            {formData.paymentMethod === 'GCash' && (
                                <div className="p-4 bg-yellow-50 dark:bg-[#4A403A]/50 rounded-lg border border-yellow-200 dark:border-[#C59D5F] space-y-3">
                                    <p className="text-sm font-bold text-[#4A403A] dark:text-[#F3EFE0]">GCash Payment Instructions</p>
                                    <div className="text-xs text-[#4A403A] dark:text-[#E6DCCF] bg-white/50 dark:bg-black/20 p-3 rounded-md">
                                        <p className="mb-2">Please send <strong>₱{amountToPayNow.toLocaleString()}</strong> to the following GCash account:</p>
                                        <p><strong>Account Name:</strong> {designData?.baker?.payoutInfo?.accountName || 'N/A'}</p>
                                        <p><strong>Account Number:</strong> {designData?.baker?.payoutInfo?.accountNumber || 'Not Provided'}</p>
                                        <p className="mt-2">After sending, upload a screenshot of your transaction receipt below.</p>
                                    </div>
                                    <input
                                        type="text"
                                        name="paymentReference"
                                        value={formData.paymentReference}
                                        onChange={handleChange}
                                        placeholder="Enter GCash Ref. Number (Optional)"
                                        className="w-full p-2 mb-2 bg-white dark:bg-[#2C2622] rounded-md text-sm outline-none border border-[#E6DCCF]"
                                    />
                                    <label className="block text-xs font-medium text-[#B0A69D] mb-1">Upload Proof of Payment (Screenshot)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        required={!formData.proofOfPaymentImage}
                                        className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E6DCCF] file:text-[#4A403A] hover:file:bg-[#C59D5F]/50"
                                    />
                                    {formData.proofOfPaymentImage && (
                                        <p className="text-xs text-green-600 mt-2">Proof of payment uploaded.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sticky Action Bar for Mobile/General */}
                        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#2C2622] border-t border-[#E6DCCF] dark:border-[#4A403A] p-4 shadow-lg z-30 pb-safe lg:relative lg:p-0 lg:border-t-0 lg:shadow-none">
                            {error && <p className="text-red-500 font-bold text-center mb-2">{error}</p>}
                            
                            <div className="flex justify-between items-center mb-4 text-lg font-bold text-[#4A403A] dark:text-[#F3EFE0]">
                                {isCustomFlow && designData?.downpaymentAmount > 0 ? (
                                    <span>Downpayment Due:</span>
                                ) : (
                                    <span>Order Total:</span>
                                )}
                                <span className="text-[#C59D5F]">₱{amountToPayNow.toLocaleString()}</span>
                            </div>
                            
                            <button type="submit" disabled={submitting || amountToPayNow <= 0 || (formData.paymentMethod === 'GCash' && !formData.proofOfPaymentImage)} 
                                className="w-full bg-[#4A403A] dark:bg-[#C59D5F] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#3E3632] transition active:scale-[0.98] disabled:opacity-70"
                            >
                                {submitting ? 'Placing Order...' : (
                                    <span className="flex items-center justify-center gap-2">
                                        Pay Now (₱{amountToPayNow.toLocaleString()})
                                        <Check className="w-5 h-5" /> 
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;