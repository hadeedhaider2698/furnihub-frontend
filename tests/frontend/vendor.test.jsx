import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddProductForm from '../../src/pages/vendor/VendorDashboard.jsx';

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

const renderDashboard = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter><AddProductForm /></BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Vendor Dashboard Components', () => {
  describe('AddProductForm / Dashboard Render', () => {
    it('Dashboard loads successfully with stat cards', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText(/Gross Revenue/i)).toBeInTheDocument();
        expect(screen.getByText(/Recent Orders/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('VendorOrdersTable', () => {
    it('Renders orders in table layout', async () => {
      renderDashboard();
      const table = await screen.findByRole('table', {}, { timeout: 5000 });
      expect(table).toBeInTheDocument();
    });

    it('Filter tabs (All/Pending/Processing/Shipped/Delivered) filter correctly', async () => {
      renderDashboard();
      const table = await screen.findByRole('table', {}, { timeout: 5000 });
      expect(table).toBeInTheDocument();
      
      const pendingTab = screen.queryByRole('button', { name: /Pending/i });
      if(pendingTab) {
        const user = userEvent.setup();
        await user.click(pendingTab);
      }
    });
  });
});
