import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Edit2, Trash2, Plus, Search, Filter, ExternalLink, Package, MoreVertical, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../../services/api.js';
import { FullPageLoader } from '../../components/ui/Loader.jsx';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const fetchVendorProducts = async () => {
  const res = await api.get('/vendor/dashboard/products');
  return res.data.data.products;
};

export default function VendorProducts() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['vendorProducts'],
    queryFn: fetchVendorProducts
  });

  const products = data || [];

  const toggleStatusMutation = useMutation({
    mutationFn: (id) => api.patch(`/products/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendorProducts']);
      toast.success('Product status updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendorProducts']);
      toast.success('Product deleted successfully');
    }
  });

  if (isLoading) return <FullPageLoader />;

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || p.category === filterCategory)
  );

  const categories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-8 pb-20">
      <Helmet><title>My Products | FurniHub Vendor</title></Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--primary)] tracking-tight">Product Inventory</h1>
          <p className="text-[var(--text-secondary)] text-sm font-medium">Manage and monitor your listing performance.</p>
        </div>
        <Link to="/vendor/products/new" className="flex items-center justify-center gap-2 bg-[var(--primary)] text-white px-6 py-3 rounded-2xl text-sm font-black shadow-warm active:scale-95 transition-transform">
           <Plus size={18} /> New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--surface)] p-4 rounded-3xl border border-[var(--border)] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--surface-2)] border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-[var(--text-secondary)]" />
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 md:flex-none bg-[var(--surface-2)] border-none rounded-2xl py-3 px-4 text-sm font-bold text-[var(--primary)] outline-none cursor-pointer capitalize"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--surface-2)] text-[var(--text-secondary)] uppercase text-[10px] tracking-widest font-black border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-5">Product</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Price</th>
                <th className="px-6 py-5">Stock</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                <motion.tr 
                  layout
                  key={product._id} 
                  className="hover:bg-[var(--surface-2)]/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[var(--surface-2)] flex-shrink-0 border border-[var(--border)]">
                        <img 
                          src={product.images[0]?.url || 'https://via.placeholder.com/100'} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          alt={product.title} 
                        />
                      </div>
                      <div className="max-w-[200px]">
                        <p className="font-bold text-[var(--primary)] truncate">{product.title}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] font-medium">SKU: {product._id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize font-medium text-[var(--text-secondary)]">{product.category.replace('-', ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-black text-[var(--primary)]">
                       ${product.discountPrice || product.price}
                       {product.discountPrice && <span className="ml-2 text-[10px] text-[var(--text-secondary)] line-through">${product.price}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                       <span className="font-bold">{product.stock} units</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                       onClick={() => toggleStatusMutation.mutate(product._id)}
                       disabled={toggleStatusMutation.isLoading}
                       className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                         product.isActive 
                           ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' 
                           : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                       }`}
                    >
                       {product.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 grayscale group-hover:grayscale-0 transition-all">
                      <Link to={`/products/${product.slug}`} target="_blank" className="p-2 hover:bg-[var(--surface-2)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                        <ExternalLink size={16} />
                      </Link>
                      <Link to={`/vendor/products/edit/${product._id}`} className="p-2 hover:bg-blue-50 rounded-xl text-[var(--text-secondary)] hover:text-blue-600 transition-colors">
                        <Edit2 size={16} />
                      </Link>
                      <button 
                         onClick={() => window.confirm('Are you sure?') && deleteMutation.mutate(product._id)}
                         className="p-2 hover:bg-red-50 rounded-xl text-[var(--text-secondary)] hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <div className="p-4 bg-[var(--surface-2)] rounded-full text-[var(--text-secondary)]">
                          <Package size={40} strokeWidth={1} />
                       </div>
                       <p className="text-[var(--text-secondary)] font-medium">No products found matches your criteria.</p>
                       <Link to="/vendor/products/new" className="text-[var(--primary)] font-bold text-sm hover:underline">Create your first product</Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
