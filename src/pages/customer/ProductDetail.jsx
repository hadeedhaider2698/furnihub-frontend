import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Truck, ShieldCheck, Heart, Minus, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api.js';
import { useCartStore } from '../../store/cartStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';
import { Loader, FullPageLoader } from '../../components/ui/Loader.jsx';
import { Button } from '../../components/ui/Button.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  const { user } = useAuthStore();
  const addToCart = useCartStore(state => state.addToCart);
  const openCart = useUiStore(state => state.openCart);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await api.get(`/products/${slug}`);
      return res.data.data.product;
    }
  });

  if (isLoading) return <FullPageLoader />;
  if (isError || !product) return <div className="text-center py-20">Product not found.</div>;

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      navigate('/auth/login');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    
    try {
      await addToCart(product._id, quantity, selectedColor?.name);
      toast.success('Added to cart');
      openCart();
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please log in to use wishlist');
      return navigate('/auth/login');
    }
    try {
      const res = await api.post('/wishlist/toggle', { productId: product._id });
      toast.success(res.data.message);
    } catch (e) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <Helmet>
        <title>{product.title} | FurniHub</title>
        <meta name="description" content={product.shortDescription || product.description.substring(0, 150)} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.title,
            "description": product.description,
            "image": product.images.map(img => img.url),
            "offers": {
              "@type": "Offer",
              "url": window.location.href,
              "priceCurrency": "USD",
              "price": product.discountPrice || product.price,
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
          })}
        </script>
      </Helmet>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Images Gallery */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-xl overflow-hidden bg-surface-2 border border-border"
          >
            <img 
              src={product.images[selectedImage]?.url || 'https://placehold.co/800x800'} 
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
          {product.images.length > 1 && (
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${selectedImage === idx ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <p className="text-sm font-medium text-text-secondary uppercase tracking-widest mb-2">{product.category}</p>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-4">{product.title}</h1>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center text-accent">
              <Star size={18} fill="currentColor" />
              <span className="ml-1 font-medium">{product.rating}</span>
            </div>
            <span className="text-text-secondary text-sm">({product.totalReviews} reviews)</span>
          </div>

          <div className="flex items-end space-x-4 mb-8 border-b border-border pb-8">
            <span className="text-4xl font-serif font-bold text-primary">${product.discountPrice || product.price}</span>
            {product.discountPrice && (
              <span className="text-xl text-text-secondary line-through mb-1">${product.price}</span>
            )}
          </div>

          <p className="text-text-secondary leading-relaxed mb-8">{product.description}</p>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-primary mb-3">Color: {selectedColor?.name || 'Select a color'}</h3>
              <div className="flex space-x-3">
                {product.colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color.hex }}
                    className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-transform hover:scale-110 ${selectedColor?.name === color.name ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-border'}`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4 mb-8">
            <div className="flex items-center border border-border rounded-full h-12 px-4 bg-surface-2">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-text-secondary hover:text-primary disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus size={18} />
              </button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="text-text-secondary hover:text-primary disabled:opacity-50"
                disabled={quantity >= product.stock}
              >
                <Plus size={18} />
              </button>
            </div>
            
            <Button onClick={handleAddToCart} className="flex-1 h-12" disabled={product.stock === 0}>
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            
            <button onClick={handleWishlist} className="w-12 h-12 flex items-center justify-center rounded-full border border-border hover:bg-surface-2 transition-colors text-text-secondary hover:text-error">
              <Heart size={20} />
            </button>
          </div>

          {/* Delivery & Trust */}
          <div className="space-y-4 bg-surface p-6 rounded-lg mb-8">
            <div className="flex items-center text-sm">
              <Truck size={20} className="text-primary mr-4" />
              <div>
                <p className="font-medium text-primary">Delivery</p>
                <p className="text-text-secondary">Estimated {product.deliveryInfo?.estimatedDays} days. {product.deliveryInfo?.freeDelivery ? 'Free shipping.' : `$${product.deliveryInfo?.deliveryCharge} shipping fee.`}</p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <ShieldCheck size={20} className="text-primary mr-4" />
              <div>
                <p className="font-medium text-primary">Warranty</p>
                <p className="text-text-secondary">2-year manufacturer warranty included.</p>
              </div>
            </div>
          </div>

          {/* Vendor Info */}
          {product.vendor && (
            <div className="border border-border p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {product.vendor.shopLogo ? (
                  <img src={product.vendor.shopLogo} alt="Vendor" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-serif text-xl">{product.vendor.shopName.charAt(0)}</div>
                )}
                <div>
                  <p className="font-medium text-primary">Sold by {product.vendor.shopName}</p>
                  <p className="text-xs text-text-secondary">⭐ {product.vendor.rating} | {product.vendor.totalReviews} Reviews</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
