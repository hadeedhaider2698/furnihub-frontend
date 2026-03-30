import { Home, Search, PlusSquare, ShoppingBag, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';

export default function BottomNav() {
  const { user } = useAuthStore();
  const { cartCount } = useCartStore();
  const location = useLocation();

  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Search, path: '/explore', label: 'Explore' },
    { icon: PlusSquare, path: user?.role === 'vendor' ? '/vendor/products/new' : '/auth/register', label: 'Post' },
    { icon: ShoppingBag, path: '/cart', label: 'Cart', badge: cartCount() > 0 ? cartCount() : null },
    { icon: User, path: user ? '/profile' : '/auth/login', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-[var(--surface-2)] border-t border-[var(--border)] pb-safe z-50 md:hidden flex justify-between px-6 py-3">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <NavLink key={item.path} to={item.path} className="relative flex flex-col items-center justify-center w-12 h-12 select-none">
            <item.icon 
              size={26} 
              strokeWidth={isActive ? 2.5 : 1.5}
              className={`transition-all duration-200 ${isActive ? 'text-[var(--primary)] scale-110' : 'text-[var(--text-secondary)]'}`} 
            />
            {item.badge && (
              <span className="absolute top-1 right-1 bg-gradient-to-tr from-[var(--accent-2)] to-[var(--accent)] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
