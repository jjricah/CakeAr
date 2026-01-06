import { useState, useContext, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCakeConfig } from '../components/builder/useCakeConfig';
import api from '../services/api';
import { Back, Check, UndoIcon, RedoIcon, AR } from '../components/Icons';
import CakeScene from '../components/builder/CakeScene';
import CakeCustomizer from '../components/builder/CakeCustomizer';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import ConfirmationModal from '../components/admin/ConfirmationModal';
import AlertModal from '../components/common/AlertModal';

const CakeBuilder = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Retrieve all possible states: design data, submission flags, and NEW viewer flags
    const { initialConfig, bakerId, bakerName, fromCart, cartId, mode, isReadOnly, customerName, designId } = location.state || {};

    // Get user and saveDesign from AuthContext for local storage persistence
    const { user, saveDesign } = useContext(AuthContext);
    const { updateCartItem } = useContext(CartContext);

    // NEW STATE: Central repository for all fetched asset data
    const [assetOptions, setAssetOptions] = useState({
        shapes: [], flavors: [], frostings: [], sizes: [], toppings: [],
        loading: true, error: null
    });

    // --- FETCH ASSETS FROM DATABASE ---
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const res = await api.get('/assets');
                const allAssets = res.data;

                // Organize assets by type for consumption by downstream components
                const organized = {
                    shapes: allAssets.filter(a => a.type === 'Shape'),
                    flavors: allAssets.filter(a => a.type === 'Flavor'),
                    frostings: allAssets.filter(a => a.type === 'Frosting'),
                    // Sort sizes numerically by metadata.value for UI ordering
                    sizes: allAssets.filter(a => a.type === 'Size').sort((a, b) => (a.metadata?.value || 0) - (b.metadata?.value || 0)),
                    heights: allAssets.filter(a => a.type === 'LayerHeight').sort((a, b) => (a.metadata?.value || 0) - (b.metadata?.value || 0)),
                    // Combine toppers and decorations
                    toppings: allAssets.filter(a => ['Topper', 'Decoration'].includes(a.type)),
                    textures: allAssets.filter(a => a.type === 'Texture'),
                };

                setAssetOptions({ ...organized, loading: false, error: null });
            } catch (err) {
                setAssetOptions(prev => ({ ...prev, loading: false, error: "Failed to load cake components. Please check server." }));
            }
        };
        fetchAssets();
    }, []);
    // ------------------------------------

    // Destructure new functions/flags from the hook
    const { config, setConfig, price, resetConfig, undo, redo, canUndo, canRedo } = useCakeConfig(initialConfig, assetOptions);

    const sceneRef = useRef(null);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [snapshotUri, setSnapshotUri] = useState(null); // NEW: To hold the captured image URI
    const [submitData, setSubmitData] = useState({
        dateNeeded: '',
        notes: '',
        requestType: bakerId ? 'direct' : 'broadcast',
        // Preserve initial bakerId if present for direct requests
        selectedBakerId: bakerId, 
        selectedBakerName: bakerName
    });
    const [submitting, setSubmitting] = useState(false);
    // NEW STATES for seller selection
    const [availableSellers, setAvailableSellers] = useState([]);
    const [showSellerSelection, setShowSellerSelection] = useState(false);
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });

    // --- FETCH ALL SELLERS (if needed) ---
    useEffect(() => {
        const fetchAllSellers = async () => {
            if (showQuoteModal && showSellerSelection && availableSellers.length === 0) {
                try {
                    const res = await api.get('/shop/all-sellers'); // Assumes this endpoint exists
                    setAvailableSellers(res.data);
                } catch (err) {
                    console.error("Failed to fetch all sellers:", err);
                    // Optionally show an error message to the user
                }
            }
        };
        fetchAllSellers();
    }, [showQuoteModal, showSellerSelection, availableSellers.length]);
    // ------------------------------------

    const getMinDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + 5);
        return d.toISOString().split('T')[0];
    };

    // --- HANDLER TO OPEN MODAL AND CAPTURE IMAGE ---
    const handleOpenQuoteModal = () => {
        const imageUri = sceneRef.current?.capture();
        setSnapshotUri(imageUri);
        setShowQuoteModal(true);
    }

    // --- SAVE DESIGN HANDLER (Buyer Action) ---
    const handleSaveDesign = () => {
        const imageUri = sceneRef.current?.capture();

        const designToSave = {
            config,
            estimatedPrice: price,
            snapshotImage: imageUri,
            createdAt: new Date().toISOString()
        };

        saveDesign(designToSave);

        alert(user ? "Design saved! You can load it later from your 'My Orders' page." : "Design saved locally! Log in to sync it to your account.");
    };

    const handleSubmitDesign = async (e) => {
        e.preventDefault();
        
        if (!user) {
            alert("You must be logged in to request a quote from a baker.");
            navigate('/login', { state: { from: location } }); // Save location to return after login
            return;
        }

        if (!submitData.dateNeeded) return alert("Please select a date.");

        setSubmitting(true);
        try {
            // Use the snapshot captured when the modal was opened, or recapture as a fallback
            const finalSnapshotUri = snapshotUri || sceneRef.current?.capture();

            const payload = {
                config,
                estimatedPrice: price,
                snapshotImage: finalSnapshotUri, // Use the captured snapshot
                targetDate: submitData.dateNeeded,
                userNote: submitData.notes,
                bakerId: submitData.requestType === 'direct' ? submitData.selectedBakerId : null,
                requestType: submitData.requestType,
            };

            if (mode === 'edit' && fromCart) {
                // ✅ FIX: Actual logic to update the cart item
                if (updateCartItem && cartId) {
                    // The updateCartItem function should handle updating the config, price, and snapshot in the CartContext
                    updateCartItem(cartId, payload.config, price, payload.snapshotImage);
                    alert("Cart item updated successfully!");
                    setShowQuoteModal(false);
                    navigate('/cart');
                } else {
                    // Fallback or error if context/ID is missing
                    console.error("Cart Context or Item ID missing for update.");
                    navigate('/cart');
                }
            } else if (mode === 'edit' && designId) {
                // ✅ NEW: Update existing design submission
                await api.put(`/designs/${designId}`, payload);
                setShowQuoteModal(false);
                navigate('/my-orders', { state: { activeTab: 'requests' } });
            } else {
                // Original logic for new design submission
                await api.post('/designs', payload);
                setShowQuoteModal(false);
                navigate('/my-orders', { state: { activeTab: 'requests' } });
            }
        } catch (error) {
            console.error(error);
            alert("Failed to submit request.");
        } finally {
            setSubmitting(false);
        }
    };
    // Dynamic Header/Panel Title Logic
    let headerTitle = 'Cake Studio';
    let panelTitle = 'Cake Customization';
    if (isReadOnly) {
        headerTitle = `Reviewing Design from ${customerName || 'Customer'}`;
        panelTitle = 'Design Details (Read Only)';
    } else if (mode === 'edit') {
        headerTitle = 'Edit Cake Design';
    }


    // --- Loading/Error UI ---
    if (assetOptions.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2] dark:bg-[#1E1A17]">
                <div className="text-center text-[#C59D5F] font-bold">
                    <span className="text-3xl animate-spin block">⏳</span>
                    Loading 3D Assets...
                    {assetOptions.error && <p className="text-red-500 text-sm mt-4">{assetOptions.error}</p>}
                </div>
            </div>
        );
    }


    return (
        <div className="flex flex-col h-screen bg-[#F9F7F2] dark:bg-[#1E1A17] text-[#4A403A] dark:text-[#F3EFE0]">

            <ConfirmationModal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={() => {
                    resetConfig();
                    setShowClearConfirm(false);
                }}
                title="Clear Entire Design?"
                message="Are you sure you want to start over? All your current customizations will be lost."
                confirmText="Clear All"
                variant="danger"
            />

            {/* --- NEW: Standalone Header for Cake Studio --- */}
            <header className="sticky top-0 z-30 px-4 py-3 bg-[#F3EFE0]/95 dark:bg-[#2C2622]/95 backdrop-blur-md flex items-center justify-between border-b border-[#E6DCCF] dark:border-[#4A403A]">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#4A403A] rounded-full border border-[#E6DCCF] dark:border-[#2C2622] shadow-sm text-[#4A403A] dark:text-[#F3EFE0] hover:text-[#C59D5F] transition"
                    >
                        <Back />
                    </button>
                    <h1 className="text-lg font-bold text-[#4A403A] dark:text-[#F3EFE0]">
                        {headerTitle}
                    </h1>
                </div>
            </header>

            {showQuoteModal && !isReadOnly && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#2C2622] w-full max-w-md rounded-[2rem] p-6 shadow-2xl border border-[#C59D5F]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Request Quote</h3>
                            <button onClick={() => setShowQuoteModal(false)} className="text-gray-400 hover:text-red-500">✕</button>
                        </div>

                        <form onSubmit={handleSubmitDesign} className="space-y-4">

                                                        {/* Conditional rendering for seller selection or request type buttons */}
                                                        <div className="relative"> {/* NEW WRAPPER DIV */}
                                                                                                                        {showSellerSelection ? (
                                                                                                                            <div className="p-3 bg-[#F9F7F2] dark:bg-[#4A403A] rounded-xl">
                                                                                                                                <label className="text-xs font-bold uppercase text-[#B0A69D] mb-2 block">Select a Seller:</label>
                                                                                                                                <button onClick={() => setShowSellerSelection(false)} className="text-sm text-[#C59D5F] underline mb-2">← Back to Request Types</button>
                                                                                                                                <div className="max-h-48 overflow-y-auto space-y-2">
                                                                                                                                    {availableSellers.length > 0 ? (
                                                                                                                                        availableSellers.map(seller => (
                                                                                                                                            <div key={seller._id} className="flex justify-between items-center bg-white dark:bg-[#2C2622] p-2 rounded-lg border border-[#E6DCCF] dark:border-[#5C5047]">
                                                                                                                                                <div className="flex items-center gap-2">
                                                                                                                                                    {seller.shopLogo ? (
                                                                                                                                                        <img src={seller.shopLogo} alt={seller.shopName} className="w-8 h-8 rounded-full object-cover" />
                                                                                                                                                    ) : (
                                                                                                                                                        <div className="w-8 h-8 rounded-full bg-[#C59D5F] flex items-center justify-center text-white text-xs font-bold">{seller.shopName?.[0] || 'S'}</div>
                                                                                                                                                    )}
                                                                                                                                                    <span className="font-bold text-[#4A403A] dark:text-[#F3EFE0]">{seller.shopName}</span>
                                                                                                                                                </div>
                                                                                                                                                <button 
                                                                                                                                                    type="button"
                                                                                                                                                    onClick={() => {
                                                                                                                                                        setSubmitData({ 
                                                                                                                                                            ...submitData, 
                                                                                                                                                            requestType: 'direct', 
                                                                                                                                                            selectedBakerId: seller._id,
                                                                                                                                                            selectedBakerName: seller.shopName
                                                                                                                                                        });
                                                                                                                                                        setShowSellerSelection(false);
                                                                                                                                                    }}
                                                                                                                                                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#C59D5F] text-white hover:bg-[#B0894F]"
                                                                                                                                                >
                                                                                                                                                    Select
                                                                                                                                                </button>
                                                                                                                                            </div>
                                                                                                                                        ))
                                                                                                                                    ) : (
                                                                                                                                        <p className="text-center text-[#B0A69D]">No other sellers available.</p>
                                                                                                                                    )}
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        ) : (
                                                                                                                            <div className="p-3 bg-[#F9F7F2] dark:bg-[#4A403A] rounded-xl">
                                                                                                                                <label className="text-xs font-bold uppercase text-[#B0A69D] mb-2 block">Send Request To:</label>
                                                                                                                                <div className="flex flex-col gap-2"> {/* Changed to flex-col for better layout */}
                                                                                                                                    {bakerId && (
                                                                                                                                        <button type="button" onClick={() => setSubmitData({ 
                                                                                                                                            ...submitData, 
                                                                                                                                            requestType: 'direct', 
                                                                                                                                            selectedBakerId: bakerId, // Use initial bakerId
                                                                                                                                            selectedBakerName: bakerName 
                                                                                                                                        })}
                                                                                                                                            className={`flex-1 py-2 text-xs font-bold rounded-lg border ${submitData.requestType === 'direct' && submitData.selectedBakerId === bakerId ? 'bg-[#C59D5F] text-white border-[#C59D5F]' : 'bg-white dark:bg-[#2C2622] border-[#E6DCCF] dark:border-[#5C5047]'}`}>
                                                                                                                                            {bakerName || "Current Baker"}
                                                                                                                                        </button>
                                                                                                                                    )}
                                                                                                                                    <button type="button" onClick={() => setSubmitData({ 
                                                                                                                                        ...submitData, 
                                                                                                                                        requestType: 'broadcast', 
                                                                                                                                        selectedBakerId: null, // Clear selected baker
                                                                                                                                        selectedBakerName: null 
                                                                                                                                    })}
                                                                                                                                        className={`flex-1 py-2 text-xs font-bold rounded-lg border ${submitData.requestType === 'broadcast' ? 'bg-[#C59D5F] text-white border-[#C59D5F]' : 'bg-white dark:bg-[#2C2622] border-[#E6DCCF] dark:border-[#5C5047]'}`}>
                                                                                                                                        All Sellers (Marketplace)
                                                                                                                                    </button>
                                                                                                                                    {/* New button to open seller selection */}
                                                                                                                                    <button 
                                                                                                                                        type="button" 
                                                                                                                                        onClick={() => setShowSellerSelection(true)}
                                                                                                                                        className={`w-full py-2 text-xs font-bold rounded-lg border transition mt-2 ${submitData.requestType === 'direct' && (!bakerId || submitData.selectedBakerId !== bakerId) ? 'bg-[#C59D5F] text-white border-[#C59D5F]' : 'border-[#E6DCCF] dark:border-[#5C5047] bg-white dark:bg-[#2C2622] text-[#4A403A] dark:text-[#F3EFE0] hover:bg-[#F9F7F2] dark:hover:bg-[#4A403A]'}`}
                                                                                                                                    >
                                                                                                                                        {submitData.requestType === 'direct' && (!bakerId || submitData.selectedBakerId !== bakerId) ? `Selected: ${submitData.selectedBakerName}` : 'Choose Another Seller'}
                                                                                                                                    </button>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        )}                                                        </div> {/* END NEW WRAPPER DIV */}
                            <div>
                                <label className="text-xs font-bold uppercase text-[#8B5E3C] dark:text-[#C59D5F] mb-1 block">Date Needed</label>
                                <input type="date" min={getMinDate()} required value={submitData.dateNeeded} onChange={(e) => setSubmitData({ ...submitData, dateNeeded: e.target.value })} className="w-full p-3 bg-[#F9F7F2] dark:bg-[#4A403A] rounded-xl outline-none border-2 border-transparent focus:border-[#C59D5F] dark:text-[#F3EFE0]" />
                                <p className="text-[10px] text-red-400 mt-1 italic">* Orders must be placed at least 5 days in advance to allow for seller matching and preparation.</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-[#8B5E3C] dark:text-[#C59D5F] mb-1 block">Special Instructions</label>
                                <textarea rows="3" placeholder="Allergies, specific color codes..." value={submitData.notes} onChange={(e) => setSubmitData({ ...submitData, notes: e.target.value })} className="w-full p-3 bg-[#F9F7F2] dark:bg-[#4A403A] rounded-xl outline-none border-2 border-transparent focus:border-[#C59D5F] dark:text-[#F3EFE0]" />
                            </div>

                            <div className="pt-2">
                                <div className="flex justify-between items-center mb-4 text-sm font-bold">
                                    <span>Estimated Price:</span>
                                    <span className="text-[#C59D5F] text-lg">~₱{price.toLocaleString()}</span>
                                </div>
                                <button type="submit" disabled={submitting} className="w-full py-4 bg-[#C59D5F] text-white rounded-xl font-bold shadow-lg hover:bg-[#B0894F] disabled:opacity-70">
                                    {submitting ? 'Sending...' : 'Submit for Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}



            {/* MAIN CONTENT */}
            {/* ✅ FIX: Removed explicit height and added overflow-hidden to make this container fill remaining space and not scroll */}
            <div className="flex-1 w-full max-w-7xl mx-auto px-0 lg:px-6 py-0 lg:py-6 pb-0 lg:pb-6 overflow-hidden">
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-0 lg:gap-6 h-full">
                    {/* Cake Scene is reused for all modes: Edit, Create, Read-Only */}
                    <CakeScene
                        ref={sceneRef}
                        config={config}
                        // Pass color codes from assets for 3D rendering
                        colorMap={{
                            flavors: assetOptions.flavors,
                            frostings: assetOptions.frostings
                        }}
                        handleARPreview={() => alert("Mobile AR Only")}
                    />

                    {/* Controls Container: Flex-1 allows it to take remaining space on mobile */}
                    <div className="flex-1 lg:col-span-1 flex flex-col gap-4 bg-[#F9F7F2] dark:bg-[#1E1A17] lg:bg-transparent overflow-hidden">
                        <div className={`bg-white dark:bg-[#4A403A] lg:rounded-[2rem] border-b lg:border border-[#E6DCCF] dark:border-[#2C2622] shadow-sm overflow-hidden flex flex-col h-full ${isReadOnly ? 'opacity-70 pointer-events-none' : ''}`}>
                            <div className="px-4 py-2 lg:px-6 lg:py-4 border-b border-[#F3EFE0] dark:border-[#2C2622] bg-[#F9F7F2] dark:bg-[#2C2622] flex items-center justify-between">
                                <h3 className="text-sm font-bold text-[#4A403A] dark:text-[#F3EFE0] uppercase tracking-wider">{panelTitle}</h3>
                                {!isReadOnly && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={undo}
                                            disabled={!canUndo}
                                            title="Undo"
                                            className="p-2 rounded-full text-[#B0A69D] disabled:opacity-30 hover:bg-white dark:hover:bg-[#2C2622] transition"
                                        >
                                            <UndoIcon />
                                        </button>
                                        <button
                                            onClick={redo}
                                            disabled={!canRedo}
                                            title="Redo"
                                            className="p-2 rounded-full text-[#B0A69D] disabled:opacity-30 hover:bg-white dark:hover:bg-[#2C2622] transition"
                                        >
                                            <RedoIcon />
                                        </button>
                                        <button
                                            onClick={() => setShowClearConfirm(true)}
                                            title="Clear All"
                                            className="ml-2 px-3 py-1.5 rounded-full text-xs font-bold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50 transition"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="px-4 pt-4 overflow-y-auto custom-scrollbar flex-1">
                                <CakeCustomizer
                                    config={config}
                                    setConfig={setConfig}
                                    limits={{ lockAll: isReadOnly }}
                                    assetOptions={assetOptions}
                                    // Pass reset, undo, redo functions and flags
                                    resetConfig={resetConfig}
                                    undo={undo}
                                    redo={redo}
                                    canUndo={canUndo}
                                    canRedo={canRedo}
                                />
                            </div>
                        </div>

                        <div className="hidden lg:flex w-full gap-4">

                            {isReadOnly && (
                                <button onClick={() => navigate('/seller-dashboard', { state: { activeTab: 'designs' } })}
                                    className="w-full text-white font-bold py-4 rounded-2xl bg-[#4A403A] hover:bg-[#2C2622]">
                                    Back to Inbox
                                </button>
                            )}

                            {!isReadOnly && (
                                <>
                                    <button
                                        onClick={handleSaveDesign}
                                        className="flex-1 text-[#8B5E3C] dark:text-[#F3EFE0] font-bold py-4 rounded-2xl shadow-lg justify-center items-center bg-[#F3EFE0] dark:bg-[#2C2622] hover:bg-[#E6DCCF] transition"
                                    >
                                        Save Design 💾
                                    </button>
                                    {/* MODIFIED: Use the new handler */}
                                    <button onClick={handleOpenQuoteModal} className="flex-1 text-white font-bold py-4 rounded-2xl shadow-lg justify-between px-6 items-center bg-[#C59D5F] hover:bg-[#B0894F]">
                                        <span className="text-base">Request Quote • ~₱{price.toLocaleString()}</span>
                                        <Check />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-[#2C2622] border-t border-[#E6DCCF] dark:border-[#4A403A] p-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 pb-safe">
                <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">

                    {isReadOnly && (
                        <button onClick={() => navigate('/seller-dashboard', { state: { activeTab: 'designs' } })}
                            className="w-full text-white font-bold py-2.5 rounded-xl bg-[#4A403A] hover:bg-[#2C2622]">
                            Return to Inbox
                        </button>
                    )}

                    {!isReadOnly && (
                        <>
                            <div className="flex flex-col">
                                <span className="text-xs text-[#B0A69D] dark:text-[#E6DCCF] font-bold uppercase">Estimated</span>
                                <span className="text-xl font-bold text-[#C59D5F]">₱{price.toLocaleString()}</span>
                            </div>
                            {/* Save Button for Mobile */}
                            <button
                                onClick={handleSaveDesign}
                                className="w-1/4 bg-[#F3EFE0] dark:bg-[#4A403A] text-[#8B5E3C] dark:text-[#F3EFE0] py-2 rounded-xl font-bold text-sm shadow-md flex items-center justify-center transition"
                            >
                                Save Design
                            </button>
                            {/* MODIFIED: Use the new handler */}
                            <button onClick={handleOpenQuoteModal} className="flex-1 bg-[#4A403A] dark:bg-[#C59D5F] text-white py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2">
                                {mode === 'edit' ? 'Confirm Changes' : 'Request Quote'}
                                <Check />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CakeBuilder;