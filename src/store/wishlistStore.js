import { create } from 'zustand';
import api from '../services/api.js';

export const useWishlistStore = create((set, get) => ({
  wishlist: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/wishlist');
      set({ wishlist: res.data.data.wishlist.products, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch wishlist', error);
    }
  },

  toggleWishlist: async (productId) => {
    // Optimistic UI update
    const currentWishlist = get().wishlist;
    const isSaved = currentWishlist.some(p => p._id === productId);
    
    // Optimistically update
    if (isSaved) {
        set({ wishlist: currentWishlist.filter(p => p._id !== productId) });
    } else {
        // We only have the ID, so we might need more if we want a full product object immediately
        // For simplicity, just append the ID (or wait for the official response)
        // Let's just wait for the response to avoid incomplete objects
    }

    try {
      const res = await api.post('/wishlist/toggle', { productId });
      // The backend toggle usually returns the updated wishlist or a simple message
      // If it doesn't return the full wishlist, call fetchWishlist
      await get().fetchWishlist();
      return !isSaved; // returns the new state
    } catch (error) {
      // Rollback on error
      set({ wishlist: currentWishlist });
      throw error;
    }
  },

  isInWishlist: (productId) => {
    return get().wishlist.some(p => p._id === productId);
  }
}));
