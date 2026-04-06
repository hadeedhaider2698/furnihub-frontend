import { Home, Search, PlusSquare, ShoppingBag, User, LayoutDashboard, Heart } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';

export default function BottomNav() {
  const { user } = useAuthStore();
  const cartCount = useCartStore(state => state.cartCount());
  const location = useLocation();

  const isVendor = user?.role === 'vendor';

  const navItems = isVendor
    ? [
        { icon: Home, path: '/', label: 'Home' },
        { icon: Search, path: '/explore', label: 'Explore' },
        { icon: PlusSquare, path: '/vendor/products/new', label: 'Create' },
        { icon: LayoutDashboard, path: '/vendor/dashboard', label: 'Dashboard' },
        { icon: User, path: '/profile', label: 'Profile' },
      ]
    : [
        { icon: Home, path: '/', label: 'Home' },
        { icon: Search, path: '/explore', label: 'Explore' },
        { icon: Heart, path: user ? '/profile' : '/auth/login', label: 'Saved' },
        { icon: ShoppingBag, path: '/cart', label: 'Cart', badge: cartCount > 0 ? cartCount : null },
        { icon: User, path: user ? '/profile' : '/auth/login', label: 'Profile' },
      ];

  return (
    <nav className="fixed bottom-0 w-full bg-[var(--surface-2)] border-t border-[var(--border)] pb-safe z-50 md:hidden flex justify-between px-2 py-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <NavLink key={item.path + item.label} to={item.path} className="relative flex flex-col items-center justify-center flex-1 py-1 select-none gap-0.5">
            <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? 'bg-[var(--primary)]/10' : ''}`}>
              <item.icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 1.5}
                className={`transition-all duration-200 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`} 
              />
              {item.badge && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-tr from-[var(--accent-2)] to-[var(--accent)] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-bold transition-all ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
