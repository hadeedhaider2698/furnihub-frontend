import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
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
      await login(data.email, data.password);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Helmet><title>Log In | FurniHub</title></Helmet>
      <div className="max-w-md w-full space-y-8 bg-surface-2 p-8 rounded-xl shadow-warm border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-serif font-bold text-primary">Welcome back</h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Or <Link to="/auth/register" className="font-medium text-accent hover:text-accent-2 transition-colors">create a new account</Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-border rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">Remember me</label>
            </div>
            <div className="text-sm">
              <Link to="/auth/forgot-password" className="font-medium text-accent hover:text-accent-2 transition-colors">Forgot your password?</Link>
            </div>
          </div>
          <Button type="submit" className="w-full" isLoading={isLoading}>Sign In</Button>
        </form>
      </div>
    </div>
  );
}
