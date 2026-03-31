import { create } from 'zustand';
import api from '../services/api.js';

export const useFollowStore = create((set, get) => ({
  following: [],
  isLoading: false,

  fetchFollowing: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/auth/following');
      set({ following: res.data.data.following, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  toggleFollow: async (vendorId) => {
    try {
      const res = await api.post(`/auth/follow/${vendorId}`);
      const isNowFollowing = res.data.data.checked;
      
      // Update local state instantly
      const currentFollowing = get().following;
      if (isNowFollowing) {
        // We might not have the full vendor object yet if we are on ProductDetail,
        // but we'll re-fetch on Profile page mount. 
        // For now, just ensure it's in the list of IDs if we use it for UI state.
        // Actually, we usually want to re-fetch if we are on the profile page.
        await get().fetchFollowing(); 
      } else {
        set({
          following: currentFollowing.filter(v => v._id !== vendorId)
        });
      }
      return isNowFollowing;
    } catch (error) {
      throw error;
    }
  },

  isFollowing: (vendorId) => {
    return get().following.some(v => v._id === vendorId);
  }
}));
