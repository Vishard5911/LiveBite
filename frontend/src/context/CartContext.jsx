import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    restaurant: null,
    items: [],
  });

  const addToCart = (restaurant, item) => {
    setCart((prevCart) => {
      // Check if trying to add item from a different restaurant
      if (prevCart.restaurant && prevCart.restaurant._id !== restaurant._id) {
        if (!window.confirm("Adding an item from a different restaurant will clear your current cart. Proceed?")) {
          return prevCart;
        }
        return {
          restaurant,
          items: [{ ...item, quantity: 1 }]
        };
      }

      const existingItemIndex = prevCart.items.findIndex(i => i._id === item._id);
      if (existingItemIndex >= 0) {
        const newItems = [...prevCart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1
        };
        return { ...prevCart, items: newItems };
      }

      return {
        restaurant: restaurant || prevCart.restaurant,
        items: [...prevCart.items, { ...item, quantity: 1 }]
      };
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.filter(i => i._id !== itemId)
    }));
  };

  const updateQuantity = (itemId, change) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(i => i._id === itemId);
      if (existingItemIndex === -1) return prevCart;

      const newItems = [...prevCart.items];
      newItems[existingItemIndex] = { 
        ...newItems[existingItemIndex], 
        quantity: newItems[existingItemIndex].quantity + change 
      };

      if (newItems[existingItemIndex].quantity <= 0) {
        return {
          ...prevCart,
          items: prevCart.items.filter(i => i._id !== itemId)
        };
      }

      return { ...prevCart, items: newItems };
    });
  };

  const clearCart = () => setCart({ restaurant: null, items: [] });

  const getSubtotal = () => {
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cart, cartItems: cart.items, addToCart, removeFromCart, updateQuantity, clearCart, getSubtotal }}>
      {children}
    </CartContext.Provider>
  );
};
