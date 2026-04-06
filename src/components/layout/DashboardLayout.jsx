import { Outlet, useLocation, NavLink, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { LayoutDashboard, Users, Package, ShoppingCart, Store, ChevronRight, Home, MessageCircle } from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';
import { useEffect } from 'react';
import NotificationBell from './NotificationBell.jsx';

export default function DashboardLayout({ expectedRole }) {
  const { user, logout } = useAuthStore();
  const { fetchConversations, unreadCount } = useChatStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  if (!user) return <Navigate to="/auth/login" replace />;
  if (expectedRole && user.role !== expectedRole) return <Navigate to="/" replace />;

  const unreadMessages = unreadCount();

  const vendorLinks = [
    { label: 'Overview', path: '/vendor/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/vendor/products', icon: Package },
    { label: 'Orders', path: '/vendor/orders', icon: ShoppingCart },
    { label: 'Messages', path: '/messages', icon: MessageCircle },
    { label: 'Settings', path: '/vendor/settings', icon: Store },
  ];

  const adminLinks = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Vendors', path: '/admin/vendors', icon: Store },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Messages', path: '/messages', icon: MessageCircle },
  ];

  const links = user.role === 'admin' ? adminLinks : vendorLinks;

  return (
    <div className="min-h-screen bg-[var(--surface-2)] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 flex-col bg-[var(--surface)] border-r border-[var(--border)] sticky top-0 h-screen overflow-hidden">
        <div className="p-8">
          <Link to="/" className="text-2xl font-serif font-bold text-[var(--primary)] tracking-tight">
            FurniHub.
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[var(--primary)] text-white shadow-lg' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--primary)]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={20} />
                  <span className="font-semibold text-sm">{link.label}</span>
                </div>
                {link.label === 'Messages' && unreadMessages > 0 && (
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    location.pathname === link.path ? 'bg-white text-[var(--primary)]' : 'bg-[var(--accent)] text-white'
                  }`}>
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)] space-y-2">
           <Link to="/" className="flex items-center space-x-3 px-4 py-3 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
              <Home size={20} />
              <span className="text-sm font-medium">Back to Shop</span>
           </Link>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
           >
              <LayoutDashboard size={20} className="rotate-180" />
              <span className="text-sm font-bold">Sign Out</span>
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Desktop Dashboard Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-40">
          <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            <span className="text-[var(--primary)]">{user.role} Portal</span>
            <ChevronRight size={10} className="mt-[-2px]" />
            <span className="text-[var(--accent)] font-bold">
              {links.find(l => location.pathname === l.path)?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center space-x-6">
               <div className="flex items-center space-x-2">
                  <NotificationBell />
                  <Link 
                    to="/messages"
                    className="p-2.5 text-[var(--primary)] hover:bg-[var(--surface-2)] rounded-full transition-colors relative group cursor-pointer"
                  >
                    <MessageCircle size={22} />
                    {unreadMessages > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white ring-2 ring-[var(--surface)]">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </Link>
               </div>

               <div className="flex items-center space-x-4 border-l border-[var(--border)] pl-6">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-[var(--primary)]">{user.name}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.1em] font-medium">{user.role} Account</p>
                 </div>
                 <img 
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                    className="w-10 h-10 rounded-xl border border-[var(--border)] shadow-sm object-cover" 
                    alt="" 
                 />
               </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
          <div className="max-w-7xl mx-auto p-6 lg:p-8">
              <Outlet />
          </div>
        </main>

        {/* Mobile Dashboard Bottom-Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)] border-t border-[var(--border)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-area-inset-bottom">
          <div className="flex justify-around items-center h-16 px-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={`flex flex-col items-center justify-center flex-1 h-full transition-all gap-0.5 relative ${
                    isActive 
                      ? 'text-[var(--primary)]' 
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[9px] font-bold uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    {link.label}
                  </span>
                  {unreadMessages > 0 && link.label === 'Messages' && (
                    <span className="absolute top-2 translate-x-3 h-4 w-4 bg-accent text-[9px] text-white rounded-full flex items-center justify-center font-bold border-2 border-[var(--surface)]">
                      {unreadMessages}
                    </span>
                  )}
                </NavLink>
              );
            })}
            
            <Link 
              to="/"
              className="flex flex-col items-center justify-center flex-1 h-full transition-all gap-0.5 text-[var(--text-secondary)] hover:text-[var(--primary)]"
            >
              <Home size={20} />
              <span className="text-[9px] font-bold uppercase tracking-tight opacity-60">Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
