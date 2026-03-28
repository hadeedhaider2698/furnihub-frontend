import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore.js';
import { useCartStore } from '../../store/cartStore.js';
import { Button } from '../ui/Button.jsx';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore.js';

export default function CartDrawer() {
  const { isCartOpen, closeCart } = useUiStore();
  const { items, isLoading, fetchCart, updateQuantity, removeItem, cartTotal } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCartOpen && user) {
      fetchCart();
    }
  }, [isCartOpen, user, fetchCart]);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface-2 shadow-2xl flex flex-col border-l border-border"
          >
            <header className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-serif font-bold text-primary flex items-center">
                <ShoppingBag className="mr-3" /> Your Cart
              </h2>
              <button onClick={closeCart} className="text-text-secondary hover:text-primary transition-colors">
                <X size={24} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
              {!user ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBag size={48} className="text-text-secondary opacity-50" />
                  <p className="text-text-secondary">Please login to view your cart.</p>
                  <Button onClick={() => { closeCart(); navigate('/auth/login'); }}>Log In</Button>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBag size={48} className="text-text-secondary opacity-50" />
                  <p className="text-text-secondary">Your cart is empty.</p>
                  <Button onClick={() => { closeCart(); navigate('/products'); }} variant="outline">Continue Shopping</Button>
                </div>
              ) : (
                <ul className="space-y-6">
                  {items.map((item, idx) => (
                    <li key={`${item.product._id}-${item.color || idx}`} className="flex gap-4">
                      <div className="h-24 w-24 flex-shrink-0 rounded-md border border-border overflow-hidden">
                        <img 
                          src={item.product.images[0]?.url} 
                          alt={item.product.title}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-base font-medium text-primary">
                            <h3 className="line-clamp-1">{item.product.title}</h3>
                            <p className="ml-4">${(item.product.discountPrice || item.product.price) * item.quantity}</p>
                          </div>
                          {item.color && <p className="mt-1 text-sm text-text-secondary">Color: {item.color}</p>}
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center border border-border rounded-full h-8 px-2 bg-surface-2">
                            <button 
                              onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1), item.color)}
                              className="text-text-secondary hover:text-primary disabled:opacity-50"
                            ><Minus size={14} /></button>
                            <span className="w-8 text-center font-medium text-xs">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product._id, Math.min(item.product.stock, item.quantity + 1), item.color)}
                              className="text-text-secondary hover:text-primary"
                            ><Plus size={14} /></button>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeItem(item.product._id)}
                            className="font-medium text-error hover:text-red-700 flex items-center"
                          >
                            <Trash2 size={16} className="mr-1" /> Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {user && items.length > 0 && (
              <div className="border-t border-border p-6 bg-surface">
                <div className="flex justify-between text-base font-medium text-primary mb-4">
                  <p>Subtotal</p>
                  <p className="font-serif text-xl border-b-2 border-accent pb-1">${cartTotal()}</p>
                </div>
                <p className="mt-0.5 text-sm text-text-secondary mb-6">Shipping and taxes calculated at checkout.</p>
                <div className="space-y-3">
                  <Button className="w-full" onClick={handleCheckout}>Checkout</Button>
                  <Button variant="outline" className="w-full" onClick={() => { closeCart(); navigate('/cart'); }}>View Full Cart</Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
