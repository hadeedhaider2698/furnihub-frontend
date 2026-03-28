import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../../store/authStore.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function Register() {
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
      toast.success('Registration successful! Please check your email to verify.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Helmet><title>Create Account | FurniHub</title></Helmet>
      <div className="max-w-md w-full space-y-8 bg-surface-2 p-8 rounded-xl shadow-warm border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-serif font-bold text-primary">Create an account</h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Already have an account? <Link to="/auth/login" className="font-medium text-accent hover:text-accent-2 transition-colors">Log in</Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input label="Full Name" {...register('name')} error={errors.name?.message} />
            <Input label="Email address" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
            <Input label="Confirm Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
          </div>
          <Button type="submit" className="w-full" isLoading={isLoading}>Sign Up</Button>
        </form>
      </div>
    </div>
  );
}
