import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.js';
import { Loader } from '../../components/ui/Loader.jsx';

const fetchFeaturedProducts = async () => {
  const res = await api.get('/products?limit=4&sort=rating');
  return res.data.data.products;
};

export default function Home() {
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: fetchFeaturedProducts
  });

  return (
    <div>
      <Helmet><title>FurniHub | Luxury Minimum Furniture</title></Helmet>
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center bg-surface-2 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-primary/5 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1600&q=80" 
          alt="Luxury living room" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
        />
        <div className="container mx-auto px-4 z-20 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl bg-surface-2/90 backdrop-blur-sm p-10 rounded-lg shadow-warm-lg"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary leading-tight mb-6">
              Curated elegance for your home.
            </h1>
            <p className="text-lg text-text-secondary mb-8 leading-relaxed">
              Discover pieces crafted by independent artisans and luxury brands. Uncompromising quality meets modern minimalism.
            </p>
            <Link to="/products" className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-white font-medium hover:bg-accent-2 transition-colors shadow-warm">
              Explore Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-serif font-bold text-primary mb-2">Featured Pieces</h2>
            <p className="text-text-secondary">Signature items loved by designers.</p>
          </div>
          <Link to="/products" className="text-accent font-medium hover:underline">View All</Link>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center"><Loader /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts?.map((product, i) => (
              <motion.div 
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] bg-surface-2 rounded-lg overflow-hidden mb-4 relative shadow-sm group-hover:shadow-warm transition-all border border-border group-hover:border-accent/30">
                  <img 
                    src={product.images[0]?.url || 'https://placehold.co/400x500/F8F6F0/1A1A2E?text=No+Image'} 
                    alt={product.title} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  {product.discountPrice && (
                    <span className="absolute top-3 left-3 bg-error text-white text-xs px-2 py-1 rounded-full font-bold">SALE</span>
                  )}
                  <Link to={`/products/${product.slug}`} className="absolute inset-0 z-10 block" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-widest mb-1">{product.category}</p>
                  <h3 className="font-serif font-semibold text-lg text-primary mb-1 group-hover:text-accent transition-colors truncate">{product.title}</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="font-medium text-primary">${product.discountPrice || product.price}</span>
                    {product.discountPrice && <span className="text-sm text-text-secondary line-through">${product.price}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-primary text-surface py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-16 text-white">Elevate Every Space</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: 'sofa', name: 'Living Room', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
              { id: 'bed', name: 'Bedroom', img: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&q=80' },
              { id: 'dining-table', name: 'Dining', img: 'https://images.unsplash.com/photo-1617806118233-18e1c0945594?w=600&q=80' },
            ].map(cat => (
              <Link to={`/category/${cat.id}`} key={cat.id} className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <h3 className="text-2xl font-serif font-semibold text-white tracking-wide">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
