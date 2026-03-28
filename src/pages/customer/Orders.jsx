import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { FullPageLoader } from '../../components/ui/Loader.jsx';
import { Button } from '../../components/ui/Button.jsx';

const fetchOrders = async () => {
  const res = await api.get('/orders/my-orders');
  return res.data.data.orders;
};

export default function Orders() {
  const { user } = useAuthStore();
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: fetchOrders,
    enabled: !!user,
  });

  if (isLoading) return <FullPageLoader />;

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Helmet><title>My Orders | FurniHub</title></Helmet>
        <Package size={64} className="mx-auto text-border mb-6" />
        <h1 className="text-3xl font-serif text-primary mb-4">No Orders Yet</h1>
        <p className="text-text-secondary mb-8 text-lg">You haven't placed any orders.</p>
        <Link to="/products">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing': return <Package className="text-accent" />;
      case 'shipped': return <Truck className="text-primary" />;
      case 'delivered': return <CheckCircle className="text-success" />;
      case 'cancelled': return <XCircle className="text-error" />;
      default: return <Package />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 lg:py-16">
      <Helmet><title>My Orders | FurniHub</title></Helmet>
      <h1 className="text-4xl font-serif font-bold text-primary mb-10">Order History</h1>
      
      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order._id} className="bg-surface-2 border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-surface border-b border-border p-6 flex flex-wrap gap-6 justify-between items-center text-sm">
              <div>
                <p className="text-text-secondary mb-1">Order Placed</p>
                <p className="font-medium text-primary">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-text-secondary mb-1">Total</p>
                <p className="font-medium text-primary">${order.total}</p>
              </div>
              <div>
                <p className="text-text-secondary mb-1">Order #</p>
                <p className="font-medium text-primary">{order._id.substring(order._id.length - 8).toUpperCase()}</p>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-border">
                {getStatusIcon(order.orderStatus)}
                <span className="font-medium capitalize text-primary">{order.orderStatus}</span>
              </div>
            </div>
            
            <div className="p-6">
              <ul className="divide-y divide-border -my-6">
                {order.items.map((item, idx) => (
                  <li key={`${item.product._id}-${idx}`} className="py-6 flex flex-col sm:flex-row gap-6">
                    <div className="h-24 w-24 flex-shrink-0 bg-surface rounded-md border border-border overflow-hidden p-2">
                      <img 
                        src={item.product.images[0]?.url || 'https://placehold.co/100'} 
                        alt={item.product.title}
                        className="h-full w-full object-cover mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-lg font-serif font-medium text-primary">
                          <Link to={`/products/${item.product.slug}`} className="hover:text-accent transition-colors">{item.product.title}</Link>
                        </h4>
                        <div className="mt-1 flex flex-wrap text-sm text-text-secondary gap-x-4">
                          {item.color && <p>Color: {item.color}</p>}
                          <p>Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-primary mt-4 sm:mt-0">${item.price}</p>
                    </div>
                    {order.orderStatus === 'delivered' && (
                      <div className="sm:self-center">
                        <Button variant="outline" size="sm">Write Review</Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
