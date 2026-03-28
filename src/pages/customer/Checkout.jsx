import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore } from '../../store/cartStore.js';
import api from '../../services/api.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Loader } from '../../components/ui/Loader.jsx';

// Initialize stripe (using a dummy key for UI rendering purposes if env var missing)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUB_KEY || 'pk_test_dummy');

const CheckoutForm = ({ shippingAddress, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { clearCart } = useCartStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      // 1. Create order and get client secret from backend
      const { data } = await api.post('/orders/checkout', {
        shippingAddress
      });

      const clientSecret = data.data.clientSecret;
      
      if (!clientSecret) {
        // If Stripe isn't fully configured in backend, simulate success for test mode
        toast.success('Order placed successfully (Test Mode)');
        await clearCart();
        onSuccess();
        return;
      }

      // 2. Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          toast.success('Payment successful! Order placed.');
          await clearCart();
          onSuccess();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-border rounded-md bg-surface">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#1A1A2E',
              '::placeholder': { color: '#888888' },
            },
            invalid: { color: '#D9534F' },
          },
        }} />
      </div>
      <Button type="submit" className="w-full" disabled={!stripe || isProcessing} isLoading={isProcessing}>
        Pay Now
      </Button>
    </form>
  );
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, cartTotal } = useCartStore();
  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const onAddressSubmit = (data) => {
    setShippingAddress(data);
    setStep(2);
  };

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">
      <Helmet><title>Checkout | FurniHub</title></Helmet>
      
      <h1 className="text-4xl font-serif font-bold text-primary mb-10 text-center">Checkout</h1>

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex-1">
          {step === 1 ? (
            <div className="bg-surface-2 p-8 rounded-xl border border-border shadow-warm">
              <h2 className="text-2xl font-serif font-bold text-primary mb-6">Shipping Address</h2>
              <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                <Input label="Street Address" {...register('address', { required: 'Address is required' })} error={errors.address?.message} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" {...register('city', { required: 'City is required' })} error={errors.city?.message} />
                  <Input label="State" {...register('state', { required: 'State is required' })} error={errors.state?.message} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Postal Code" {...register('postalCode', { required: 'Postal Code required' })} error={errors.postalCode?.message} />
                  <Input label="Country" {...register('country', { required: 'Country required' })} error={errors.country?.message} />
                </div>
                <Button type="submit" className="w-full mt-6">Continue to Payment</Button>
              </form>
            </div>
          ) : (
            <div className="bg-surface-2 p-8 rounded-xl border border-border shadow-warm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-primary">Payment</h2>
                <button onClick={() => setStep(1)} className="text-sm text-accent hover:underline">Edit shipping</button>
              </div>
              <Elements stripe={stripePromise}>
                <CheckoutForm shippingAddress={shippingAddress} onSuccess={() => navigate('/orders')} />
              </Elements>
            </div>
          )}
        </div>

        <div className="md:w-1/3">
          <div className="bg-surface border border-border rounded-xl p-6 sticky top-28">
            <h3 className="font-serif font-bold text-lg text-primary mb-4">Order Summary</h3>
            <ul className="space-y-4 mb-6">
              {items.map((item, idx) => (
                <li key={idx} className="flex gap-4 text-sm">
                  <div className="h-16 w-16 bg-surface-2 border border-border rounded overflow-hidden">
                    <img src={item.product.images[0]?.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary line-clamp-2">{item.product.title}</p>
                    <p className="text-text-secondary mt-1">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-primary">${(item.product.discountPrice || item.product.price) * item.quantity}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-2 text-sm text-text-secondary border-t border-border pt-4 mb-4">
              <div className="flex justify-between"><p>Subtotal</p><p>${cartTotal()}</p></div>
              <div className="flex justify-between"><p>Shipping</p><p>Free</p></div>
            </div>
            <div className="flex justify-between items-end border-t border-border pt-4">
              <p className="text-lg font-medium text-primary">Total</p>
              <p className="text-2xl font-serif font-bold text-primary">${cartTotal()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
