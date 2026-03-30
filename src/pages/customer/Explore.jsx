import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api.js';

const fetchExploreProducts = async (searchTerm, category) => {
  let url = '/products?limit=30';
  if (searchTerm) url += `&keyword=${searchTerm}`;
  if (category) url += `&category=${category}`;
  const res = await api.get(url);
  return res.data.data.products;
};

const categories = ['All', 'Sofa', 'Bed', 'Chair', 'Dining Table', 'Outdoor', 'Lighting'];

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['explore', debouncedTerm, selectedCat],
    queryFn: () => fetchExploreProducts(debouncedTerm, selectedCat === 'All' ? '' : selectedCat.toLowerCase())
  });

  return (
    <div className="bg-[var(--surface-2)] min-h-screen">
      <Helmet><title>Explore | FurniHub</title></Helmet>

      {/* Sticky Search Bar */}
      <div className="sticky top-14 z-40 bg-[var(--surface-2)] px-4 py-3 border-b border-[var(--border)] lg:max-w-[600px] lg:mx-auto lg:border-x lg:top-14">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder="Search furniture..." 
            className="w-full bg-[var(--surface)] text-[var(--text-primary)] rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Horizontal Category Pills */}
      <div className="px-2 py-3 border-b border-[var(--border)] overflow-x-auto no-scrollbar bg-[var(--surface-2)] lg:max-w-[600px] lg:mx-auto lg:border-x">
        <div className="flex space-x-2 w-max px-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectedCat === cat 
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)]' 
                  : 'bg-white text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--surface)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="p-1 pb-20 lg:max-w-[600px] lg:mx-auto lg:px-0">
        {isLoading ? (
          <div className="text-center py-20 text-[var(--text-secondary)]">Loading inspiration...</div>
        ) : products?.length > 0 ? (
          <div className="grid grid-cols-3 gap-[2px]">
            {products.map((product, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: Math.min((idx % 15) * 0.05, 0.3) }}
                key={product._id} 
                className="relative aspect-square cursor-pointer overflow-hidden bg-[var(--surface)]"
              >
                <Link to={`/products/${product.slug}`}>
                  <img 
                    src={product.images?.[0]?.url || 'https://placehold.co/300'} 
                    alt={product.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-[var(--text-secondary)]">
            No products found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
