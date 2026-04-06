import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Camera, Loader2, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import FileUpload from '../../components/ui/FileUpload.jsx';

export default function EditProfile() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    website: user?.website || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch('/auth/update-me', data),
    onSuccess: (res) => {
      setUser(res.data.data.user);
      queryClient.invalidateQueries(['user']);
      toast.success('Profile updated successfully!');
      navigate('/profile');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!user) return null;

  return (
    <div className="bg-[var(--surface-2)] min-h-screen pb-20 lg:max-w-[800px] lg:mx-auto lg:border-x border-[var(--border)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--surface-2)]/90 backdrop-blur-md flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-[var(--surface)] rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <span className="font-bold text-lg text-[var(--primary)] uppercase tracking-tight">Edit Profile</span>
        <button 
          onClick={handleSubmit} 
          disabled={updateMutation.isPending}
          className="text-blue-600 font-bold text-sm hover:underline disabled:opacity-50"
        >
          {updateMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : 'Done'}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-8"
      >
        <div className="flex flex-col items-center mb-10 px-6">
          <FileUpload 
            label="Profile Picture"
            value={formData.avatar}
            onChange={(url) => setFormData(prev => ({ ...prev, avatar: url }))}
            folder="furnihub/avatars"
            preview="round"
          />
          <p className="mt-2 text-[10px] text-[var(--text-secondary)] text-center max-w-[250px]">
            Square images work best. Max 5MB.
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[var(--surface)] text-[var(--primary)] text-sm rounded-xl py-3 px-4 border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full bg-[var(--surface)] text-[var(--primary)] text-sm rounded-xl py-3 px-4 border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all transition-all resize-none"
              />
              <p className="text-[10px] text-[var(--text-secondary)] px-1 mt-1">Maximum 160 characters.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-1">Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourpage.com"
                className="w-full bg-[var(--surface)] text-[var(--primary)] text-sm rounded-xl py-3 px-4 border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            <div className="pt-4 border-t border-[var(--border)]/50">
              <h3 className="text-sm font-bold text-[var(--primary)] mb-4 px-1">Private Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[var(--surface)] text-[var(--primary)] text-sm rounded-xl py-3 px-4 border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 890"
                    className="w-full bg-[var(--surface)] text-[var(--primary)] text-sm rounded-xl py-3 px-4 border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-[var(--text-secondary)] text-center px-8 leading-relaxed">
            Your personal information is kept private. We only use this for notifications and security purposes.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
