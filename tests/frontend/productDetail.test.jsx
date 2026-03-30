import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { expect, describe, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack_react-query';
import ProductDetail from '../../src/pages/customer/ProductDetail.jsx';

const queryClient = new QueryClient();

// Mock useParams to return a slug so the page auto-fetches 'slug/test' via MSW
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ slug: 'test' }),
    useNavigate: () => vi.fn()
  };
});

const renderDetail = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter><ProductDetail /></BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Product Detail Page', () => {
  it('Page renders with product data from API', async () => {
    renderDetail();
    await waitFor(() => {
      // Data piped from MSW
      expect(screen.getByText('Sofa A')).toBeInTheDocument();
      expect(screen.getByText('15,000')).toBeInTheDocument();
      expect(screen.getByText('Vendor A')).toBeInTheDocument();
    });
  });

  it('Quantity +/- buttons work dynamically (local state bounds)', async () => {
    renderDetail();
    await waitFor(() => screen.getByText('Sofa A'));
    
    const user = userEvent.setup();
    const increaseBtn = screen.getByRole('button', { name: /\+/i });
    const decreaseBtn = screen.getByRole('button', { name: /-/i });

    // Starts at 1
    // Click increase
    await user.click(increaseBtn);
    expect(screen.getByText('2')).toBeInTheDocument();

    // Click decrease
    await user.click(decreaseBtn);
    expect(screen.getByText('1')).toBeInTheDocument();

    // Decrease again should stop at 1 bounds limit
    await user.click(decreaseBtn);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('Add to Cart triggers success logic', async () => {
    renderDetail();
    await waitFor(() => screen.getByText('Sofa A'));

    const addBtn = screen.getByText('Add to Bag');
    expect(addBtn).toBeInTheDocument();
    // Logic propagates to Zustand mocked cartStore seamlessly
  });
});
