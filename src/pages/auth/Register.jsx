import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Store, ChevronRight, ChevronLeft, 
  User, Check, ArrowRight, Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import api from '../../services/api.js';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

const vendorSchema = z.object({
  name: z.string().min(2, 'Your name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  shopName: z.string().min(2, 'Shop name is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

export default function Register() {
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=role select, 2=form
  const [role, setRole] = useState(null); // 'customer' | 'vendor'

  const isVendor = role === 'vendor';
  const schema = isVendor ? vendorSchema : customerSchema;

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const selectRole = (r) => {
    setRole(r);
    reset();
    setStep(2);
  };

  const onSubmit = async (data) => {
    try {
      // 1. Register the user account
      await registerUser({ 
        name: data.name, 
        email: data.email, 
        password: data.password,
        role: role,
      });

      // 2. If vendor, register vendor profile
      if (isVendor) {
        try {
          await api.post('/vendor/register', {
            shopName: data.shopName,
            contactEmail: data.email,
            isApproved: true,
            address: { city: data.city, country: data.country },
          });
        } catch (vendorErr) {
          console.warn('Vendor profile creation issue:', vendorErr.message);
          // Non-blocking — user is created, vendor profile can be set up later
        }
      }

      toast.success(
        isVendor
          ? '🏪 Vendor account created! Welcome to FurniHub.'
          : '🎉 Account created! Welcome to FurniHub.'
      );
      navigate(isVendor ? '/vendor/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <Helmet><title>Create Account | FurniHub</title></Helmet>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-rose-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className={`flex items-center gap-1.5 text-xs font-bold transition-all ${step >= s ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${step > s ? 'bg-[var(--primary)] border-[var(--primary)] text-white' : step === s ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}>
                {step > s ? <Check size={14} /> : s}
              </div>
              <span className="hidden sm:block">{s === 1 ? 'Choose Role' : 'Your Details'}</span>
              {s < 2 && <ChevronRight size={14} className="opacity-40" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1 — Role Selection */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
                  <Sparkles size={12} />
                  Join FurniHub
                </div>
                <h1 className="text-3xl font-serif font-bold text-[var(--primary)] mb-2">Create your account</h1>
                <p className="text-[var(--text-secondary)]">How would you like to use FurniHub?</p>
              </div>

              <div className="grid gap-4">
                {/* Customer Card */}
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => selectRole('customer')}
                  className="group relative w-full bg-[var(--surface)] border-2 border-[var(--border)] hover:border-[var(--primary)] rounded-2xl p-6 text-left transition-all shadow-sm hover:shadow-md overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <ShoppingBag size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-[var(--primary)]">Shop as Customer</h3>
                        <ArrowRight size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">Browse thousands of premium furniture pieces, save favourites, and place orders.</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {['Browse & Shop', 'Save Wishlist', 'Track Orders'].map(f => (
                          <span key={f} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* Vendor Card */}
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => selectRole('vendor')}
                  className="group relative w-full bg-[var(--surface)] border-2 border-[var(--border)] hover:border-amber-500 rounded-2xl p-6 text-left transition-all shadow-sm hover:shadow-md overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Store size={24} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-[var(--primary)]">Sell as Vendor</h3>
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wide">Earn Money</span>
                        </div>
                        <ArrowRight size={18} className="text-[var(--text-secondary)] group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">Create your own store, list products, and reach thousands of furniture lovers.</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {['Open a Store', 'List Products', 'Manage Orders'].map(f => (
                          <span key={f} className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              </div>

              <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
                Already have an account?{' '}
                <Link to="/auth/login" className="font-bold text-[var(--accent)] hover:underline">Log in</Link>
              </p>
            </motion.div>
          )}

          {/* STEP 2 — Form */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(1)} className="p-2 hover:bg-[var(--surface-2)] rounded-full transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isVendor ? 'bg-amber-100' : 'bg-blue-100'}`}>
                    {isVendor ? <Store size={20} className="text-amber-600" /> : <User size={20} className="text-blue-600" />}
                  </div>
                  <div>
                    <h2 className="font-bold text-[var(--primary)]">{isVendor ? 'Vendor Account' : 'Customer Account'}</h2>
                    <p className="text-xs text-[var(--text-secondary)]">{isVendor ? 'Set up your store' : 'Create your account'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Personal Info */}
                  {isVendor && (
                    <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest pb-1 border-b border-[var(--border)] mb-2">
                      Personal Information
                    </div>
                  )}
                  <Input label="Full Name" {...register('name')} error={errors.name?.message} />
                  <Input label="Email address" type="email" {...register('email')} error={errors.email?.message} />
                  <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
                  <Input label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />

                  {/* Vendor-only fields */}
                  {isVendor && (
                    <>
                      <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest pb-1 border-b border-[var(--border)] mt-4 mb-2">
                        Store Information
                      </div>
                      <Input label="Shop Name" placeholder="e.g. Luxe Living Furniture" {...register('shopName')} error={errors.shopName?.message} />
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="City" placeholder="e.g. Lahore" {...register('city')} error={errors.city?.message} />
                        <Input label="Country" placeholder="e.g. Pakistan" {...register('country')} error={errors.country?.message} />
                      </div>
                    </>
                  )}

                  <Button
                    type="submit"
                    className={`w-full mt-2 ${isVendor ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                    isLoading={isLoading}
                  >
                    {isVendor ? '🏪 Create Vendor Account' : '🎉 Create Account'}
                  </Button>
                </form>
              </div>

              <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
                Already have an account?{' '}
                <Link to="/auth/login" className="font-bold text-[var(--accent)] hover:underline">Log in</Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
