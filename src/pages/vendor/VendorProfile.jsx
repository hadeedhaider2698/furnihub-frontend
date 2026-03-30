import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, MoreVertical, Grid3X3, PlaySquare, MapPin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';

const fetchVendorProducts = async (id) => {
  const res = await api.get(`/products?vendor=${id}&limit=30`);
  return res.data.data.products;
};

export default function VendorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');

  const { data: products = [] } = useQuery({
    queryKey: ['vendorProducts', id],
    queryFn: () => fetchVendorProducts(id),
  });

  return (
    <div className="bg-[var(--surface-2)] min-h-screen pb-20 lg:max-w-[600px] lg:mx-auto lg:border-x border-[var(--border)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--surface-2)]/90 backdrop-blur flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <button onClick={() => navigate(-1)} className="p-1"><ChevronLeft size={28} /></button>
        <div className="font-bold text-[var(--primary)] flex items-center">
          STOREFRONT
        </div>
        <button className="p-1"><MoreVertical size={24} /></button>
      </div>

      {/* Profile Info */}
      <div className="px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-20 h-20 rounded-full border justify-center border-[var(--border)] overflow-hidden bg-[var(--surface)]">
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${id}`} alt="Shop" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 flex justify-around px-6 text-center">
            <div><p className="font-bold text-lg text-[var(--primary)]">{products.length}</p><p className="text-xs text-[var(--text-secondary)]">Posts</p></div>
            <div><p className="font-bold text-lg text-[var(--primary)]">1.2k</p><p className="text-xs text-[var(--text-secondary)]">Sales</p></div>
            <div><p className="font-bold text-lg text-[var(--primary)]">4.8</p><p className="text-xs text-[var(--text-secondary)]">Rating</p></div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <h1 className="font-bold text-[var(--primary)] text-sm">Luxe Furniture Co.</h1>
          <p className="text-sm text-[var(--text-primary)] mt-1 whitespace-pre-wrap">
            Curating spaces that inspire. Premium modern and minimalist furniture for the contemporary home.
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center"><MapPin size={14} className="mr-1"/> Lahore, PK</p>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button className="flex-1 bg-[var(--primary)] text-white font-semibold py-1.5 rounded-lg text-sm bg-opacity-90">Follow</button>
          <button className="flex-1 bg-[var(--surface)] text-[var(--primary)] border border-[var(--border)] font-semibold py-1.5 rounded-lg text-sm">Message</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-t border-[var(--border)] relative">
        <button onClick={() => setActiveTab('products')} className={`flex-1 flex justify-center py-3 transition ${activeTab === 'products' ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-gray-400'}`}>
          <Grid3X3 size={24} strokeWidth={activeTab === 'products' ? 2 : 1.5} />
        </button>
        <button onClick={() => setActiveTab('reels')} className={`flex-1 flex justify-center py-3 transition ${activeTab === 'reels' ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-gray-400'}`}>
          <PlaySquare size={24} strokeWidth={activeTab === 'reels' ? 2 : 1.5} />
        </button>
        <button onClick={() => setActiveTab('reviews')} className={`flex-1 flex justify-center py-3 transition ${activeTab === 'reviews' ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-gray-400'}`}>
          <MessageCircle size={24} strokeWidth={activeTab === 'reviews' ? 2 : 1.5} />
        </button>
        <div className={`absolute bottom-0 h-[1px] bg-[var(--primary)] transition-all duration-300 w-1/3 ${activeTab === 'products' ? 'left-0' : activeTab === 'reels' ? 'left-1/3' : 'left-2/3'}`} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-[2px]">
        {products.map((prod, idx) => (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} key={prod._id} className="aspect-square bg-[var(--surface)]">
            <Link to={`/products/${prod.slug}`}>
              <img src={prod.images?.[0]?.url || 'https://placehold.co/300'} alt={prod.title} className="w-full h-full object-cover" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
