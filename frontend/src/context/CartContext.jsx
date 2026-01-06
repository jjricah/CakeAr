// frontend/src/context/CartContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { nanoid } from 'nanoid'; 

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. LOAD CART
  useEffect(() => {
    let finalCart = [];

    if (user && user._id) {
      // --- LOGGED IN USER ---
      const userCartKey = `cart_${user._id}`;
      const guestCartKey = 'cart_guest';

      const userCartStr = localStorage.getItem(userCartKey);
      const guestCartStr = localStorage.getItem(guestCartKey);

      let userCart = userCartStr ? JSON.parse(userCartStr) : [];
      let guestCart = guestCartStr ? JSON.parse(guestCartStr) : [];

      // MERGE LOGIC: If there are guest items, add them to the user's cart
      if (guestCart.length > 0) {
        finalCart = [...userCart, ...guestCart];
        // Clear guest cart after merging so we don't merge it again later
        localStorage.removeItem(guestCartKey);
        // Update the user's storage immediately
        localStorage.setItem(userCartKey, JSON.stringify(finalCart));
      } else {
        finalCart = userCart;
      }
    } else {
      // --- GUEST USER ---
      const guestCartStr = localStorage.getItem('cart_guest');
      finalCart = guestCartStr ? JSON.parse(guestCartStr) : [];
    }
    
    setCartItems(finalCart);
    setIsLoaded(true);
  }, [user]);

  // 2. SAVE CART
  useEffect(() => {
    if (user && user._id && isLoaded) {
      const userCartKey = `cart_${user._id}`;
      localStorage.setItem(userCartKey, JSON.stringify(cartItems));
    } else if (!user && isLoaded) {
      localStorage.setItem('cart_guest', JSON.stringify(cartItems));
    }
  }, [cartItems, user, isLoaded]);

  // --- ACTIONS ---

  const addToCart = (productToAdd) => {
    setCartItems((prev) => {
      // For standard products, check if an existing item has the same options
      const isStandard = productToAdd.type === 'standard';
      
      const existingIdx = prev.findIndex((item) => 
        isStandard && 
        item._id === productToAdd._id && // Same product DB ID
        item.type === 'standard' &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(productToAdd.selectedOptions)
      );

      if (existingIdx > -1) {
        const newItems = [...prev];
        newItems[existingIdx].quantity += productToAdd.quantity;
        return newItems;
      }
      
      // ✅ NEW: Assign a unique ID for single item tracking
      return [...prev, { ...productToAdd, id: nanoid() }];
    });
  };

  const removeFromCart = (uniqueId) => { // Now accepts uniqueId
    // ✅ FIXED: Filter based on the unique item ID
    setCartItems(prev => prev.filter(item => item.id !== uniqueId));
  };

  const removePurchasedItems = (purchasedItems) => {
    setCartItems(prev => {
        // Create a Set of the unique IDs (id) that were just purchased
        const idsToRemove = new Set(purchasedItems.map(i => i.id));
        
        // Keep items that are NOT in the purchased list
        return prev.filter(item => !idsToRemove.has(item.id));
    });
  };

  const clearCart = () => setCartItems([]);

  // 🛠️ MODIFIED: Update function to explicitly handle the required fields (config, estimatedPrice, snapshotImage)
  // for a custom cake design item, fulfilling the requirement for the "Edit from Cart" flow.
  const updateCartItem = (uniqueId, newConfig, newPrice, newSnapshotImage) => {
    setCartItems(prev => {
      const index = prev.findIndex(item => item.id === uniqueId); // Find item by unique ID
      if (index === -1) return prev; 
      
      const newItems = [...prev];
      
      // ✅ FIX: Update the correct properties: 'selectedOptions' and 'price'
      newItems[index] = { 
        ...newItems[index], 
        selectedOptions: newConfig,
        price: newPrice,
        snapshotImage: newSnapshotImage,
      }; 
      return newItems;
    });
  };

  // ✅ NEW: Dedicated function for updating quantity only
  const updateCartItemQuantity = (uniqueId, newQuantity) => {
    setCartItems(prev => {
      return prev.map(item => 
        item.id === uniqueId 
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, clearCart, updateCartItem, removePurchasedItems,
      updateCartItemQuantity // Export the new function
    }}>
      {children}
    </CartContext.Provider>
  );
};