import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, MoreVertical, Heart, Send, MessageCircle, Bookmark,
  Star, Share2, Flag, Link2, ShoppingBag, UserPlus, UserCheck, X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api.js';
import { useCartStore } from '../../store/cartStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { useWishlistStore } from '../../store/wishlistStore.js';
import { useFollowStore } from '../../store/followStore.js';
import toast from 'react-hot-toast';

const fetchProduct = async (slug) => {
  const res = await api.get(`/products/${slug}`);
  return res.data.data.product;
};

const fetchReviews = async (productId) => {
  if (!productId) return [];
  const res = await api.get(`/reviews/product/${productId}?limit=20`);
  return res.data.data.reviews;
};

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.comment?.length > 120;
  return (
    <div className="py-5 border-b border-[var(--border)] last:border-0">
      <div className="flex items-start gap-3">
        <img
          src={review.customer?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.customer?.name}`}
          alt={review.customer?.name}
          className="w-9 h-9 rounded-full border border-[var(--border)] object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-sm text-[var(--primary)] truncate">{review.customer?.name || 'Customer'}</span>
            <span className="text-[10px] text-[var(--text-secondary)] flex-shrink-0">
              {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : ''}
            </span>
          </div>
          <div className="flex items-center gap-0.5 mb-2">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={12} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
            {review.isVerifiedPurchase && (
              <span className="ml-2 text-[9px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Verified</span>
            )}
          </div>
          {review.title && <p className="font-semibold text-sm text-[var(--primary)] mb-1">{review.title}</p>}
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {isLong && !expanded ? review.comment.slice(0, 120) + '…' : review.comment}
          </p>
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs font-bold text-[var(--accent)] mt-1">
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toggleFollow, isFollowing } = useFollowStore();
  
  const [currentImg, setCurrentImg] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['productReviews', product?._id],
    queryFn: () => fetchReviews(product?._id),
    enabled: !!product?._id,
  });

  const isSaved = product ? isInWishlist(product._id) : false;
  const following = product?.vendor ? isFollowing(product.vendor._id) : false;

  const handleDoubleTap = () => {
    if (!isLiked) setIsLiked(true);
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 1000);
  };

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add to bag'); navigate('/auth/login'); return; }
    try {
      await addToCart(product._id, 1);
      toast.success('Added to bag');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to bag');
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return navigate('/auth/login');
    if (!product?.vendor) return toast.error('Vendor information is missing.');
    try {
      const followed = await toggleFollow(product.vendor._id);
      toast.success(followed ? `Following ${product.vendor.shopName}` : `Unfollowed ${product.vendor.shopName}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update following status');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product?.title, text: `Check out this ${product?.title} on FurniHub!`, url }); }
      catch (err) { console.log('Share failed'); }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
    setShowMenu(false);
  };

  const toggleSave = async () => {
    if (!user) return navigate('/auth/login');
    try {
      const saved = await toggleWishlist(product._id);
      toast.success(saved ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  if (isLoading) return (
    <div className="fixed inset-0 z-[100] bg-[var(--surface-2)] flex items-center justify-center lg:bg-transparent">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
    </div>
  );
  if (!product) return (
    <div className="fixed inset-0 z-[100] bg-[var(--surface-2)] flex flex-col items-center justify-center gap-4">
      <ShoppingBag size={48} className="text-[var(--text-secondary)] opacity-40" />
      <p className="font-bold text-[var(--primary)]">Product not found</p>
      <button onClick={() => navigate(-1)} className="text-sm text-[var(--accent)] font-bold">Go Back</button>
    </div>
  );

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[var(--surface-2)] flex flex-col md:max-w-[600px] md:mx-auto md:border-x border-[var(--border)] lg:relative lg:max-w-6xl lg:grid lg:grid-cols-2 lg:bg-transparent lg:inset-auto lg:h-auto lg:mx-auto lg:mt-10 lg:gap-12 lg:border-none lg:px-4"
    >
      {/* Top Bar - Mobile Only */}
      <div className="flex-none bg-[var(--surface-2)]/95 backdrop-blur-md flex items-center justify-between px-4 py-3 border-b border-[var(--border)] z-50 lg:hidden">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-[var(--surface)] text-[var(--primary)] rounded-full transition"><ChevronLeft size={28} /></button>
        <div className="font-bold text-sm truncate uppercase tracking-widest text-[var(--text-secondary)]">{product.vendor?.shopName || 'Shop'}</div>
        <button onClick={() => setShowMenu(true)} className="p-1 hover:bg-[var(--surface)] text-[var(--primary)] rounded-full transition"><MoreVertical size={24} /></button>
      </div>

      {/* Product Media Column */}
      <div className="lg:sticky lg:top-24 lg:h-fit">
        <div className="w-full aspect-square bg-[var(--surface)] relative select-none cursor-pointer overflow-hidden lg:rounded-3xl lg:shadow-xl" onDoubleClick={handleDoubleTap}>
          <img src={product.images?.[currentImg]?.url || 'https://placehold.co/600'} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
          <AnimatePresence>
            {showHeartAnim && (
              <motion.div initial={{ scale: 0, opacity: 0, x: '-50%', y: '-50%' }} animate={{ scale: 1.2, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="absolute top-1/2 left-1/2 pointer-events-none z-20">
                <Heart size={120} className="fill-white text-white drop-shadow-2xl" strokeWidth={0} />
              </motion.div>
            )}
          </AnimatePresence>
          {product.images?.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1.5 z-10">
              {product.images.map((_, idx) => (
                <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentImg(idx); }} className={`h-1.5 rounded-full transition-all ${currentImg === idx ? 'w-4 bg-[var(--accent)]' : 'w-1.5 bg-[var(--surface-2)]/70'}`} />
              ))}
            </div>
          )}
        </div>
        {/* Secondary Images Grid - Desktop Only */}
        <div className="hidden lg:grid grid-cols-4 gap-4 mt-6">
          {product.images?.map((img, idx) => (
            <button key={idx} onClick={() => setCurrentImg(idx)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${currentImg === idx ? 'border-[var(--accent)] scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
              <img src={img.url} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>
      </div>

      {/* Info Column */}
      <div className="flex-1 overflow-y-auto no-scrollbar lg:overflow-visible lg:pt-0">
        <div className="p-4 lg:p-0">
          {/* Header Area Desktop */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--border)]">
                <img src={product.vendor?.shopLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${product.vendor?.shopName}`} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--primary)] leading-tight">{product.vendor?.shopName}</h4>
                <button onClick={handleFollowToggle} className="text-xs font-bold text-[var(--accent)] flex items-center hover:opacity-70">
                  {following ? <><UserCheck size={14} className="mr-1" /> Following</> : <><UserPlus size={14} className="mr-1" /> Follow Store</>}
                </button>
              </div>
            </div>
            <div className="flex space-x-4">
              <button onClick={toggleSave} className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition"><Bookmark size={24} className={isSaved ? "fill-[var(--primary)] text-[var(--primary)]" : "text-[var(--text-primary)]"} /></button>
              <button onClick={() => setShowMenu(true)} className="p-2 bg-white rounded-full shadow-sm hover:scale-110 transition"><Share2 size={24} /></button>
            </div>
          </div>

          {/* Social Icons - Mobile Only */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <div className="flex space-x-4">
              <button onClick={() => setIsLiked(!isLiked)}><Heart size={28} className={isLiked ? "fill-[var(--error)] text-[var(--error)]" : "text-[var(--text-primary)]"} strokeWidth={1.5} /></button>
              <button onClick={() => toast('Comments coming soon!')}><MessageCircle size={28} strokeWidth={1.5} /></button>
              <button onClick={handleShare}><Send size={28} strokeWidth={1.5} /></button>
            </div>
            <button onClick={toggleSave}><Bookmark size={28} className={isSaved ? "fill-[var(--primary)] text-[var(--primary)]" : "text-[var(--text-primary)]"} strokeWidth={1.5} /></button>
          </div>

          <h1 className="text-3xl lg:text-5xl font-serif font-bold text-[var(--primary)] mb-2 lg:mb-4">{product.title}</h1>
          <div className="font-sans font-bold text-xl lg:text-3xl mb-4 lg:mb-8 text-[var(--accent)]">
            ${product.discountPrice || product.price} 
            {product.discountPrice && <span className="text-sm lg:text-lg font-normal text-[var(--text-secondary)] line-through ml-2">${product.price}</span>}
          </div>

          {/* Vendor Mobile Snippet */}
          <div className="lg:hidden flex items-center space-x-2 mb-6 p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            <img src={product.vendor?.shopLogo} className="w-8 h-8 rounded-full border border-[var(--border)]" alt="" />
            <div className="flex-1 min-w-0"><span className="font-bold text-sm block truncate">{product.vendor?.shopName}</span></div>
            <button onClick={handleFollowToggle} className="px-4 py-1 text-xs font-bold bg-[var(--primary)] text-white rounded-full active:scale-95 transition">
              {following ? 'Following' : 'Follow'}
            </button>
          </div>

          <div className="text-[var(--text-primary)] text-sm lg:text-base mb-8 lg:mb-12 leading-relaxed bg-[var(--surface)] lg:bg-transparent p-4 lg:p-0 rounded-xl lg:rounded-none">
            <p className="mb-4">{product.description}</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t lg:border-t-0 border-[var(--border)]">
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">Category</span>
                <span className="font-bold text-[var(--primary)] capitalize">{product.category}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">In Stock</span>
                <span className="font-bold text-[var(--primary)]">{product.stock} units</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">Condition</span>
                <span className="font-bold text-[var(--primary)]">Brand New</span>
              </div>
            </div>
          </div>

          {/* Reviews Section — Bug 3 Fix: real data, fully visible */}
          <div className="bg-[var(--surface)] p-5 rounded-2xl shadow-sm border border-[var(--border)] mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-xl text-[var(--primary)]">Customer Reviews</h3>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <Star className="fill-amber-400 text-amber-400" size={14} />
                <span className="font-bold text-sm text-amber-700">{product.rating || 0}</span>
                <span className="text-xs text-amber-600 ml-1">({product.totalReviews || 0})</span>
              </div>
            </div>
            {reviews.length > 0 ? (
              <div>
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Star size={32} className="mx-auto mb-3 text-gray-200 fill-gray-200" />
                <p className="text-sm font-bold text-[var(--primary)]">No reviews yet</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Be the first to review this product</p>
              </div>
            )}
          </div>

          {/* Desktop Buy Button */}
          <div className="hidden lg:block">
            <button onClick={handleAddToCart} disabled={product.stock <= 0} className="w-full bg-[var(--primary)] text-white font-bold py-5 rounded-2xl shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 text-xl flex items-center justify-center hover:bg-[var(--primary-dark)]">
              <ShoppingBag size={24} className="mr-3" />
              {product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}
            </button>
            <p className="text-center text-[var(--text-secondary)] text-sm mt-4">Free standard shipping on this item.</p>
          </div>
        </div>
      </div>

      {/* Mobile-Only Sticky Action Bar */}
      <div className="flex-none p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-[var(--border)] bg-[var(--surface-2)]/95 backdrop-blur-md z-50 w-full shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:hidden">
        <button onClick={handleAddToCart} disabled={product.stock <= 0} className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-warm active:scale-95 transition-transform disabled:opacity-50 text-base flex items-center justify-center">
          <ShoppingBag size={20} className="mr-2" />
          {product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}
        </button>
      </div>

      {/* Share Menu — responsive */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMenu(false)} className="fixed inset-0 bg-black/40 z-[110]" />
            {/* Mobile bottom-sheet */}
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] rounded-t-3xl z-[120] p-6 pb-10 lg:hidden">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="space-y-1">
                <button onClick={handleShare} className="w-full flex items-center space-x-4 py-4 font-bold text-[var(--primary)]"><Link2 size={24} /><span>Copy Link</span></button>
                <button onClick={handleShare} className="w-full flex items-center space-x-4 py-4 font-bold text-[var(--primary)]"><Share2 size={24} /><span>Share via...</span></button>
                <button onClick={() => { setShowMenu(false); toast.success('Reported'); }} className="w-full flex items-center space-x-4 py-4 font-bold text-red-500"><Flag size={24} /><span>Report Product</span></button>
              </div>
            </motion.div>
            {/* Desktop centered modal */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="hidden lg:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] rounded-2xl z-[120] p-8 w-full max-w-sm shadow-2xl border border-[var(--border)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[var(--primary)] text-lg">Share Product</h3>
                <button onClick={() => setShowMenu(false)} className="p-1.5 hover:bg-[var(--surface-2)] rounded-full"><X size={20} /></button>
              </div>
              <div className="space-y-1">
                <button onClick={handleShare} className="w-full flex items-center space-x-4 py-3 px-4 font-bold text-[var(--primary)] hover:bg-[var(--surface-2)] rounded-xl transition-colors"><Link2 size={22} /><span>Copy Link</span></button>
                <button onClick={handleShare} className="w-full flex items-center space-x-4 py-3 px-4 font-bold text-[var(--primary)] hover:bg-[var(--surface-2)] rounded-xl transition-colors"><Share2 size={22} /><span>Share via...</span></button>
                <button onClick={() => { setShowMenu(false); toast.success('Reported'); }} className="w-full flex items-center space-x-4 py-3 px-4 font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Flag size={22} /><span>Report Product</span></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
