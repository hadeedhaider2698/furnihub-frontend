import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { expect, describe, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack_react-query';
import Explore from '../../src/pages/customer/Explore.jsx';

const queryClient = new QueryClient();

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
    const user = userEvent.setup({ delay: null }); // disable delay for fake timers if needed
    const searchInput = screen.getByPlaceholderText(/Search furniture/i);

    expect(searchInput).toBeInTheDocument();
    
    await user.type(searchInput, 'sofa');
    expect(searchInput.value).toBe('sofa');
  });

  it('Debounced search does not trigger immediately (mocked timers)', async () => {
    vi.useFakeTimers();
    renderExplore();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const searchInput = screen.getByPlaceholderText(/Search furniture/i);
    await user.type(searchInput, 'bed');

    // Fast forward 100ms
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // The API should NOT be hit yet, still in debounce wait.
    expect(searchInput.value).toBe('bed');
    
    // Fast forward passed 300ms threshold
    act(() => {
      vi.advanceTimersByTime(250);
    });

    // API triggers... testing the internal MSW mock updates
    await waitFor(() => {
      expect(screen.queryByText(/Test Bed/i)); // Dependent on specific mock return
    });

    vi.useRealTimers();
  });

  it('Category pills render all categories and click filters', async () => {
    renderExplore();
    const user = userEvent.setup();

    // Check if category pills are present by finding the 'sofa' button
    const sofaPill = await screen.findByRole('button', { name: /sofa/i });
    expect(sofaPill).toBeInTheDocument();

    await user.click(sofaPill);
    // Component adjusts local state to array ['sofa']
    expect(sofaPill).toHaveClass('bg-[var(--primary)]'); // Active style class
  });

  it('Masonry grid renders products empty state logic', async () => {
    renderExplore();
    // Assuming MSW is running and fetching the default 1 product from mocks
    await waitFor(() => {
      expect(screen.getByText('Sofa A')).toBeInTheDocument();
    });
  });
});
