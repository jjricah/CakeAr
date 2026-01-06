import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, customization = null) => {
    const existingItem = cartItems.find(
      (item) => item._id === product._id && JSON.stringify(item.customization) === JSON.stringify(customization)
    );

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item._id === product._id && JSON.stringify(item.customization) === JSON.stringify(customization)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity, customization }]);
    }
  };

  const removeFromCart = (productId, customization = null) => {
    setCartItems(
      cartItems.filter(
        (item) => !(item._id === productId && JSON.stringify(item.customization) === JSON.stringify(customization))
      )
    );
  };

  const updateQuantity = (productId, quantity, customization = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, customization);
      return;
    }

    setCartItems(
      cartItems.map((item) =>
        item._id === productId && JSON.stringify(item.customization) === JSON.stringify(customization)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
