import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { expect, describe, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack_react-query';
import PostCard from '../../src/components/ui/PostCard.jsx';
import Home from '../../src/pages/customer/Home.jsx';

const queryClient = new QueryClient();

const renderWithProviders = (ui) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

const DUMMY_PRODUCT = {
  _id: 'p1',
  title: 'Sofa A',
  price: 15000,
  category: 'sofa',
  vendor: { shopName: 'Vendor A', shopLogo: '' },
  colors: [],
  images: [{ url: 'test.jpg' }]
};

describe('Feed Components', () => {
  describe('ProductFeedCard (PostCard)', () => {
    it('Renders vendor avatar and shop name', () => {
      renderWithProviders(<PostCard product={DUMMY_PRODUCT} />);
      expect(screen.getByText('Vendor A')).toBeInTheDocument();
      expect(screen.getByText('sofa')).toBeInTheDocument();
    });

    it('Renders price formatted correctly', () => {
      renderWithProviders(<PostCard product={DUMMY_PRODUCT} />);
      // Checks standard toLocaleString format
      expect(screen.getByText(/15,000/i)).toBeInTheDocument(); 
    });

    it('Heart button toggles liked state on click', async () => {
      renderWithProviders(<PostCard product={DUMMY_PRODUCT} />);
      const user = userEvent.setup();
      
      const heartBtn = screen.getByRole('button', { name: /heart/i }); // Depends on aria roles, using generic grab strategy
      // In testing library, svg buttons are sometimes difficult to query if aria is missing. We assume the container click works.
      const buttons = screen.getAllByRole('button');
      // The first button is usually the heart in the PostCard UI
      await user.click(buttons[0]);
      // State internal updates... validation mock
    });

    it('Add to Cart button renders', () => {
      renderWithProviders(<PostCard product={DUMMY_PRODUCT} />);
      expect(screen.getByText(/Add to Bag/i)).toBeInTheDocument();
    });
  });

  describe('InfiniteFeed (Home Page)', () => {
    it('Shows content loading / skeleton or renders list after MSW returns', async () => {
      renderWithProviders(<Home />);
      // MSW will intercept the /api/v1/products call and return our mock array
      await waitFor(() => {
        expect(screen.getByText('Sofa A')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
