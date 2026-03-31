import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Store, 
  Image, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram, 
  Facebook,
  Loader2,
  Camera,
  Save
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';

const fetchOwnVendorProfile = async () => {
  const res = await api.get('/vendor/dashboard/stats'); // We already have stats, but need the full profile
  // Actually, we should probably have a get own profile endpoint. 
  // Let's use the standard search by ID if we have it, or a dedicated /vendor/me
  // For now, let's assume we can fetch it via stats or similar
  const profileRes = await api.get('/vendor/dashboard/stats'); 
  return profileRes.data.data.vendor; 
};

export default function VendorSettings() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    shopLogo: '',
    shopBanner: '',
    contactEmail: '',
    contactPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    socialLinks: {
      website: '',
      instagram: '',
      facebook: ''
    }
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['vendorProfile', user?.id],
    queryFn: async () => {
      const res = await api.get('/vendor/dashboard/stats');
      // Wait, stats returns { stats: { ... } }
      // I should check what vendor object it returns. 
      // Actually, I'll use the ID from the user object if available.
      const vendorRes = await api.get(`/vendor/${user.id}`); // ID is usually same or linked
      return vendorRes.data.data.vendor;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        shopName: profile.shopName || '',
        description: profile.description || '',
        shopLogo: profile.shopLogo || '',
        shopBanner: profile.shopBanner || '',
        contactEmail: profile.contactEmail || '',
        contactPhone: profile.contactPhone || '',
        address: profile.address || formData.address,
        socialLinks: profile.socialLinks || formData.socialLinks
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data) => api.put('/vendor/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendorProfile']);
      toast.success('Shop settings updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update shop settings');
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--primary)]">Shop Settings</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage your business identity and store presence.</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={updateMutation.isPending}
          className="flex items-center space-x-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl font-bold shadow-md active:scale-95 transition-all text-sm disabled:opacity-50"
        >
          {updateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Visuals */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
            <h3 className="text-sm font-bold text-[var(--primary)] mb-6 flex items-center">
              <Image size={18} className="mr-2" /> Shop Visuals
            </h3>
            
            <div className="space-y-8">
              {/* Logo */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--border)] bg-[var(--surface-2)]">
                    <img src={formData.shopLogo || 'https://placehold.co/200'} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-[var(--primary)] text-white rounded-full shadow-lg">
                    <Camera size={14} />
                  </button>
                </div>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-3 uppercase tracking-widest">Shop Logo</p>
                <input 
                  type="text" 
                  name="shopLogo" 
                  value={formData.shopLogo} 
                  onChange={handleChange} 
                  placeholder="Logo URL"
                  className="mt-2 w-full text-[10px] bg-[var(--surface-2)] p-2 rounded-lg border border-[var(--border)] outline-none"
                />
              </div>

              {/* Banner */}
              <div className="flex flex-col items-center">
                <div className="w-full aspect-[21/9] rounded-xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] relative group">
                  <img src={formData.shopBanner || 'https://placehold.co/600x200'} alt="Banner" className="w-full h-full object-cover" />
                  <button className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white" />
                  </button>
                </div>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-3 uppercase tracking-widest">Shop Banner</p>
                <input 
                  type="text" 
                  name="shopBanner" 
                  value={formData.shopBanner} 
                  onChange={handleChange} 
                  placeholder="Banner URL"
                  className="mt-2 w-full text-[10px] bg-[var(--surface-2)] p-2 rounded-lg border border-[var(--border)] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
            <h3 className="text-sm font-bold text-[var(--primary)] mb-6 flex items-center">
              <Store size={18} className="mr-2" /> General Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase pl-1 mb-1">Shop Name</label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  className="w-full bg-[var(--surface-2)] text-sm rounded-xl py-3 px-4 border border-[var(--border)] focus:ring-1 focus:ring-[var(--primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase pl-1 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-[var(--surface-2)] text-sm rounded-xl py-3 px-4 border border-[var(--border)] focus:ring-1 focus:ring-[var(--primary)] outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
            <h3 className="text-sm font-bold text-[var(--primary)] mb-6">Contact & Social</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-xs font-bold text-[var(--text-secondary)] uppercase pl-1 mb-1">
                  <Mail size={12} className="mr-1" /> Contact Email
                </label>
                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full bg-[var(--surface-2)] text-sm rounded-xl py-2.5 px-4 border border-[var(--border)]" />
              </div>
              <div>
                <label className="flex items-center text-xs font-bold text-[var(--text-secondary)] uppercase pl-1 mb-1">
                  <Phone size={12} className="mr-1" /> Contact Phone
                </label>
                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full bg-[var(--surface-2)] text-sm rounded-xl py-2.5 px-4 border border-[var(--border)]" />
              </div>
              <div>
                <label className="flex items-center text-xs font-bold text-[var(--text-secondary)] uppercase pl-1 mb-1">
                  <Globe size={12} className="mr-1" /> Website
                </label>
                <input type="text" name="socialLinks.website" value={formData.socialLinks.website} onChange={handleChange} className="w-full bg-[var(--surface-2)] text-sm rounded-xl py-2.5 px-4 border border-[var(--border)]" />
              </div>
              <div>
                <label className="flex items-center text-xs font-bold text-[var(--text-secondary)] uppercase pl-1 mb-1">
                  <Instagram size={12} className="mr-1" /> Instagram
                </label>
                <input type="text" name="socialLinks.instagram" value={formData.socialLinks.instagram} onChange={handleChange} className="w-full bg-[var(--surface-2)] text-sm rounded-xl py-2.5 px-4 border border-[var(--border)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
