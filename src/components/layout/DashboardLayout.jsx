import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { LayoutDashboard, Users, Package, ShoppingCart, LogOut, Settings, Store } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function DashboardLayout({ expectedRole }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  if (!user) return <Navigate to="/auth/login" replace />;
  if (expectedRole && user.role !== expectedRole) return <Navigate to="/" replace />;

  const vendorLinks = [
    { label: 'Overview', path: '/vendor/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/vendor/products', icon: Package },
    { label: 'Orders', path: '/vendor/orders', icon: ShoppingCart },
    { label: 'Store Settings', path: '/vendor/settings', icon: Store },
  ];

  const adminLinks = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Vendors', path: '/admin/vendors', icon: Store },
    { label: 'Products', path: '/admin/products', icon: Package },
  ];

  const links = user.role === 'admin' ? adminLinks : vendorLinks;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-surface flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface-2 border-r border-border p-6 flex flex-col h-auto md:h-[calc(100vh-80px)] sticky top-20">
        <div className="mb-8">
          <h2 className="text-xl font-serif font-bold text-primary capitalize">{user.role} Portal</h2>
          <p className="text-sm text-text-secondary">Welcome back, {user?.name?.split(' ')[0] || user?.email || 'User'}</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary text-white shadow-warm' 
                    : 'text-text-secondary hover:bg-surface hover:text-primary'
                }`}
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-8 border-t border-border pt-4">
          <button 
            onClick={() => logout()}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg font-medium text-error hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
