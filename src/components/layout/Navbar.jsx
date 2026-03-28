import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, Search, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';
import { useUiStore } from '../../store/uiStore.js';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const cartCount = useCartStore(state => state.cartCount());
  const { toggleCart, isMobileMenuOpen, toggleMobileMenu } = useUiStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${search}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface-2/80 backdrop-blur supports-[backdrop-filter]:bg-surface-2/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Mobile menu button */}
        <button className="md:hidden" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="text-2xl font-serif font-bold text-primary tracking-tight">
          FurniHub.
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/products" className="text-sm font-medium text-text-primary hover:text-accent transition-colors">Shop All</Link>
          <Link to="/category/sofa" className="text-sm font-medium text-text-primary hover:text-accent transition-colors">Sofas</Link>
          <Link to="/category/bed" className="text-sm font-medium text-text-primary hover:text-accent transition-colors">Beds</Link>
          <Link to="/category/dining-table" className="text-sm font-medium text-text-primary hover:text-accent transition-colors">Dining</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <form onSubmit={handleSearch} className="hidden lg:flex relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-64 rounded-full border border-border bg-surface pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-text-secondary" />
          </form>

          {user ? (
            <div className="group relative cursor-pointer">
              <User size={24} className="text-text-primary hover:text-accent transition-colors" />
              <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-surface-2 shadow-warm-lg py-2 hidden group-hover:block border border-border">
                <div className="px-4 py-2 border-b border-border mb-1">
                  <p className="text-sm font-medium text-primary truncate">{user.name}</p>
                  <p className="text-xs text-text-secondary truncate">{user.role}</p>
                </div>
                {user.role === 'admin' && <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-text-primary hover:bg-surface">Admin Dashboard</Link>}
                {user.role === 'vendor' && <Link to="/vendor/dashboard" className="block px-4 py-2 text-sm text-text-primary hover:bg-surface">Vendor Dashboard</Link>}
                <Link to="/profile" className="block px-4 py-2 text-sm text-text-primary hover:bg-surface">My Profile</Link>
                <Link to="/orders" className="block px-4 py-2 text-sm text-text-primary hover:bg-surface">My Orders</Link>
                <button onClick={() => { logout(); navigate('/auth/login'); }} className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-surface">Logout</button>
              </div>
            </div>
          ) : (
            <Link to="/auth/login" className="text-sm font-medium text-text-primary hover:text-accent transition-colors whitespace-nowrap">Log In</Link>
          )}

          <button onClick={toggleCart} className="relative cursor-pointer group">
            <ShoppingBag size={24} className="text-text-primary group-hover:text-accent transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface-2 p-4 flex flex-col space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-text-secondary" />
          </form>
          <Link to="/products" className="text-sm font-medium text-text-primary" onClick={toggleMobileMenu}>Shop All</Link>
          <Link to="/category/sofa" className="text-sm font-medium text-text-primary" onClick={toggleMobileMenu}>Sofas</Link>
          <Link to="/category/bed" className="text-sm font-medium text-text-primary" onClick={toggleMobileMenu}>Beds</Link>
        </div>
      )}
    </header>
  );
}
