import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../../src/store/authStore.js';
import DashboardLayout from '../../src/components/layout/DashboardLayout.jsx';

// Testing AuthGuard requires mocking Zustand to force active roles
// And validating if Navigate triggers or outlet renders

describe('Auth Guards', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
  });

  const TestRouter = ({ role, initialRoute }) => (
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/vendor/*" element={<DashboardLayout expectedRole="vendor" />}>
          <Route path="dashboard" element={<div>Vendor Dashboard Allowed</div>} />
        </Route>
        <Route path="/" element={<div>Home Redirect</div>} />
      </Routes>
    </MemoryRouter>
  );

  it('/vendor/* routes redirect to / if authenticated as customer', () => {
    // Set user as Customer
    useAuthStore.setState({
      user: { role: 'customer' },
      isAuthenticated: true
    });

    render(<TestRouter role="customer" initialRoute="/vendor/dashboard" />);
    
    // The DashboardLayout should enforce Navigate to "/" because role mismatch
    expect(screen.getByText('Home Redirect')).toBeInTheDocument();
    expect(screen.queryByText('Vendor Dashboard Allowed')).toBeNull();
  });

  it('/vendor/* routes render for vendors perfectly', () => {
    useAuthStore.setState({
      user: { role: 'vendor' },
      isAuthenticated: true
    });

    render(<TestRouter role="vendor" initialRoute="/vendor/dashboard" />);
    
    expect(screen.getByText('Vendor Dashboard Allowed')).toBeInTheDocument();
    expect(screen.queryByText('Home Redirect')).toBeNull();
  });

  it('/vendor/* routes redirect to /login (or /) if not authenticated', () => {
    // Completely unauthenticated
    useAuthStore.setState({ user: null, isAuthenticated: false });

    render(<TestRouter role="vendor" initialRoute="/vendor/dashboard" />);
    
    // Redirects inherently
    expect(screen.getByText('Home Redirect')).toBeInTheDocument();
    expect(screen.queryByText('Vendor Dashboard Allowed')).toBeNull();
  });
});
