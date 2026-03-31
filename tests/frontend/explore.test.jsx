import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Explore from '../../src/pages/customer/Explore.jsx';

let queryClient;

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
});

const renderExplore = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter><Explore /></BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Explore Page Components', () => {
  it('Search bar renders and accepts input', async () => {
    renderExplore();
    const searchInput = screen.getByPlaceholderText(/Search furniture/i);
    const user = userEvent.setup();
    await user.type(searchInput, 'chair');
    expect(searchInput.value).toBe('chair');
  });

  it('Debounced search eventually triggers results', async () => {
    renderExplore();
    const searchInput = screen.getByPlaceholderText(/Search furniture/i);
    const user = userEvent.setup();
    await user.type(searchInput, 'sofa');
    
    // Wait for the debounce (300ms) and the MSW fetch to complete
    await screen.findByAltText('Sofa A', {}, { timeout: 5000 });
  });

  it('Category pills render all categories and click filters', async () => {
    renderExplore();
    const sofaPill = screen.getByText(/Sofa/i);
    const user = userEvent.setup();
    await user.click(sofaPill);
    expect(sofaPill).toHaveClass('bg-[var(--primary)]');
  });

  it('Masonry grid renders products', async () => {
    renderExplore();
    await screen.findByAltText('Sofa A', {}, { timeout: 5000 });
  });
});
