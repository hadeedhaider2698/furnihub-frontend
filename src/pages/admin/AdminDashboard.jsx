import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { DollarSign, Users, Store, Package } from 'lucide-react';
import api from '../../services/api.js';
import { FullPageLoader } from '../../components/ui/Loader.jsx';

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
    <div>
      <Helmet><title>Admin Dashboard | FurniHub</title></Helmet>
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Platform Overview</h1>
          <p className="text-text-secondary mt-1">Global statistics and performance metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-2 p-6 rounded-xl border border-border flex items-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Gross Sales</p>
            <p className="text-2xl font-bold text-primary">${stats?.totalSales || 0}</p>
          </div>
        </div>

        <div className="bg-surface-2 p-6 rounded-xl border border-border flex items-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Platform Revenue</p>
            <p className="text-2xl font-bold text-primary">${stats?.platformRevenue || 0}</p>
          </div>
        </div>

        <div className="bg-surface-2 p-6 rounded-xl border border-border flex items-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Total Users</p>
            <p className="text-2xl font-bold text-primary">{stats?.users || 0}</p>
          </div>
        </div>

        <div className="bg-surface-2 p-6 rounded-xl border border-border flex items-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 mr-4">
            <Store size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Active Vendors</p>
            <p className="text-2xl font-bold text-primary">{stats?.vendors || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-2 border border-border rounded-xl p-8 text-center text-text-secondary">
          <Package className="mx-auto mb-4 opacity-50" size={40} />
          <p className="text-2xl font-bold text-primary">{stats?.products || 0}</p>
          <p>Total Products</p>
        </div>
        <div className="bg-surface-2 border border-border rounded-xl p-8 text-center text-text-secondary">
          <Package className="mx-auto mb-4 opacity-50" size={40} />
          <p className="text-2xl font-bold text-primary">{stats?.orders || 0}</p>
          <p>Total Orders</p>
        </div>
      </div>
    </div>
  );
}
