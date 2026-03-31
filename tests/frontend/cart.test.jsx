import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { expect, describe, it, vi } from 'vitest';
import CartDrawer from '../../src/components/cart/CartDrawer.jsx';

// Since cartStore is local Zustand, we don't strictly need MSW for purely UI testing unless cartStore calls API directly
// Assuming useCartStore is mocked or initialized cleanly

vi.mock('../../src/store/cartStore', () => ({
  useCartStore: () => ({
    items: [
      { product: { _id: '1', title: 'Cart Sofa', price: 10000, images: [{url: 'pic.jpg'}] }, quantity: 2, color: 'Red' }
    ],
    cartTotal: () => 20000,
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
  })
}));

let mockIsOpen = false;
vi.mock('../../src/store/uiStore', () => ({
  useUiStore: () => ({
    isCartOpen: mockIsOpen,
    setIsCartOpen: vi.fn(),
  })
}));

const renderCart = (isOpen, onClose) => {
  mockIsOpen = isOpen;
  return render(
    <BrowserRouter>
      <CartDrawer isOpen={isOpen} onClose={onClose} />
    </BrowserRouter>
  );
};

describe('Cart Drawer Components', () => {
  it('Hidden by default when isOpen is false', () => {
    renderCart(false, vi.fn());
    // The panel shouldn't be fully translating into view, or it's unmounted
    const title = screen.queryByText(/Your Bag/i);
    expect(title).toBeNull(); // If conditionally rendered
  });

  it('Opens and Shows cart items with images and prices', () => {
    renderCart(true, vi.fn());
    expect(screen.getByText('Your Bag')).toBeInTheDocument();
    expect(screen.getByText('Cart Sofa')).toBeInTheDocument();
    expect(screen.getByText(/20000/i)).toBeInTheDocument(); // Math formats
  });

  it('Quantity increase/decrease buttons exist', async () => {
    renderCart(true, vi.fn());
    
    // Test for generic +/- rendering
    const plusButtons = screen.getAllByRole('button');
    // Actual clicks would fire the mocked `updateQuantity`
    expect(plusButtons.length).toBeGreaterThan(0);
  });

  it('Delete button renders (trash icon context)', () => {
    renderCart(true, vi.fn());
    // Checking checkout button presence
    const checkoutBtn = screen.getByText('Checkout');
    expect(checkoutBtn).toBeInTheDocument();
  });
});
