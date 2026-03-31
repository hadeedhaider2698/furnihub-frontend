import { Home, Search, PlusSquare, ShoppingBag, User, LogOut, Menu, Settings } from 'lucide-react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { cartCount } = useCartStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/explore', label: 'Explore' },
    { icon: PlusSquare, path: user?.role === 'vendor' ? '/vendor/products/new' : '/auth/register', label: 'Create' },
    { icon: ShoppingBag, path: '/cart', label: 'Cart', badge: cartCount() > 0 ? cartCount() : null },
    { icon: User, path: user ? '/profile' : '/auth/login', label: 'Profile' },
  ];

  return (
    <aside className="sticky top-0 h-screen hidden md:flex flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-300 w-20 xl:w-64 px-3 py-8 z-50">
      {/* Logo */}
      <div className="mb-10 px-3">
        <Link to="/" className="flex items-center">
          <span className="font-serif text-2xl font-bold tracking-tighter text-[var(--primary)] xl:hidden">F</span>
          <span className="font-serif text-2xl font-bold tracking-tighter text-[var(--primary)] hidden xl:block">FurniHub</span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-4 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive ? 'bg-[var(--surface-2)] text-[var(--primary)] font-bold' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--primary)]'}
              `}
            >
                <div className="relative">
                    <Icon 
                        size={24} 
                        strokeWidth={isActive ? 2.5 : 1.5}
                        className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}
                    />
                    {item.badge && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-[var(--accent-2)] to-[var(--accent)] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                            {item.badge}
                        </span>
                    )}
                </div>
                <span className="hidden xl:block text-[15px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / More */}
      <div className="space-y-4 pt-10 border-t border-[var(--border)]/50">
        {user?.role === 'vendor' && (
             <NavLink 
                to="/vendor/dashboard"
                className="flex items-center space-x-4 px-3 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--primary)] transition-all"
             >
                <Settings size={24} strokeWidth={1.5} />
                <span className="hidden xl:block text-[15px]">Dashboard</span>
             </NavLink>
        )}
        
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-4 px-3 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all group"
        >
          <LogOut size={24} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
          <span className="hidden xl:block text-[15px] font-bold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
