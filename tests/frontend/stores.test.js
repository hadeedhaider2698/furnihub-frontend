import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../../src/store/authStore.js';
import { useCartStore } from '../../src/store/cartStore.js';

describe('Zustand Global Stores', () => {
  describe('authStore', () => {
    beforeEach(() => {
      useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
    });

    it('Initial state: user null, accessToken null', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
    });

    it('login() sets user and accessToken precisely', () => {
      const mockUser = { _id: '1', name: 'TestUser' };
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setAccessToken('test_token');
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('test_token');
    });

    it('logout() clears user and accessToken immediately', () => {
      useAuthStore.setState({ user: { name: 'A' }, accessToken: 'token' });
      useAuthStore.getState().logout(true); // Call localOnly=true since api is not mocked here
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
    });
  });

  describe('cartStore', () => {
    beforeEach(() => {
      useCartStore.setState({ items: [], isLoading: false });
    });

    it('Initial state: empty items array, count 0, total 0', () => {
      const state = useCartStore.getState();
      expect(state.items).toEqual([]);
      expect(state.cartCount()).toBe(0);
      expect(state.cartTotal()).toBe(0);
    });

    it('cartCount computed correctly as sum of all quantities', () => {
      useCartStore.setState({
        items: [
          { product: { _id: '1', price: 100 }, quantity: 2 },
          { product: { _id: '2', price: 50 }, quantity: 3 }
        ]
      });
      const count = useCartStore.getState().cartCount();
      expect(count).toBe(5); // 2 + 3
    });

    it('cartTotal computed correctly mathematically without discounts', () => {
      useCartStore.setState({
        items: [
          { product: { _id: '1', price: 100 }, quantity: 2 }, // 200
          { product: { _id: '2', price: 50 }, quantity: 3 }  // 150
        ]
      });
      const total = useCartStore.getState().cartTotal();
      expect(total).toBe(350);
    });
  });
});
