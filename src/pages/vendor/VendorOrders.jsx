import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, ChevronRight, Package, Truck, CheckCircle, Clock, Search, MapPin, Phone, User, ExternalLink, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import api from '../../services/api.js';
import { FullPageLoader } from '../../components/ui/Loader.jsx';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const fetchVendorOrders = async () => {
  const res = await api.get('/vendor/dashboard/orders');
  return res.data.data.orders;
};

export default function VendorOrders() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['vendorOrders'],
    queryFn: fetchVendorOrders
  });

  const orders = data || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/vendor/dashboard/orders/${id}`, { orderStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendorOrders']);
      toast.success('Order status updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  });

  if (isLoading) return <FullPageLoader />;

  const filteredOrders = orders.filter(o => 
    (o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
     o.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || o.orderStatus === statusFilter)
  );

  const statuses = ['all', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="space-y-8 pb-20">
      <Helmet><title>Manage Orders | FurniHub Vendor</title></Helmet>

      {/* Header */}
      <div>
         <h1 className="text-2xl font-black text-[var(--primary)] tracking-tight">Order Management</h1>
         <p className="text-[var(--text-secondary)] text-sm font-medium">Fulfill and track customer orders across your store.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--surface)] p-4 rounded-3xl border border-[var(--border)] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder="Search by ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--surface-2)] border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Clock size={18} className="text-[var(--text-secondary)]" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:flex-none bg-[var(--surface-2)] border-none rounded-2xl py-3 px-4 text-sm font-bold text-[var(--primary)] outline-none cursor-pointer capitalize"
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
          <motion.div 
            layout
            key={order._id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden"
          >
            {/* Order Header */}
            <div className="p-6 border-b border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surface-2)]/30">
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <span className="text-lg font-black text-[var(--primary)]">#{order.orderNumber}</span>
                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                       order.orderStatus === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                       order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                       'bg-blue-50 text-blue-600 border-blue-100'
                     }`}>
                       {order.orderStatus}
                     </span>
                  </div>
                  <p className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-widest">{format(new Date(order.createdAt), 'MMMM dd, yyyy • hh:mm a')}</p>
               </div>
               
               <div className="flex items-center gap-3">
                  <p className="text-right hidden md:block border-r border-[var(--border)] pr-4 mr-1">
                     <span className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Amount</span>
                     <span className="text-lg font-black text-[var(--primary)]">${order.vendorSubtotal.toLocaleString()}</span>
                  </p>
                  <select 
                     value={order.orderStatus}
                     onChange={(e) => updateStatusMutation.mutate({ id: order._id, status: e.target.value })}
                     disabled={updateStatusMutation.isLoading}
                     className="bg-[var(--primary)] text-white border-none rounded-xl py-2.5 px-4 text-xs font-bold shadow-warm cursor-pointer outline-none active:scale-95 transition-transform disabled:opacity-50"
                  >
                     {statuses.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
               </div>
            </div>

            {/* Order Body */}
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
               {/* Items List */}
               <div className="md:col-span-2 p-6 space-y-4">
                  <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Package size={14} /> Order Items
                  </h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                       <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" alt="" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-bold text-[var(--primary)] truncate">{item.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-xs font-bold text-[var(--text-secondary)]">Price: ${item.price}</span>
                             <span className="text-[var(--border)]">•</span>
                             <span className="text-xs font-black text-[var(--accent)]">Qty: {item.quantity}</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-[var(--primary)]">${item.subtotal}</p>
                       </div>
                    </div>
                  ))}
               </div>

               {/* Shipping Info */}
               <div className="p-6 bg-[var(--surface-2)]/10 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Truck size={14} /> Shipping Details
                    </h4>
                    <div className="space-y-4">
                       <div className="flex items-start gap-3">
                          <div className="p-2 bg-[var(--surface-2)] rounded-lg text-[var(--primary)]"><User size={14} /></div>
                          <div>
                             <p className="text-xs font-bold text-[var(--primary)]">{order.customer.name}</p>
                             <p className="text-[10px] text-[var(--text-secondary)] font-medium truncate">{order.customer.email}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-3">
                          <div className="p-2 bg-[var(--surface-2)] rounded-lg text-[var(--primary)]"><MapPin size={14} /></div>
                          <div>
                             <p className="text-xs font-medium text-[var(--text-primary)] leading-tight">
                                {order.shippingAddress.street}, {order.shippingAddress.city}<br/>
                                {order.shippingAddress.state}, {order.shippingAddress.zipCode}
                             </p>
                          </div>
                       </div>
                       <div className="flex items-start gap-3">
                          <div className="p-2 bg-[var(--surface-2)] rounded-lg text-[var(--primary)]"><Phone size={14} /></div>
                          <p className="text-xs font-bold text-[var(--primary)]">{order.shippingAddress.phone}</p>
                       </div>
                    </div>
                  </div>
                  
                  <div className="pt-6">
                     <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--primary)] border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors">
                        <ExternalLink size={12} /> View Full Detail
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )) : (
          <div className="bg-[var(--surface)] py-20 rounded-3xl border border-[var(--border)] text-center">
             <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-[var(--surface-2)] rounded-full text-[var(--text-secondary)]">
                   <ShoppingBag size={40} strokeWidth={1} />
                </div>
                <p className="text-[var(--text-secondary)] font-medium">No orders found for the selected criteria.</p>
                <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="text-[var(--primary)] font-bold text-sm hover:underline">Clear all filters</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
