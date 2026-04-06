import { Outlet, useLocation, NavLink, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { LayoutDashboard, Users, Package, ShoppingCart, Store, ChevronRight, Home } from 'lucide-react';

export default function DashboardLayout({ expectedRole }) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return <Navigate to="/auth/login" replace />;
  if (expectedRole && user.role !== expectedRole) return <Navigate to="/" replace />;

  const vendorLinks = [
    { label: 'Overview', path: '/vendor/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/vendor/products', icon: Package },
    { label: 'Orders', path: '/vendor/orders', icon: ShoppingCart },
    { label: 'Settings', path: '/vendor/settings', icon: Store },
  ];

  const adminLinks = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Vendors', path: '/admin/vendors', icon: Store },
    { label: 'Products', path: '/admin/products', icon: Package },
  ];

  const links = user.role === 'admin' ? adminLinks : vendorLinks;

  return (
    <div className="min-h-screen bg-[var(--surface-2)] flex flex-col">
      {/* Mobile Dashboard Sub-Nav */}
      <div className="md:hidden sticky top-0 z-40 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)] overflow-x-auto no-scrollbar">
        <div className="flex px-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-5 py-4 whitespace-nowrap border-b-2 transition-all ${
                  isActive 
                    ? 'border-[var(--primary)] text-[var(--primary)] font-bold' 
                    : 'border-transparent text-[var(--text-secondary)] font-medium'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs">{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Desktop Dashboard Header (Minimal breadcrumb) */}
      <div className="hidden md:flex items-center justify-between px-8 py-6 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
          <NavLink to="/" className="hover:text-[var(--primary)] transition-colors">FurniHub</NavLink>
          <ChevronRight size={12} />
          <span className="text-[var(--primary)]">{user.role} Portal</span>
          <ChevronRight size={12} />
          <span className="text-[var(--accent)]">{links.find(l => location.pathname === l.path)?.label || 'Dashboard'}</span>
        </div>
        <div className="flex items-center space-x-4">
             <div className="text-right">
                <p className="text-sm font-bold text-[var(--primary)]">{user.name}</p>
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-tighter">{user.role} Account</p>
             </div>
             <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                className="w-10 h-10 rounded-xl border border-[var(--border)]" 
                alt="" 
             />
        </div>
      </div>

      {/* Content Container */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-10">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
