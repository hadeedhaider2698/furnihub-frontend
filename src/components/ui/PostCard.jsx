import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Link2, Share2, Flag, Copy } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { useWishlistStore } from '../../store/wishlistStore.js';
import toast from 'react-hot-toast';

export default function PostCard({ product }) {
  const [isLiked, setIsLiked] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const navigate = useNavigate();

  const isSaved = isInWishlist(product._id);

  const handleDoubleTap = () => {
    if (!isLiked) setIsLiked(true);
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 1000);
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add to bag');
      navigate('/auth/login');
      return;
    }
    try {
      await addToCart(product._id, 1);
      toast.success('Added to bag');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to bag');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out this ${product.title} on FurniHub!`,
      url: window.location.origin + '/products/' + product.slug,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
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

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      className="bg-[var(--surface-2)] border-b lg:border border-[var(--border)] lg:rounded-xl lg:my-6 overflow-hidden max-w-[600px] mx-auto w-full relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <Link to={`/vendor/${product.vendor?._id}`} className="block h-10 w-10 min-w-10 rounded-full border border-[var(--border)] p-0.5 relative">
            <img 
              src={product.vendor?.shopLogo || "https://api.dicebear.com/7.x/initials/svg?seed=" + (product.vendor?.shopName || 'Vendor')} 
              alt={product.vendor?.shopName}
              className="h-full w-full rounded-full object-cover"
            />
          </Link>
          <div className="flex flex-col">
            <Link to={`/vendor/${product.vendor?._id}`} className="font-semibold text-sm text-[var(--primary)] hover:opacity-70 transition">
              {product.vendor?.shopName || 'Luxury Furniture'}
            </Link>
            <span className="text-xs text-[var(--accent)] font-medium">
              {typeof product.category === 'string' ? product.category : (product.category?.name || 'Original Design')}
            </span>
          </div>
        </div>
        <button onClick={() => setShowMenu(true)} className="text-[var(--text-primary)] px-2 hover:bg-[var(--surface)] p-1 rounded-full"><MoreHorizontal size={20} /></button>
      </div>

      {/* Media */}
      <div className="relative w-full aspect-square md:aspect-[4/5] bg-[var(--surface)] overflow-hidden cursor-pointer select-none" onDoubleClick={handleDoubleTap}>
        <img src={product.images?.[0]?.url || 'https://placehold.co/600'} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
        <AnimatePresence>
          {showHeartAnim && (
            <motion.div initial={{ scale: 0, opacity: 0, x: '-50%', y: '-50%' }} animate={{ scale: 1.2, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="absolute top-1/2 left-1/2 pointer-events-none drop-shadow-2xl">
              <Heart size={100} className="fill-white text-white opacity-90 drop-shadow-xl" strokeWidth={1} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsLiked(!isLiked)}><Heart size={26} className={isLiked ? "fill-[var(--error)] text-[var(--error)]" : "text-[var(--text-primary)]"} strokeWidth={1.5} /></button>
            <button onClick={() => toast('Comments coming soon!')}><MessageCircle size={26} strokeWidth={1.5} className="text-[var(--text-primary)]" /></button>
            <button onClick={handleShare}><Send size={26} strokeWidth={1.5} className="text-[var(--text-primary)]" /></button>
          </div>
          <button onClick={toggleSave}><Bookmark size={26} strokeWidth={1.5} className={isSaved ? "fill-[var(--primary)] text-[var(--primary)]" : "text-[var(--text-primary)]"} /></button>
        </div>

        <div className="font-semibold text-sm mb-1 text-[var(--text-primary)]">
          <span className="font-serif text-base">${product.discountPrice || product.price}</span>
          {product.discountPrice && <span className="text-xs text-[var(--text-secondary)] line-through ml-2 font-normal">${product.price}</span>}
        </div>

        <div className="text-sm text-[var(--text-primary)]">
          <span className="font-semibold mr-2 cursor-pointer">{product.vendor?.shopName || 'Shop'}</span>
          <span className={isExpanded ? '' : 'line-clamp-2'}><span className="font-medium mr-1">{product.title}</span> — {product.description}</span>
          {product.description?.length > 80 && !isExpanded && (
            <button onClick={() => setIsExpanded(true)} className="text-[var(--text-secondary)] text-sm mt-1 font-medium ml-1">more</button>
          )}
        </div>

        <div className="mt-2">
          <Link to={`/products/${product.slug}`} className="text-[var(--text-secondary)] text-sm font-medium hover:underline">View all {product.totalReviews || 0} reviews</Link>
        </div>
        
        <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide mt-2 mb-3">
          {product.createdAt ? `${formatDistanceToNow(new Date(product.createdAt))} ago` : 'recently'}
        </div>
        
        <button onClick={handleAddToCart} className="w-full bg-[var(--surface)] text-[var(--primary)] border border-[var(--border)] py-2 rounded-lg text-sm font-bold hovering hover:bg-[var(--primary)] hover:text-white transition-colors">Add to Bag</button>
      </div>

      {/* Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMenu(false)} className="fixed inset-0 bg-black/40 z-[70]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[80] p-6 pb-all md:max-w-[600px] md:mx-auto">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="space-y-1">
                <button onClick={handleShare} className="w-full flex items-center space-x-4 py-4 font-bold text-gray-800"><Link2 size={24} /><span>Copy Link</span></button>
                <button onClick={handleShare} className="w-full flex items-center space-x-4 py-4 font-bold text-gray-800"><Share2 size={24} /><span>Share via...</span></button>
                <button onClick={() => { setShowMenu(false); toast.success('Reported'); }} className="w-full flex items-center space-x-4 py-4 font-bold text-red-500"><Flag size={24} /><span>Report Post</span></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
