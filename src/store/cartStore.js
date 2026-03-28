import { create } from 'zustand';
import api from '../services/api.js';

export const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/cart');
      set({ items: res.data.data.cart.items, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch cart', error);
    }
  },

  addToCart: async (productId, quantity = 1, color = null) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/cart/add', { productId, quantity, color });
      set({ items: res.data.data.cart.items, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (productId, quantity, color = null) => {
    try {
      const res = await api.put('/cart/update', { productId, quantity, color });
      set({ items: res.data.data.cart.items });
    } catch (error) {
      console.error('Failed to update cart', error);
      throw error;
    }
  },

  removeItem: async (productId) => {
    try {
      const res = await api.delete(`/cart/remove/${productId}`);
      set({ items: res.data.data.cart.items });
    } catch (error) {
      console.error('Failed to remove item', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart/clear');
      set({ items: [] });
    } catch (error) {
      console.error('Failed to clear cart', error);
      throw error;
    }
  },

  cartTotal: () => {
    const items = get().items;
    return items.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  },
  
  cartCount: () => {
    const items = get().items;
    return items.reduce((count, item) => count + item.quantity, 0);
  }
}));
