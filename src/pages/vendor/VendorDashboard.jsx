import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { DollarSign, Package, ShoppingCart, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { FullPageLoader } from '../../components/ui/Loader.jsx';
import { motion } from 'framer-motion';

const fetchVendorStats = async () => {
  const res = await api.get('/vendors/stats');
  return res.data.data.stats;
};

export default function VendorDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['vendorStats'],
    queryFn: fetchVendorStats
  });

  if (isLoading) return <FullPageLoader />;

  return (
    <div className="lg:pr-8">
      <Helmet><title>Vendor Portal | FurniHub</title></Helmet>
      
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-sans font-bold text-[var(--primary)]">Store Overview</h1>
          <p className="text-[var(--text-secondary)] mt-1">Professional business analytics for your boutique.</p>
        </div>
        <Link to="/vendor/products/new" className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center shadow-md active:scale-95 transition">
          <Plus size={18} className="mr-2" /> Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Gross Revenue</p>
            <div className="p-2 bg-green-50 rounded-md text-green-600"><DollarSign size={18} /></div>
          </div>
          <p className="text-3xl font-serif text-[var(--primary)]">${stats?.totalRevenue || 0}</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
           <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Orders</p>
            <div className="p-2 bg-blue-50 rounded-md text-blue-600"><ShoppingCart size={18} /></div>
          </div>
          <p className="text-3xl font-serif text-[var(--primary)]">{stats?.totalOrders || 0}</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
           <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Units Sold</p>
            <div className="p-2 bg-amber-50 rounded-md text-amber-600"><Package size={18} /></div>
          </div>
          <p className="text-3xl font-serif text-[var(--primary)]">{stats?.totalProductsSold || 0}</p>
        </motion.div>
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
           <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Avg Order Value</p>
            <div className="p-2 bg-purple-50 rounded-md text-purple-600"><TrendingUp size={18} /></div>
          </div>
          <p className="text-3xl font-serif text-[var(--primary)]">
            ${stats?.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0}
          </p>
        </motion.div>
      </div>
      
      <div className="bg-white border border-[var(--border)] rounded-xl p-8 text-center text-[var(--text-secondary)] shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <Activity size={48} className="mb-4 opacity-20" />
        <p className="font-medium text-[var(--primary)] mb-1">No Revenue Data Yet</p>
        <p className="text-sm max-w-sm">Share your products on social media to generate your first sales and activate the trends graph.</p>
      </div>
    </div>
  );
}
