import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import api from '../../services/api.js';
import { FullPageLoader } from '../../components/ui/Loader.jsx';

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
    <div>
      <Helmet><title>Vendor Dashboard | FurniHub</title></Helmet>
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Overview</h1>
          <p className="text-text-secondary mt-1">Here's what's happening with your store today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface-2 p-6 rounded-xl border border-border flex items-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">${stats?.totalRevenue || 0}</p>
          </div>
        </div>

        <div className="bg-surface-2 p-6 rounded-xl border border-border flex items-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Total Orders</p>
            <p className="text-2xl font-bold text-primary">{stats?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="bg-surface-2 p-6 rounded-xl border border-border flex items-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 mr-4">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Products Sold</p>
            <p className="text-2xl font-bold text-primary">{stats?.totalProductsSold || 0}</p>
          </div>
        </div>
        
        <div className="bg-surface-2 p-6 rounded-xl border border-border flex items-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 mr-4">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Avg. Order Value</p>
            <p className="text-2xl font-bold text-primary">
              ${stats?.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-surface-2 border border-border rounded-xl p-8 text-center text-text-secondary">
        Chart visualization placeholder. Integrate Recharts here for trend lines.
      </div>
    </div>
  );
}
