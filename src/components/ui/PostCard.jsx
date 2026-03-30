import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore.js';
import toast from 'react-hot-toast';

export default function PostCard({ product }) {
  const [isLiked, setIsLiked] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { addToCart } = useCartStore();

  const handleDoubleTap = () => {
    if (!isLiked) setIsLiked(true);
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 1000);
  };

  const handleAddToCart = () => {
    addToCart(product._id, 1);
    toast.success('Added to bag');
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      className="bg-[var(--surface-2)] border-b lg:border border-[var(--border)] lg:rounded-xl lg:my-6 overflow-hidden max-w-[600px] mx-auto w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <Link to={`/vendor/${product.vendor?._id}`} className="block h-10 w-10 min-w-10 rounded-full border border-[var(--border)] p-0.5 relative">
            <img 
              src={product.vendor?.logo || "https://api.dicebear.com/7.x/initials/svg?seed=" + (product.vendor?.shopName || 'Vendor')} 
              alt={product.vendor?.shopName}
              className="h-full w-full rounded-full object-cover"
            />
          </Link>
          <div className="flex flex-col">
            <Link to={`/vendor/${product.vendor?._id}`} className="font-semibold text-sm text-[var(--primary)] hover:opacity-70 transition">
              {product.vendor?.shopName || 'Luxury Furniture'}
            </Link>
            <span className="text-xs text-[var(--accent)] font-medium">Original Design</span>
          </div>
        </div>
        <button className="text-[var(--text-primary)] px-2"><MoreHorizontal size={20} /></button>
      </div>

      {/* Image / Media with Double Tap */}
      <div 
        className="relative w-full aspect-square md:aspect-[4/5] bg-[var(--surface)] overflow-hidden cursor-pointer select-none"
        onDoubleClick={handleDoubleTap}
      >
        <img 
          src={product.images?.[0]?.url || 'https://placehold.co/600'} 
          alt={product.title} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Double tap heart animation */}
        <AnimatePresence>
          {showHeartAnim && (
            <motion.div 
              initial={{ scale: 0, opacity: 0, x: '-50%', y: '-50%' }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="absolute top-1/2 left-1/2 pointer-events-none drop-shadow-2xl"
            >
              <Heart size={100} className="fill-white text-white opacity-90 drop-shadow-xl" strokeWidth={1} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsLiked(!isLiked)} className="transition-transform active:scale-75">
              <Heart size={26} className={isLiked ? "fill-[var(--error)] text-[var(--error)]" : "text-[var(--text-primary)] hover:text-gray-500"} strokeWidth={1.5} />
            </button>
            <button className="hover:opacity-60 transition" onClick={() => toast('Comments coming soon!')}>
              <MessageCircle size={26} strokeWidth={1.5} className="text-[var(--text-primary)]" />
            </button>
            <button className="hover:opacity-60 transition" onClick={() => { navigator.clipboard.writeText(window.location.host + '/products/' + product.slug); toast.success('Link copied'); }}>
              <Send size={26} strokeWidth={1.5} className="text-[var(--text-primary)] -mt-1 ml-1" />
            </button>
          </div>
          <button className="hover:opacity-60 transition">
            <Bookmark size={26} strokeWidth={1.5} className="text-[var(--text-primary)]" />
          </button>
        </div>

        {/* Pricing / Likes equivalent */}
        <div className="font-semibold text-sm mb-1 text-[var(--text-primary)]">
          <span className="font-serif text-base">${product.discountPrice || product.price}</span>
          {product.discountPrice && <span className="text-xs text-[var(--text-secondary)] line-through ml-2 font-normal">${product.price}</span>}
        </div>

        {/* Caption */}
        <div className="text-sm text-[var(--text-primary)]">
          <span className="font-semibold mr-2 cursor-pointer">{product.vendor?.shopName || 'Shop'}</span>
          <span className={isExpanded ? '' : 'line-clamp-2'}>
            <span className="font-medium mr-1">{product.title}</span> — {product.description}
          </span>
          {product.description?.length > 80 && !isExpanded && (
            <button onClick={() => setIsExpanded(true)} className="text-[var(--text-secondary)] text-sm mt-1 font-medium">
              more
            </button>
          )}
        </div>

        {/* Comments/Reviews Link */}
        <div className="mt-2">
          <Link to={`/products/${product.slug}`} className="text-[var(--text-secondary)] text-sm font-medium hover:underline">
            View all {product.totalReviews || 0} reviews
          </Link>
        </div>
        
        {/* Post Date */}
        <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide mt-2 mb-3">
          2 days ago
        </div>
        
        {/* Quick Add To Cart */}
        <button 
          onClick={handleAddToCart}
          className="w-full bg-[var(--surface)] text-[var(--primary)] border border-[var(--border)] py-2 rounded-lg text-sm font-bold hovering hover:bg-[var(--primary)] hover:text-white transition-colors"
        >
          Add to Bag
        </button>
      </div>
    </motion.article>
  );
}
