// frontend/src/pages/Cart.jsx
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import SubHeader from '../components/SubHeader'; 
import * as Icons from '../components/Icons';   
import AlertModal from '../components/common/AlertModal';

const Cart = () => {
  // 1. Destructure updateCartItem from context
  const { cartItems, removeFromCart, updateCartItemQuantity } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });

  const toggleSelect = (index) => {
    if (selectedIndices.includes(index)) setSelectedIndices(selectedIndices.filter(i => i !== index));
    else setSelectedIndices([...selectedIndices, index]);
  };

  const toggleSelectAll = () => {
    if (selectedIndices.length === cartItems.length) setSelectedIndices([]);
    else setSelectedIndices(cartItems.map((_, i) => i));
  };

  // 2. NEW: Handle Quantity Logic now uses unique item ID
  const handleQuantityChange = (index, delta) => {
    const item = cartItems[index];
    const newQuantity = item.quantity + delta;

    if (newQuantity < 1) return;

    // ✅ FIX: Use the dedicated quantity update function
    updateCartItemQuantity(item.id, newQuantity);
  };

  const selectedSubtotal = cartItems.filter((_, index) => selectedIndices.includes(index)).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const handleProceedToCheckout = () => {
    if (selectedIndices.length === 0) {
        return setAlertModal({ isOpen: true, title: 'No Items Selected', message: 'Please select an item to proceed to checkout.' });
    }
    // Filter the actual item objects by the selected indices
    const itemsToBuy = cartItems.filter((_, index) => selectedIndices.includes(index));
    sessionStorage.setItem('checkoutItems', JSON.stringify(itemsToBuy)); // Store selected items temporarily
    navigate('/checkout', { state: { itemsToBuy } });
  };

  const handleItemClick = (item, index) => {
    if (item.type === 'custom' || item.type === 'scratch_build') {
      const baseUnit = item.quantity > 0 ? item.price / item.quantity : item.price;
      // Pass item.id to identify the specific item being edited in cart
      navigate('/cake-builder', { state: { initialConfig: item.selectedOptions, mode: 'edit', basePrice: baseUnit, fromCart: true, cartId: item.id } });
    } else navigate(`/product/${item._id}`);
  };

  if (cartItems.length === 0) return (
    // Ensured min-h-screen and centered layout for empty state
    <div className="min-h-screen flex flex-col items-center justify-center font-sans text-[#4A403A] dark:text-[#F3EFE0] bg-[#F9F7F2] dark:bg-[#1E1A17]">
      <div className="text-6xl mb-4 opacity-50"><Icons.Cart /></div>
      <h2 className="text-lg font-bold mb-2">Cart is empty</h2>
      <button onClick={() => navigate('/dashboard')} className="text-[#C59D5F] font-bold text-sm border-b-2 border-[#C59D5F]">Go shopping</button>
    </div>
  );

  return (
    <>
        <AlertModal
            isOpen={alertModal.isOpen}
            title={alertModal.title}
            message={alertModal.message}
            onClose={() => setAlertModal({ isOpen: false, title: '', message: '' })}
        />
        <div className="min-h-screen font-sans text-[#4A403A] dark:text-[#F3EFE0] pb-28 bg-[#F9F7F2] dark:bg-[#1E1A17]">
          
          {/* HEADER */}
          <SubHeader title={`My Cart (${cartItems.length})`} />

          <div className="p-4 space-y-4 md:p-6">
            {/* Select All */}
            <div className="flex items-center gap-3 bg-white dark:bg-[#4A403A] p-4 rounded-2xl border border-[#E6DCCF] dark:border-[#2C2622] shadow-sm">
              <input type="checkbox" className="w-5 h-5 accent-[#C59D5F] cursor-pointer" checked={cartItems.length > 0 && selectedIndices.length === cartItems.length} onChange={toggleSelectAll} />
              <span className="font-bold text-sm">Select All Items</span>
            </div>

            {/* List */}
            {cartItems.map((item, index) => (
              // Use item.id as the key for best practice
              <div key={item.id} className="bg-white dark:bg-[#4A403A] p-3 rounded-2xl flex gap-3 shadow-sm border border-[#E6DCCF] dark:border-[#2C2622] items-center relative group">
                <div className="relative z-10 pl-1">
                  <input type="checkbox" className="w-5 h-5 accent-[#C59D5F] cursor-pointer" checked={selectedIndices.includes(index)} onChange={() => toggleSelect(index)} />
                </div>
                
                <div className="flex-1 flex gap-3 items-center overflow-hidden">
                    {/* Click Image to Edit */}
                    <div className="w-16 h-16 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-xl overflow-hidden flex-shrink-0 border border-transparent hover:border-[#C59D5F] transition flex items-center justify-center cursor-pointer" onClick={() => handleItemClick(item, index)}>
                      {item.image ? <img src={item.image} className="w-full h-full object-cover" alt={item.title}/> : <span className="text-2xl opacity-50"><Icons.CakeSolid /></span>}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate pr-6 text-[#4A403A] dark:text-[#F3EFE0]">{item.title}</h3>
                        <p className="text-xs text-[#B0A69D] dark:text-[#E6DCCF] mt-0.5 truncate">
                          {item.selectedOptions?.size || 'Standard'} • {item.selectedOptions?.flavor || 'Vanilla'}
                        </p>
                        
                        <div className="flex justify-between items-center mt-2">
                            
                            {/* 3. NEW: QUANTITY CONTROLS */}
                            <div className="flex items-center bg-[#F9F7F2] dark:bg-[#2C2622] rounded-lg border border-[#E6DCCF] dark:border-[#4A403A] h-8">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleQuantityChange(index, -1); }} 
                                className="w-8 h-full flex items-center justify-center text-[#8B5E3C] dark:text-[#F3EFE0] hover:bg-[#E6DCCF] dark:hover:bg-[#4A403A] rounded-l-lg transition"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-[#4A403A] dark:text-[#F3EFE0] w-6 text-center">{item.quantity}</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleQuantityChange(index, 1); }} 
                                className="w-8 h-full flex items-center justify-center text-[#8B5E3C] dark:text-[#F3EFE0] hover:bg-[#E6DCCF] dark:hover:bg-[#4A403A] rounded-r-lg transition"
                              >
                                +
                              </button>
                            </div>

                            <span className="text-sm font-bold text-[#C59D5F]">₱{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                {/* ✅ FIXED: Use item.id for removal */}
                <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }} className="absolute top-3 right-3 text-xs text-red-400 font-bold p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg z-20">✕</button>
              </div>
            ))}
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#2C2622] border-t border-[#E6DCCF] dark:border-[#4A403A] p-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-30 pb-safe">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#B0A69D] dark:text-[#E6DCCF] uppercase font-bold">Total ({selectedIndices.length})</span>
                <span className="text-xl font-extrabold text-[#C59D5F]">₱{selectedSubtotal.toLocaleString()}</span>
              </div>
              <button onClick={handleProceedToCheckout} disabled={selectedIndices.length === 0}
                className="bg-[#4A403A] dark:bg-[#C59D5F] text-white px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition disabled:opacity-50 disabled:scale-100">
                {user ? 'Check Out' : 'Login to Checkout'}
              </button>
            </div>
          </div>
        </div>
    </>
  );
};

export default Cart;