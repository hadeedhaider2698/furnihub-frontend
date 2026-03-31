import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { Button } from '../../components/ui/Button.jsx';
import { motion } from 'framer-motion';

export default function CartPage() {
  const { items, updateQuantity, removeItem, cartTotal } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-[var(--surface-2)] rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-[var(--text-secondary)]" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-[var(--primary)] mb-4">Your Cart</h1>
        <p className="text-[var(--text-secondary)] mb-8 max-w-xs mx-auto">Please login to view and manage your shopping bag.</p>
        <Button onClick={() => navigate('/auth/login')} className="px-8 h-12">Log In to FurniHub</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center flex flex-col items-center">
         <div className="w-24 h-24 bg-[var(--surface-2)] rounded-full flex items-center justify-center mb-6">
           <ShoppingBag size={48} className="text-[var(--text-secondary)]" />
         </div>
        <h1 className="text-4xl font-serif font-bold text-[var(--primary)] mb-4">Your Bag is Empty</h1>
        <p className="text-[var(--text-secondary)] mb-10 max-w-sm mx-auto">Looks like you haven't added any luxury pieces yet. Explore our collection to find something special.</p>
        <Button onClick={() => navigate('/explore')} className="px-10 h-14 text-base font-bold shadow-warm">Start Exploring</Button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] min-h-screen">
      <Helmet><title>Shopping Bag | FurniHub</title></Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 lg:py-16">
        <div className="flex items-baseline justify-between border-b border-[var(--border)] pb-8 mb-10">
          <h1 className="text-4xl font-serif font-bold text-[var(--primary)] tracking-tight">Shopping Bag</h1>
          <p className="text-[var(--text-secondary)] font-medium">{items.length} {items.length === 1 ? 'Item' : 'Items'}</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start gap-12">
          {/* Items List */}
          <div className="flex-1">
            <ul className="divide-y divide-[var(--border)] border-b border-[var(--border)]">
              {items.map((item, idx) => (
                <motion.li 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`${item.product._id}-${item.color || idx}`} 
                  className="py-8 flex flex-col sm:flex-row gap-8 group"
                >
                  {/* Product Image */}
                  <div className="relative h-48 w-full sm:w-48 lg:h-56 lg:w-56 flex-shrink-0 rounded-2xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] shadow-sm group-hover:shadow-md transition-shadow">
                    <img 
                      src={item.product.images[0]?.url} 
                      alt={item.product.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <Link to={`/products/${item.product.slug}`} className="absolute inset-0 z-10" aria-label="View product" />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <Link to={`/products/${item.product.slug}`} className="text-xl lg:text-2xl font-serif font-bold text-[var(--primary)] hover:text-[var(--accent)] transition-colors line-clamp-1 block mb-1">
                          {item.product.title}
                        </Link>
                        <p className="text-sm font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">{item.product.category || 'Luxury Collection'}</p>
                        {item.color && (
                          <div className="flex items-center space-x-2 text-sm text-[var(--text-primary)] bg-[var(--surface-2)] py-1 px-3 rounded-full w-fit border border-[var(--border)]">
                            <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: item.color.toLowerCase() }}></span>
                            <span className="font-bold">{item.color}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl lg:text-2xl font-black text-[var(--primary)]">${(item.product.discountPrice || item.product.price).toLocaleString()}</p>
                        {item.product.discountPrice && (
                             <p className="text-sm text-[var(--text-secondary)] line-through opacity-60">${item.product.price.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Quantity & Actions */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[var(--border)]/40 mt-auto">
                      <div className="flex items-center bg-[var(--surface-2)] rounded-xl h-12 p-1 border border-[var(--border)] shadow-inner">
                        <button 
                          onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1), item.color)}
                          className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface)] hover:shadow-sm rounded-lg transition-all"
                        ><Minus size={16} /></button>
                        <span className="w-12 text-center font-black text-[var(--primary)]">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product._id, Math.min(item.product.stock, item.quantity + 1), item.color)}
                          className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface)] hover:shadow-sm rounded-lg transition-all"
                        ><Plus size={16} /></button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.product._id)}
                        className="text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors flex items-center text-sm font-bold bg-[var(--surface-2)] py-3 px-5 rounded-xl border border-[var(--border)] hover:border-[var(--error)]/30 group/trash"
                      >
                        <Trash2 size={18} className="mr-2 group-hover/trash:shake" /> Remove Item
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-[400px] flex-shrink-0">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 sticky top-32 shadow-xl shadow-black/5">
              <h2 className="text-2xl font-serif font-bold text-[var(--primary)] mb-8 tracking-tight">Order Summary</h2>
              
              <div className="space-y-5 text-sm mb-8 border-b border-[var(--border)] pb-8">
                <div className="flex justify-between font-medium">
                  <p className="text-[var(--text-secondary)]">Subtotal</p>
                  <p className="text-[var(--primary)] font-bold">${cartTotal().toLocaleString()}</p>
                </div>
                <div className="flex justify-between font-medium">
                  <p className="text-[var(--text-secondary)]">Shipping estimate</p>
                  <p className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Free Shipping</p>
                </div>
                <div className="flex justify-between font-medium">
                  <p className="text-[var(--text-secondary)]">Estimated Tax</p>
                  <p className="text-[var(--primary)] font-bold">$0.00</p>
                </div>
              </div>
              
              <div className="flex justify-between items-baseline mb-10">
                <p className="text-base font-bold text-[var(--primary)] uppercase tracking-wider">Total Amount</p>
                <p className="text-4xl font-serif font-black text-[var(--primary)]">${cartTotal().toLocaleString()}</p>
              </div>
              
              <Button onClick={() => navigate('/checkout')} className="w-full h-16 text-lg font-black tracking-wide shadow-warm hover:shadow-lg active:scale-95 transition-all">
                Proceed to Checkout <ArrowRight size={22} className="ml-2" />
              </Button>
              
              <div className="mt-8 flex items-center justify-center space-x-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
