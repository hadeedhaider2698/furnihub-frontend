import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { Button } from '../../components/ui/Button.jsx';

export default function CartPage() {
  const { items, updateQuantity, removeItem, cartTotal } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-serif text-primary mb-4">Your Cart</h1>
        <p className="text-text-secondary mb-8">Please login to view your cart.</p>
        <Button onClick={() => navigate('/auth/login')}>Log In</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-serif text-primary mb-4">Your Cart</h1>
        <p className="text-text-secondary mb-8">Your cart is empty.</p>
        <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">
      <Helmet><title>Shopping Cart | FurniHub</title></Helmet>
      
      <h1 className="text-4xl font-serif font-bold text-primary mb-10">Your Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3">
          <ul className="divide-y divide-border border-t border-border">
            {items.map((item, idx) => (
              <li key={`${item.product._id}-${item.color || idx}`} className="py-8 flex sm:flex-row flex-col gap-6">
                <div className="sm:h-40 sm:w-40 h-full w-full aspect-square flex-shrink-0 rounded-lg border border-border overflow-hidden bg-surface-2 bg-center">
                  <img 
                    src={item.product.images[0]?.url} 
                    alt={item.product.title}
                    className="h-full w-full object-cover object-center mix-blend-multiply"
                  />
                </div>
                
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xl font-serif font-semibold text-primary hover:text-accent">
                        <Link to={`/products/${item.product.slug}`}>{item.product.title}</Link>
                      </h3>
                      {item.color && <p className="mt-1 text-sm text-text-secondary">Color: {item.color}</p>}
                    </div>
                    <p className="text-lg font-medium text-primary">${(item.product.discountPrice || item.product.price)}</p>
                  </div>
                  
                  <div className="mt-auto flex items-end justify-between pt-6">
                    <div className="flex items-center border border-border rounded-full h-10 px-3 bg-surface-2">
                      <button 
                        onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1), item.color)}
                        className="text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
                      ><Minus size={16} /></button>
                      <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product._id, Math.min(item.product.stock, item.quantity + 1), item.color)}
                        className="text-text-secondary hover:text-primary transition-colors"
                      ><Plus size={16} /></button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.product._id)}
                      className="text-text-secondary hover:text-error transition-colors flex items-center text-sm font-medium"
                    >
                      <Trash2 size={16} className="mr-1" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="lg:w-1/3">
          <div className="bg-surface-2 border border-border rounded-xl p-8 sticky top-28 shadow-warm">
            <h2 className="text-2xl font-serif font-bold text-primary mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6 border-b border-border pb-6">
              <div className="flex justify-between text-text-secondary">
                <p>Subtotal</p>
                <p className="font-medium text-primary">${cartTotal()}</p>
              </div>
              <div className="flex justify-between text-text-secondary">
                <p>Shipping estimate</p>
                <p className="font-medium text-primary">Calculated at checkout</p>
              </div>
              <div className="flex justify-between text-text-secondary">
                <p>Tax estimate</p>
                <p className="font-medium text-primary">Calculated at checkout</p>
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <p className="text-lg font-medium text-primary">Estimated Total</p>
              <p className="text-3xl font-serif font-bold text-primary">${cartTotal()}</p>
            </div>
            
            <Button onClick={() => navigate('/checkout')} className="w-full h-14 text-lg">
              Proceed to Checkout <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
