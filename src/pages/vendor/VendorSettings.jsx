import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Store, MapPin, Phone, Mail, Globe, Instagram, Facebook, Loader2, Save
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import FileUpload from '../../components/ui/FileUpload.jsx';

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
    address: { street: '', city: '', state: '', country: '', zipCode: '' },
    socialLinks: { website: '', instagram: '', facebook: '' }
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['vendorProfile', user?.id],
    queryFn: async () => {
      // Fetch vendor profile using the user's vendorId or by userId
      if (user?.vendorId) {
        const res = await api.get(`/vendor/${user.vendorId}`);
        return res.data.data.vendor;
      }
      // Fallback: get own vendor profile
      const res = await api.get('/vendor/dashboard/stats');
      return res.data.data.vendor;
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
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (url) => setFormData(prev => ({ ...prev, shopLogo: url || '' }));
  const handleBannerChange = (url) => setFormData(prev => ({ ...prev, shopBanner: url || '' }));

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    // Clean data before sending
    const { _id, userId, createdAt, updatedAt, __v, stripeAccountId, rating, totalReviews, totalSales, isApproved, ...cleanData } = formData;
    
    updateMutation.mutate(cleanData);
  };

  if (isLoading) return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin text-[var(--primary)]" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8 pb-32">
      {/* Header */}
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
          <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm space-y-8">
            <h3 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
              <Store size={16} /> Shop Visuals
            </h3>

            {/* Logo upload */}
            <div>
              <FileUpload
                value={formData.shopLogo}
                onChange={handleLogoChange}
                folder="furnihub/logos"
                multiple={false}
                accept="image/*"
                label="Shop Logo"
                preview="round"
              />
            </div>

            {/* Banner upload */}
            <div>
              <FileUpload
                value={formData.shopBanner}
                onChange={handleBannerChange}
                folder="furnihub/banners"
                multiple={false}
                accept="image/*"
                label="Shop Banner"
                preview="banner"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
            <h3 className="text-sm font-bold text-[var(--primary)] mb-6 flex items-center gap-2">
              <Store size={16} /> General Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase pl-1 mb-1">Shop Name</label>
                <input
                  type="text" name="shopName" value={formData.shopName} onChange={handleChange}
                  className="w-full bg-[var(--surface-2)] text-sm rounded-xl py-3 px-4 border border-[var(--border)] focus:ring-1 focus:ring-[var(--primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase pl-1 mb-1">Description</label>
                <textarea
                  name="description" value={formData.description} onChange={handleChange} rows={4}
                  className="w-full bg-[var(--surface-2)] text-sm rounded-xl py-3 px-4 border border-[var(--border)] focus:ring-1 focus:ring-[var(--primary)] outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
            <h3 className="text-sm font-bold text-[var(--primary)] mb-6 flex items-center gap-2">
              <MapPin size={16} /> Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Street', name: 'address.street' },
                { label: 'City', name: 'address.city' },
                { label: 'State', name: 'address.state' },
                { label: 'Country', name: 'address.country' },
                { label: 'ZIP Code', name: 'address.zipCode' },
              ].map(({ label, name }) => {
                const [parent, child] = name.split('.');
                return (
                  <div key={name}>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase pl-1 mb-1">{label}</label>
                    <input
                      type="text" name={name} value={formData[parent][child]} onChange={handleChange}
                      className="w-full bg-[var(--surface-2)] text-sm rounded-xl py-2.5 px-4 border border-[var(--border)] outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact & Social */}
          <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
            <h3 className="text-sm font-bold text-[var(--primary)] mb-6">Contact & Social</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-xs font-bold text-[var(--text-secondary)] uppercase pl-1 mb-1 gap-1"><Mail size={11} /> Contact Email</label>
                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full bg-[var(--surface-2)] text-sm rounded-xl py-2.5 px-4 border border-[var(--border)]" />
              </div>
              <div>
                <label className="flex items-center text-xs font-bold text-[var(--text-secondary)] uppercase pl-1 mb-1 gap-1"><Phone size={11} /> Contact Phone</label>
                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full bg-[var(--surface-2)] text-sm rounded-xl py-2.5 px-4 border border-[var(--border)]" />
              </div>
              <div>
                <label className="flex items-center text-xs font-bold text-[var(--text-secondary)] uppercase pl-1 mb-1 gap-1"><Globe size={11} /> Website</label>
                <input type="text" name="socialLinks.website" value={formData.socialLinks.website} onChange={handleChange} className="w-full bg-[var(--surface-2)] text-sm rounded-xl py-2.5 px-4 border border-[var(--border)]" />
              </div>
              <div>
                <label className="flex items-center text-xs font-bold text-[var(--text-secondary)] uppercase pl-1 mb-1 gap-1"><Instagram size={11} /> Instagram</label>
                <input type="text" name="socialLinks.instagram" value={formData.socialLinks.instagram} onChange={handleChange} className="w-full bg-[var(--surface-2)] text-sm rounded-xl py-2.5 px-4 border border-[var(--border)]" />
              </div>
              <div>
                <label className="flex items-center text-xs font-bold text-[var(--text-secondary)] uppercase pl-1 mb-1 gap-1"><Facebook size={11} /> Facebook</label>
                <input type="text" name="socialLinks.facebook" value={formData.socialLinks.facebook} onChange={handleChange} className="w-full bg-[var(--surface-2)] text-sm rounded-xl py-2.5 px-4 border border-[var(--border)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
