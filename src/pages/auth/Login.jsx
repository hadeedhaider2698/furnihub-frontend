import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      const res = await login(data.email, data.password);
      toast.success('Welcome back!');
      // Role-based redirect
      const role = res?.data?.user?.role;
      if (role === 'vendor') navigate('/vendor/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <Helmet><title>Log In | FurniHub</title></Helmet>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-rose-100 rounded-full blur-3xl opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <Sparkles size={12} />
            FurniHub
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--primary)] mb-2">Welcome back</h1>
          <p className="text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <Link to="/auth/register" className="font-bold text-[var(--accent)] hover:underline">Sign up</Link>
          </p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input 
              label="Email address" 
              type="email" 
              autoComplete="email" 
              {...register('email')} 
              error={errors.email?.message} 
            />
            <Input 
              label="Password" 
              type="password" 
              autoComplete="current-password" 
              {...register('password')} 
              error={errors.password?.message} 
            />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)]">
                <input type="checkbox" className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]" />
                Remember me
              </label>
              <Link to="/auth/forgot-password" className="font-bold text-[var(--accent)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>Sign In</Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
