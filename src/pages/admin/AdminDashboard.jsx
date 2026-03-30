import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { DollarSign, Users, Store, Package, Activity, ArrowUpRight } from 'lucide-react';
import api from '../../services/api.js';
import { FullPageLoader } from '../../components/ui/Loader.jsx';
import { motion } from 'framer-motion';

const fetchAdminStats = async () => {
  const res = await api.get('/admin/dashboard');
  return res.data.data.stats;
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchAdminStats
  });

  if (isLoading) return <FullPageLoader />;

  return (
    <div className="bg-[#0B0C10] p-6 lg:p-10 min-h-full rounded-2xl text-white border border-[#1F2937] shadow-2xl">
      <Helmet><title>Command Center | FurniHub</title></Helmet>
      
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-white flex items-center">
            <Activity className="mr-3 text-blue-500" strokeWidth={3} />
            Command Center
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Global platform oversight and live analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#111827] p-6 rounded-xl border border-[#1F2937] flex items-center">
          <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500 mr-5">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">Platform GMV</p>
            <p className="text-3xl font-bold font-mono text-white">${stats?.totalSales || 0}</p>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-[#111827] p-6 rounded-xl border border-[#1F2937] flex items-center">
          <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 mr-5">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">Commission Rev</p>
            <p className="text-3xl font-bold font-mono text-white">${stats?.platformRevenue || 0}</p>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#111827] p-6 rounded-xl border border-[#1F2937] flex items-center">
          <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mr-5">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">Active Users</p>
            <p className="text-3xl font-bold font-mono text-white">{stats?.users || 0}</p>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-[#111827] p-6 rounded-xl border border-[#1F2937] flex items-center">
          <div className="h-12 w-12 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-500 mr-5">
            <Store size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">Approved Vendors</p>
            <p className="text-3xl font-bold font-mono text-white">{stats?.vendors || 0}</p>
          </div>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-8 text-center text-gray-400 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Package size={100} /></div>
          <p className="text-xs font-semibold tracking-wider uppercase mb-2">Total Inventory</p>
          <p className="text-4xl font-bold text-white font-mono">{stats?.products || 0}</p>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-8 text-center text-gray-400 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Activity size={100} /></div>
          <p className="text-xs font-semibold tracking-wider uppercase mb-2">Transactions</p>
          <p className="text-4xl font-bold text-white font-mono">{stats?.orders || 0}</p>
        </div>
      </div>
    </div>
  );
}
