import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  Grid3x3, 
  PlaySquare, 
  MapPin, 
  MessageCircle,
  Share2,
  ExternalLink,
  Edit,
  Copy,
  Flag,
  Link2,
  Users,
  Star,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useFollowStore } from '../../store/followStore.js';
import toast from 'react-hot-toast';

const fetchVendorDetails = async (id) => {
  const res = await api.get(`/vendor/${id}`);
  return res.data.data.vendor;
};

const fetchVendorProducts = async (id) => {
  const res = await api.get(`/products?vendor=${id}&limit=40`);
  return res.data.data.products;
};

export default function VendorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toggleFollow: apiToggleFollow, isFollowing: checkIsFollowing } = useFollowStore();
  
  const [activeTab, setActiveTab] = useState('products');
  const [showMenu, setShowMenu] = useState(false);

  const { data: vendor, isLoading: isLoadingVendor } = useQuery({
    queryKey: ['vendorDetails', id],
    queryFn: () => fetchVendorDetails(id),
    staleTime: 5 * 60 * 1000,
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['vendorProducts', id],
    queryFn: () => fetchVendorProducts(id),
    staleTime: 5 * 60 * 1000,
  });

  const isOwner = user && vendor && (user.id === vendor.userId || user._id === vendor.userId);
  const isFollowing = vendor ? checkIsFollowing(vendor._id) : false;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor?.shopName || 'Shop',
          text: `Check out ${vendor?.shopName} on FurniHub!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Shop link copied');
    }
    setShowMenu(false);
  };

  const handleToggleFollow = async () => {
    if (!user) return navigate('/auth/login');
    if (!vendor) {
      return toast.error('Vendor information is missing or the profile was not found.');
    }
    try {
      const followed = await apiToggleFollow(vendor._id);
      toast.success(followed ? `Following ${vendor.shopName}` : `Unfollowed ${vendor.shopName}`);
    } catch (error) {
      console.error('Toggle Follow Error:', error);
      toast.error(error?.response?.data?.message || error.message || 'Failed to update following status');
    }
  };

  if (isLoadingVendor) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-2)]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="bg-[var(--surface)] min-h-screen pb-20 lg:max-w-[700px] lg:mx-auto lg:border-x border-[var(--border)] overflow-x-hidden relative">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--surface)]/90 backdrop-blur flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-[var(--surface-2)] rounded-full transition-colors"><ChevronLeft size={24} /></button>
        <div className="font-bold text-[var(--primary)] text-sm tracking-widest uppercase">
          {vendor?.shopName || 'Store'}
        </div>
        <button onClick={() => setShowMenu(true)} className="p-1 hover:bg-[var(--surface-2)] rounded-full transition-colors"><Share2 size={20} /></button>
      </div>

      {/* Hero Banner */}
      <div className="w-full h-36 lg:h-48 bg-[var(--surface-2)] relative overflow-hidden">
        {vendor?.shopBanner ? (
          <img src={vendor.shopBanner} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Profile Info Overlay */}
      <div className="px-4 -mt-12 relative z-1">
        <div className="flex items-end justify-between mb-4">
          <div className="w-24 h-24 rounded-2xl border-4 border-[var(--surface)] overflow-hidden bg-[var(--surface-2)] shadow-lg">
            <img 
              src={vendor?.shopLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${vendor?.shopName || id}`} 
              alt={vendor?.shopName} 
              className="w-full h-full object-cover" 
            />
          </div>
          {/* Stats */}
          <div className="flex-1 flex justify-around mb-2 px-2">
            <div className="text-center">
              <p className="font-bold text-lg text-[var(--primary)]">{products.length}</p>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-[var(--primary)]">{vendor?.followersCount ?? 0}</p>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-[var(--primary)]">{vendor?.totalSales || 0}</p>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Sales</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-[var(--primary)] flex items-center justify-center gap-0.5">
                <Star size={12} className="fill-[var(--warning)] text-[var(--warning)]" />
                {vendor?.rating || '—'}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Rating</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-[var(--primary)] text-lg">{vendor?.shopName}</h1>
            {vendor?.isApproved && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"><div className="text-[8px] text-white font-bold">✓</div></div>}
          </div>
          <p className="text-sm text-[var(--text-primary)] mt-1 leading-relaxed">{vendor?.description || 'Your boutique for premium furniture.'}</p>
          {vendor?.address?.city && (
            <div className="flex items-center text-[var(--text-secondary)] text-xs mt-2">
              <MapPin size={12} className="mr-1" /> {vendor.address.city}, {vendor.address.country}
            </div>
          )}
          {vendor?.socialLinks?.website && (
            <a href={vendor.socialLinks.website} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 text-xs mt-1 hover:underline">
              <ExternalLink size={12} className="mr-1" /> {vendor.socialLinks.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {isOwner ? (
            <Link to="/vendor/settings" className="flex-1 bg-[var(--surface-2)] text-[var(--primary)] font-bold py-2.5 rounded-xl text-center text-sm border border-[var(--border)] hover:bg-[var(--surface)] transition-all flex items-center justify-center">
              <Edit size={16} className="mr-2" /> Edit Storefront
            </Link>
          ) : (
            <>
              <button onClick={handleToggleFollow} className={`flex-1 font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm ${isFollowing ? 'bg-[var(--surface-2)] text-[var(--primary)] border border-[var(--border)]' : 'bg-[var(--primary)] text-white'}`}>
                <Users size={14} className="inline mr-1.5 -mt-0.5" />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button onClick={() => toast('Messages coming soon!')} className="flex-1 bg-[var(--surface-2)] text-[var(--primary)] font-bold py-2.5 rounded-xl text-sm border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface)] transition-all">
                <MessageCircle size={16} className="mr-2" /> Message
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-t border-[var(--border)] mt-8 relative">
        <button onClick={() => setActiveTab('products')} className={`flex-1 flex justify-center py-4 transition-all ${activeTab === 'products' ? 'text-[var(--primary)] border-t-2 border-[var(--primary)] -mt-[1px]' : 'text-[var(--text-secondary)] hover:text-gray-400'}`}>
          <Grid3x3 size={24} strokeWidth={activeTab === 'products' ? 2.5 : 2} />
        </button>
        <button onClick={() => setActiveTab('reels')} className={`flex-1 flex justify-center py-4 transition-all ${activeTab === 'reels' ? 'text-[var(--primary)] border-t-2 border-[var(--primary)] -mt-[1px]' : 'text-[var(--text-secondary)] hover:text-gray-400'}`}>
          <PlaySquare size={24} strokeWidth={activeTab === 'reels' ? 2.5 : 2} />
        </button>
      </div>

      {/* Content Grid */}
      <div className="p-0.5">
        <AnimatePresence mode="wait">
          {activeTab === 'products' ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-0.5">
              {isLoadingProducts ? (
                Array(6).fill(0).map((_, i) => <div key={i} className="aspect-square bg-[var(--surface-2)] animate-pulse" />)
              ) : products.length > 0 ? (
                products.map((product) => (
                  <Link to={`/products/${product.slug}`} key={product._id} className="aspect-square bg-[var(--surface-2)] overflow-hidden group">
                    <img src={product.images?.[0]?.url || 'https://placehold.co/400'} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </Link>
                ))
              ) : (
                <div className="col-span-3 text-center py-20 text-[var(--text-secondary)] text-sm">No products published yet.</div>
              )}
            </motion.div>
          ) : (
            <motion.div key="reels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 px-10 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-[var(--text-primary)] flex items-center justify-center mb-4"><PlaySquare size={32} /></div>
              <h3 className="font-bold text-[var(--primary)]">No Collections Yet</h3>
              <p className="text-[var(--text-secondary)] text-sm mt-1">When this vendor shares video collections, they'll appear here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Share Menu — responsive: bottom-sheet on mobile, centered modal on desktop */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/40 z-[70]"
            />
            {/* Mobile bottom-sheet */}
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] rounded-t-3xl z-[80] p-6 pb-10 lg:hidden"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="space-y-1">
                <button onClick={handleShare} className="w-full flex items-center space-x-4 py-4 font-bold text-[var(--primary)]"><Link2 size={24} /><span>Copy Profile Link</span></button>
                <button onClick={handleShare} className="w-full flex items-center space-x-4 py-4 font-bold text-[var(--primary)]"><Share2 size={24} /><span>Share Profile via...</span></button>
                {!isOwner && <button onClick={() => { setShowMenu(false); toast.success('Reported'); }} className="w-full flex items-center space-x-4 py-4 font-bold text-red-500"><Flag size={24} /><span>Report Vendor</span></button>}
              </div>
            </motion.div>
            {/* Desktop centered modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="hidden lg:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] rounded-2xl z-[80] p-8 w-full max-w-sm shadow-2xl border border-[var(--border)]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[var(--primary)] text-lg">Share Store</h3>
                <button onClick={() => setShowMenu(false)} className="p-1.5 hover:bg-[var(--surface-2)] rounded-full"><X size={20} /></button>
              </div>
              <div className="space-y-1">
                <button onClick={handleShare} className="w-full flex items-center space-x-4 py-3 px-4 font-bold text-[var(--primary)] hover:bg-[var(--surface-2)] rounded-xl transition-colors"><Link2 size={22} /><span>Copy Profile Link</span></button>
                <button onClick={handleShare} className="w-full flex items-center space-x-4 py-3 px-4 font-bold text-[var(--primary)] hover:bg-[var(--surface-2)] rounded-xl transition-colors"><Share2 size={22} /><span>Share Profile via...</span></button>
                {!isOwner && <button onClick={() => { setShowMenu(false); toast.success('Reported'); }} className="w-full flex items-center space-x-4 py-3 px-4 font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Flag size={22} /><span>Report Vendor</span></button>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
