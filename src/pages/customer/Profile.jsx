import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Grid, 
  Bookmark, 
  ShoppingBag, 
  MapPin, 
  Link as LinkIcon,
  ChevronLeft,
  Edit2,
  User,
  Users
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useWishlistStore } from '../../store/wishlistStore.js';
import { useFollowStore } from '../../store/followStore.js';

const fetchOrders = async () => {
  const res = await api.get('/orders/my-orders');
  return res.data.data.orders;
};

const fetchMyPosts = async (vendorId) => {
    const res = await api.get(`/products?vendor=${vendorId}&limit=50`);
    return res.data.data.products;
};

export default function Profile() {
  const { user } = useAuthStore();
  const { wishlist, fetchWishlist, isLoading: isLoadingWishlist } = useWishlistStore();
  const { following, fetchFollowing, isLoading: isLoadingFollowing } = useFollowStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('saved');

  useEffect(() => {
    if (user) {
      fetchWishlist();
      fetchFollowing();
    }
  }, [user, fetchWishlist, fetchFollowing]);

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['myOrders'],
    queryFn: fetchOrders,
    enabled: !!user
  });

  const { data: myPosts = [], isLoading: isLoadingPosts } = useQuery({
      queryKey: ['myPosts', user?.vendorId],
      queryFn: () => fetchMyPosts(user.vendorId),
      enabled: !!user && !!user.vendorId
  });

  if (!user) return null;

  const tabs = [
    { id: 'posts', label: 'Posts', icon: Grid },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'following', label: 'Following', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'about', label: 'About', icon: User },
  ];

  return (
    <div className="bg-[var(--surface)] min-h-screen pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-10 bg-[var(--surface)]/90 backdrop-blur-md flex items-center justify-between px-4 py-3 border-b border-[var(--border)] lg:max-w-[800px] lg:mx-auto">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-[var(--surface-2)] rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <span className="font-bold text-lg tracking-tight text-[var(--primary)] uppercase">
          {user.name}
        </span>
        <Link to="/profile/edit" className="p-1 hover:bg-[var(--surface-2)] rounded-full transition-colors">
          <Settings size={22} />
        </Link>
      </div>

      <div className="lg:max-w-[800px] lg:mx-auto">
        {/* Profile Info Section */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center space-x-8 mb-6">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full p-1 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] shadow-lg">
              <div className="w-full h-full rounded-full border-4 border-[var(--surface)] overflow-hidden bg-[var(--surface-2)]">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex-1 flex justify-around text-center">
              <div>
                <p className="font-bold text-lg lg:text-xl text-[var(--primary)]">{wishlist.length}</p>
                <p className="text-xs lg:text-sm text-[var(--text-secondary)]">Saved</p>
              </div>
              <div>
                <p className="font-bold text-lg lg:text-xl text-[var(--primary)]">{orders.length}</p>
                <p className="text-xs lg:text-sm text-[var(--text-secondary)]">Orders</p>
              </div>
              <div>
                <p className="font-bold text-lg lg:text-xl text-[var(--primary)]">{following.length}</p>
                <p className="text-xs lg:text-sm text-[var(--text-secondary)]">Following</p>
              </div>
              {user.vendorId && (
                <div>
                  <p className="font-bold text-lg lg:text-xl text-[var(--primary)]">{myPosts.length}</p>
                  <p className="text-xs lg:text-sm text-[var(--text-secondary)]">Posts</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1 mb-6">
            <h1 className="font-bold text-base lg:text-lg text-[var(--primary)]">{user.name}</h1>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
              {user.bio || 'Living life one furniture piece at a time. 🛋️'}
            </p>
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-semibold text-blue-600 hover:underline">
                <LinkIcon size={14} className="mr-1 mt-0.5" />
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>

          <Link 
            to="/profile/edit" 
            className="w-full flex items-center justify-center space-x-2 bg-[var(--surface-2)] text-[var(--primary)] font-semibold py-2 rounded-lg text-sm border border-[var(--border)] active:scale-95 transition-transform"
          >
            <Edit2 size={16} />
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Improved Tab Selection */}
        <div className="flex border-t border-[var(--border)] mt-4">
          {tabs.map((tab) => {
            if (tab.id === 'posts' && !user.vendorId) return null; // Only show posts tab for vendors
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-3 border-t-2 transition-all duration-300 ${
                  isActive 
                    ? 'border-[var(--primary)] text-[var(--primary)]' 
                    : 'border-transparent text-[var(--text-secondary)] hover:text-gray-400'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} className="transition-transform active:scale-90" />
                <span className={`text-[9px] uppercase font-bold mt-1 tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content with Animations */}
        <div className="mt-0.5 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'posts' && (
              <motion.div key="posts" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-3 gap-0.5">
                {isLoadingPosts ? (
                    Array(6).fill(0).map((_, i) => <div key={i} className="aspect-square bg-[var(--surface-2)] animate-pulse" />)
                ) : myPosts.length > 0 ? (
                  myPosts.map((product) => (
                    <Link to={`/products/${product.slug}`} key={product._id} className="aspect-square group relative overflow-hidden bg-[var(--surface-2)]">
                      <img src={product.images?.[0]?.url || 'https://placehold.co/400'} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 py-20 text-center text-[var(--text-secondary)] text-sm px-10">
                      <Grid size={40} className="mx-auto mb-4 opacity-20" />
                      <p className="font-bold text-[var(--primary)] text-base mb-1">No Posts Yet</p>
                      <p>Items you share will appear here.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'saved' && (
              <motion.div key="saved" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-3 gap-0.5">
                {isLoadingWishlist ? (
                   Array(6).fill(0).map((_, i) => <div key={i} className="aspect-square bg-[var(--surface-2)] animate-pulse" />)
                ) : wishlist.length > 0 ? (
                  wishlist.map((product) => (
                    <Link to={`/products/${product.slug}`} key={product._id} className="aspect-square group relative overflow-hidden bg-[var(--surface-2)]">
                      <img src={product.images?.[0]?.url || 'https://placehold.co/400'} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Bookmark className="text-white fill-white" size={20} /></div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 py-24 text-center text-[var(--text-secondary)]">
                    <Bookmark size={40} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold text-[var(--primary)]">Nothing saved yet</p>
                    <p className="text-sm">Save items you love to find them here.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'following' && (
              <motion.div key="following" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-4 space-y-4">
                {isLoadingFollowing ? (
                  Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-[var(--surface-2)] rounded-xl animate-pulse" />)
                ) : following.length > 0 ? (
                  following.map((vendor) => (
                    <div key={vendor._id} className="flex items-center justify-between bg-[var(--surface-2)] p-4 rounded-2xl border border-[var(--border)] group hover:border-[var(--accent)] transition-colors">
                      <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate(`/vendor/${vendor._id}`)}>
                        <img src={vendor.shopLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${vendor.shopName}`} alt={vendor.shopName} className="w-12 h-12 rounded-full border border-[var(--border)] object-cover" />
                        <div>
                          <h4 className="font-bold text-[var(--primary)] text-sm">{vendor.shopName}</h4>
                          <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{vendor.address?.city}, {vendor.address?.country}</p>
                        </div>
                      </div>
                      <button onClick={() => navigate(`/vendor/${vendor._id}`)} className="px-4 py-1.5 text-xs font-bold border border-[var(--primary)] text-[var(--primary)] rounded-full hover:bg-[var(--primary)] hover:text-white transition-all active:scale-95">
                        Visit Shop
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center text-[var(--text-secondary)]">
                    <Users size={40} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold text-[var(--primary)]">Not following anyone</p>
                    <p className="text-sm">Explore stores and follow them to see them here.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-4 space-y-4">
                {isLoadingOrders ? (
                   Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-[var(--surface-2)] rounded-xl animate-pulse" />)
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order._id} className="bg-[var(--surface-2)] p-4 rounded-2xl border border-[var(--border)] shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Order #{order._id.slice(-6)}</p>
                          <p className="font-black text-[var(--primary)] text-lg">${order.totalAmount}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-green-50 text-green-600 border border-green-200">
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="flex -space-x-3 overflow-hidden">
                        {order.items.slice(0, 4).map((item, i) => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-[var(--surface)] overflow-hidden bg-white shadow-sm">
                            <img src={item.product?.images?.[0]?.url || 'https://placehold.co/100'} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.items.length > 4 && <div className="w-10 h-10 rounded-full border-2 border-[var(--surface)] bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">+{order.items.length - 4}</div>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center text-[var(--text-secondary)]">
                    <ShoppingBag size={40} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold text-[var(--primary)]">No orders yet</p>
                    <Link to="/explore" className="text-[var(--accent)] text-sm font-bold hover:underline">Start shopping</Link>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div key="about" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-4">
                <div className="bg-[var(--surface-2)] rounded-2xl p-6 border border-[var(--border)] shadow-sm space-y-6">
                  <div>
                    <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Account Information</h3>
                    <div className="space-y-4">
                      <div><p className="text-xs text-[var(--text-secondary)] mb-1">Full Name</p><p className="text-sm font-bold text-[var(--primary)]">{user.name}</p></div>
                      <div><p className="text-xs text-[var(--text-secondary)] mb-1">Email Address</p><p className="text-sm font-bold text-[var(--primary)]">{user.email}</p></div>
                      <div><p className="text-xs text-[var(--text-secondary)] mb-1">Joined FurniHub</p><p className="text-sm font-bold text-[var(--primary)]">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
