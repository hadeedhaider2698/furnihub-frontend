import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, Search, X, Store, LayoutDashboard, PlusCircle } from 'lucide-react';
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

  const isVendor = user?.role === 'vendor';
  const isAdmin = user?.role === 'admin';

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${search}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
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
          {isVendor ? (
            // Vendor nav
            <>
              <Link to="/vendor/dashboard" className="text-sm font-medium text-text-primary hover:text-accent transition-colors flex items-center gap-1.5">
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <Link to="/vendor/products/new" className="text-sm font-medium text-text-primary hover:text-accent transition-colors flex items-center gap-1.5">
                <PlusCircle size={15} /> Create Product
              </Link>
              <Link to="/explore" className="text-sm font-medium text-text-primary hover:text-accent transition-colors">Explore</Link>
            </>
          ) : (
            // Customer / guest nav
            <>
              <Link to="/explore" className="text-sm font-medium text-text-primary hover:text-accent transition-colors">Shop All</Link>
              <Link to="/category/sofa" className="text-sm font-medium text-text-primary hover:text-accent transition-colors">Sofas</Link>
              <Link to="/category/bed" className="text-sm font-medium text-text-primary hover:text-accent transition-colors">Beds</Link>
              <Link to="/category/dining-table" className="text-sm font-medium text-text-primary hover:text-accent transition-colors">Dining</Link>
            </>
          )}
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
              <div className="flex items-center gap-2">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-border object-cover"
                />
              </div>
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-surface-2 shadow-warm-lg py-2 hidden group-hover:block border border-border">
                <div className="px-4 py-3 border-b border-border mb-1">
                  <p className="text-sm font-bold text-primary truncate">{user.name}</p>
                  <p className="text-xs text-text-secondary capitalize">{user.role}</p>
                </div>
                {isAdmin && <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface">Admin Dashboard</Link>}
                {isVendor && (
                  <>
                    <Link to="/vendor/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface">
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link to="/vendor/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface">
                      <Store size={15} /> My Store
                    </Link>
                    <Link to="/vendor/products/new" className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface">
                      <PlusCircle size={15} /> Create Product
                    </Link>
                  </>
                )}
                {!isVendor && !isAdmin && (
                  <>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-text-primary hover:bg-surface">My Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-text-primary hover:bg-surface">My Orders</Link>
                  </>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-surface border-t border-border mt-1">Logout</button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth/login" className="text-sm font-medium text-text-primary hover:text-accent transition-colors">Log In</Link>
              <Link to="/auth/register" className="text-sm font-bold bg-[var(--primary)] text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity">Sign Up</Link>
            </div>
          )}

          {/* Cart — hide for vendors */}
          {!isVendor && (
            <button onClick={toggleCart} className="relative cursor-pointer group">
              <ShoppingBag size={24} className="text-text-primary group-hover:text-accent transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          )}
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
          {isVendor ? (
            <>
              <Link to="/vendor/dashboard" className="text-sm font-medium text-text-primary" onClick={toggleMobileMenu}>Dashboard</Link>
              <Link to="/vendor/products/new" className="text-sm font-medium text-text-primary" onClick={toggleMobileMenu}>Create Product</Link>
              <Link to="/vendor/settings" className="text-sm font-medium text-text-primary" onClick={toggleMobileMenu}>My Store</Link>
            </>
          ) : (
            <>
              <Link to="/explore" className="text-sm font-medium text-text-primary" onClick={toggleMobileMenu}>Shop All</Link>
              <Link to="/category/sofa" className="text-sm font-medium text-text-primary" onClick={toggleMobileMenu}>Sofas</Link>
              <Link to="/category/bed" className="text-sm font-medium text-text-primary" onClick={toggleMobileMenu}>Beds</Link>
            </>
          )}
          {!user && (
            <div className="flex gap-3 pt-2 border-t border-border">
              <Link to="/auth/login" className="flex-1 text-center text-sm font-bold border border-border rounded-full py-2 text-text-primary" onClick={toggleMobileMenu}>Log In</Link>
              <Link to="/auth/register" className="flex-1 text-center text-sm font-bold bg-[var(--primary)] text-white rounded-full py-2" onClick={toggleMobileMenu}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
