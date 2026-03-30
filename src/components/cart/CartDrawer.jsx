import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore.js';
import { useUiStore } from '../../store/uiStore.js';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen } = useUiStore();
  const { items, removeItem, updateQuantity, cartTotal } = useCartStore();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1A1A2E]/40 z-50 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer (Bottom Sheet on Mobile, Sidebar on Desktop) */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] h-max bg-[var(--surface-2)] z-50 rounded-t-3xl shadow-2xl flex flex-col md:top-0 md:bottom-auto md:h-screen md:w-[400px] md:left-auto md:right-0 md:rounded-none"
          >
            {/* Header Handle */}
            <div className="w-full flex justify-center pt-3 pb-2 md:hidden">
              <div className="w-12 h-1.5 bg-[var(--border)] rounded-full" />
            </div>

            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="text-xl font-serif font-bold text-[var(--primary)] flex items-center space-x-2">
                <ShoppingBag size={22} className="text-[var(--accent)]" />
                <span>Your Bag</span>
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-[var(--surface)] text-[var(--text-primary)] rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[50vh] md:max-h-full">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)]">
                  <ShoppingBag size={64} className="mb-4 opacity-20" />
                  <p>Your bag is empty.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product._id} className="flex gap-4">
                    <div className="h-20 w-20 rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden flex-shrink-0">
                      <img src={item.product.images?.[0]?.url || 'https://placehold.co/100'} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-semibold text-[var(--primary)] text-sm line-clamp-1">{item.product.title}</h4>
                        <p className="text-sm font-bold mt-1 text-[var(--accent-2)]">${item.product.discountPrice || item.product.price}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[var(--border)] rounded-md bg-[var(--surface)]">
                          <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="p-1 px-2 text-[var(--text-primary)]"><Minus size={14}/></button>
                          <span className="text-sm font-bold w-6 text-center text-[var(--primary)]">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="p-1 px-2 text-[var(--text-primary)]"><Plus size={14}/></button>
                        </div>
                        <button onClick={() => removeItem(item.product._id)} className="text-xs text-[var(--error)] font-bold">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-[var(--border)] bg-[var(--surface-2)]">
                <div className="flex items-end justify-between font-bold mb-6 text-[var(--primary)]">
                  <span className="text-[var(--text-secondary)] text-sm uppercase tracking-wider">Subtotal</span>
                  <span className="font-serif text-3xl">${cartTotal()}</span>
                </div>
                <button 
                  onClick={() => { setIsCartOpen(false); navigate('/checkout'); }} 
                  className="w-full bg-[var(--primary)] text-white font-bold tracking-wide py-4 rounded-xl active:scale-95 transition-all text-base"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
