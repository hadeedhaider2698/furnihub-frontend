import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { DollarSign, Package, ShoppingCart, TrendingUp, Plus, AlertCircle, ChevronRight, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { FullPageLoader } from '../../components/ui/Loader.jsx';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const fetchDashboardData = async () => {
  const res = await api.get('/vendor/dashboard/stats');
  return res.data.data;
};

export default function VendorDashboard() {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['vendorDashboard'],
    queryFn: fetchDashboardData,
    retry: 1
  });

  if (isLoading) return <FullPageLoader />;
  
  if (isError) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-10 text-center bg-red-50 rounded-3xl border border-red-100 m-8">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-black text-red-900 mb-2">Failed to Load Dashboard</h3>
        <p className="text-red-600 font-medium max-w-md">
          {error.response?.data?.message || error.message || 'An unexpected error occurred while fetching your business data.'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return <div className="p-10 text-center font-bold text-red-500">No dashboard data available.</div>;

  const stats = data.stats || {};
  const recentOrders = data.recentOrders || [];

  const statCards = [
    { 
      label: 'Gross Revenue', 
      value: `$${(stats.totalRevenue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: 'text-green-600', 
      bg: 'bg-green-100' 
    },
    { 
      label: 'Total Orders', 
      value: stats.totalOrders || 0, 
      icon: ShoppingCart, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100' 
    },
    { 
      label: 'Units Sold', 
      value: stats.totalUnitsSold || 0, 
      icon: PackageCheck, 
      color: 'text-amber-600', 
      bg: 'bg-amber-100' 
    },
    { 
      label: 'Avg Sale', 
      value: `$${stats.totalOrders > 0 ? ((stats.totalRevenue || 0) / stats.totalOrders).toFixed(2) : 0}`, 
      icon: TrendingUp, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100' 
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <Helmet><title>Vendor Overview | FurniHub</title></Helmet>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-sm">
        <div>
           <h1 className="text-2xl font-black text-[var(--primary)] tracking-tight">Business Overview</h1>
           <p className="text-[var(--text-secondary)] text-sm font-medium">Real-time performance metrics for your shop.</p>
        </div>
        <div className="flex gap-3">
             <Link to="/vendor/products/new" className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-warm active:scale-95 transition-transform">
                <Plus size={18} /> Add Product
             </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[var(--surface)] p-5 md:p-6 rounded-3xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 ${stat.bg} rounded-xl ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              {idx === 0 && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>}
            </div>
            <p className="text-2xl md:text-3xl font-black text-[var(--primary)]">{stat.value}</p>
            <p className="text-[10px] md:text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-black text-[var(--primary)] tracking-tight">Recent Orders</h2>
            <Link to="/vendor/orders" className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--surface-2)] text-[var(--text-secondary)] uppercase text-[10px] tracking-widest font-black border-b border-[var(--border)]">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {recentOrders.length > 0 ? recentOrders.map(order => (
                    <tr key={order._id} className="hover:bg-[var(--surface-2)] transition-colors group cursor-pointer" onClick={() => (window.location.href=`/vendor/orders?id=${order._id}`)}>
                      <td className="px-6 py-4 font-bold text-[var(--primary)]">#{order.orderNumber}</td>
                      <td className="px-6 py-4">
                         <p className="font-medium text-[var(--text-primary)]">{order.customer.name}</p>
                         <p className="text-[10px] text-[var(--text-secondary)]">{format(new Date(order.createdAt), 'MMM dd, hh:mm a')}</p>
                      </td>
                      <td className="px-6 py-4 font-black text-[var(--primary)]">${(order.vendorSubtotal || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${
                          order.orderStatus === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                          order.orderStatus === 'placed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-[var(--text-secondary)] font-medium">No recent orders yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Panel: Inventory Alerts & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-sm">
            <h3 className="font-black text-[var(--primary)] tracking-tight mb-4 flex items-center gap-2">
               <AlertCircle size={18} className="text-amber-500" /> Inventory Alerts
            </h3>
            <div className="space-y-4">
                {stats.lowStockCount > 0 ? (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                        <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">{stats.lowStockCount} Products Low Stock</p>
                        <p className="text-[10px] text-amber-600 mt-1 font-medium italic">Items with less than 5 units remaining.</p>
                        <Link to="/vendor/products" className="mt-3 block text-center bg-amber-600 text-white py-2 rounded-xl text-xs font-bold shadow-sm">Update Stock</Link>
                    </div>
                ) : (
                    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
                        <PackageCheck size={20} className="text-green-600" />
                        <div>
                             <p className="text-xs font-black text-green-800">All Stock Healthy</p>
                             <p className="text-[10px] text-green-600">Great job mantenining inventory!</p>
                        </div>
                    </div>
                )}
            </div>
          </div>

          <div className="bg-gradient-to-tr from-[var(--primary)] to-[#2D3142] p-6 rounded-3xl text-white shadow-warm-lg">
             <h3 className="font-black tracking-tight mb-1">Scale Your Business</h3>
             <p className="text-xs text-white/70 mb-4 font-medium">Get detailed reports and analytics for your furniture shop.</p>
             <button className="w-full bg-white text-[var(--primary)] py-2.5 rounded-xl text-xs font-black hover:opacity-95 transition-opacity">
                Download Report
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
