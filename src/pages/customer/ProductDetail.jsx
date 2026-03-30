import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MoreVertical, Heart, Send, MessageCircle, Bookmark, Star } from 'lucide-react';
import api from '../../services/api.js';
import { useCartStore } from '../../store/cartStore.js';
import toast from 'react-hot-toast';

const fetchProduct = async (slug) => {
  const res = await api.get(`/products/${slug}`);
  return res.data.data.product;
};

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const [currentImg, setCurrentImg] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug),
  });

  if (isLoading) {
    return <div className="min-h-screen bg-[var(--surface-2)] animate-pulse"></div>;
  }

  if (!product) {
    return <div className="text-center pt-20">Product not found</div>;
  }

  const handleDoubleTap = () => {
    if (!isLiked) setIsLiked(true);
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 1000);
  };

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-[var(--surface-2)] overflow-y-auto w-full md:max-w-[600px] md:mx-auto lg:top-0 md:border-x border-[var(--border)]"
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-[var(--surface-2)]/90 backdrop-blur-md flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-[var(--surface)] text-[var(--primary)] rounded-full transition">
          <ChevronLeft size={28} />
        </button>
        <div className="font-bold text-sm truncate uppercase tracking-widest text-[var(--text-secondary)]">{product.vendor?.shopName || 'Shop'}</div>
        <button className="p-1 hover:bg-[var(--surface)] text-[var(--primary)] rounded-full transition">
          <MoreVertical size={24} />
        </button>
      </div>

      {/* Image Carousel Area */}
      <div 
        className="w-full aspect-square bg-[var(--surface)] relative select-none cursor-pointer"
        onDoubleClick={handleDoubleTap}
      >
        <img 
          src={product.images?.[currentImg]?.url || 'https://placehold.co/600'} 
          alt={product.title} 
          className="w-full h-full object-cover"
        />
        
        {/* Heart Anim */}
        <AnimatePresence>
          {showHeartAnim && (
            <motion.div 
              initial={{ scale: 0, opacity: 0, x: '-50%', y: '-50%' }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="absolute top-1/2 left-1/2 pointer-events-none"
            >
              <Heart size={120} className="fill-white text-white drop-shadow-2xl" strokeWidth={0} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Dots */}
        {product.images?.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1.5 z-10">
            {product.images.map((_, idx) => (
              <button 
                key={idx} 
                onClick={(e) => { e.stopPropagation(); setCurrentImg(idx); }}
                className={`h-1.5 rounded-full transition-all ${currentImg === idx ? 'w-4 bg-[var(--accent)]' : 'w-1.5 bg-[var(--surface-2)]/70'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 pb-28">
        {/* Actions Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-4">
            <button onClick={() => setIsLiked(!isLiked)} className="transition-transform active:scale-75">
              <Heart size={28} className={isLiked ? "fill-[var(--error)] text-[var(--error)]" : "text-[var(--text-primary)] hover:text-gray-500"} strokeWidth={1.5} />
            </button>
            <button className="text-[var(--text-primary)] hover:text-gray-500 transition"><MessageCircle size={28} strokeWidth={1.5} /></button>
            <button className="text-[var(--text-primary)] hover:text-gray-500 transition" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); }}><Send size={28} strokeWidth={1.5} className="-mt-1 ml-1" /></button>
          </div>
          <button className="text-[var(--text-primary)] hover:text-gray-500 transition"><Bookmark size={28} strokeWidth={1.5} /></button>
        </div>

        {/* Likes / Price */}
        <div className="font-serif font-bold text-2xl mb-2 text-[var(--primary)] flex items-center">
          ${product.discountPrice || product.price}
          {product.discountPrice && <span className="text-sm font-sans font-medium text-[var(--text-secondary)] line-through ml-3 mt-1">${product.price}</span>}
        </div>

        {/* Description */}
        <div className="text-[var(--text-primary)] text-sm mb-6 leading-relaxed">
          <span className="font-bold mr-2 text-[var(--primary)]">{product.vendor?.shopName || 'Shop'}</span>
          {product.description}
        </div>

        {/* Details Specs */}
        <ul className="text-sm text-[var(--text-secondary)] space-y-3 mb-8 bg-[var(--surface)] p-5 rounded-xl border border-[var(--border)]">
          <li className="flex justify-between"><span className="font-bold text-[var(--primary)]">Category</span> <span className="capitalize">{product.category}</span></li>
          <li className="flex justify-between"><span className="font-bold text-[var(--primary)]">Availability</span> <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span></li>
          <li className="flex justify-between"><span className="font-bold text-[var(--primary)]">Delivery</span> <span>Estimated 5-7 days</span></li>
        </ul>

        {/* Reviews Summary */}
        <div className="border-t border-[var(--border)] pt-6 mt-6">
          <h3 className="font-serif font-bold text-xl text-[var(--primary)] mb-4">Reviews</h3>
          <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
            <Star className="fill-[var(--warning)] text-[var(--warning)]" size={20} />
            <span className="font-bold text-lg text-[var(--text-primary)]">{product.rating || 0}</span>
            <span className="pt-0.5">({product.totalReviews || 0} reviews)</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Add To Cart */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-[var(--border)] bg-[var(--surface-2)]/95 backdrop-blur-md pb-safe md:max-w-[600px] md:mx-auto md:border-x">
        <button 
          onClick={() => {
            addToCart(product._id, 1);
            toast.success('Added to bag');
            navigate(-1);
          }}
          disabled={product.stock <= 0}
          className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-warm active:scale-95 transition-transform disabled:opacity-50 text-base tracking-wide"
        >
          {product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}
        </button>
      </div>
    </motion.div>
  );
}
