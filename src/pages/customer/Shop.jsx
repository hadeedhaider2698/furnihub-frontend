import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import api from '../../services/api.js';
import { Loader } from '../../components/ui/Loader.jsx';
import { Button } from '../../components/ui/Button.jsx';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'createdAt';

  const fetchProducts = async ({ pageParam = null }) => {
    const params = new URLSearchParams(searchParams);
    if (pageParam) params.append('cursor', pageParam);
    params.append('limit', '12');
    const res = await api.get(`/products?${params.toString()}`);
    return res.data.data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['products', searchParams.toString()],
    queryFn: fetchProducts,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
      <Helmet><title>Shop Collection | FurniHub</title></Helmet>

      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
        <div>
          <h3 className="font-serif text-lg font-bold border-b border-border pb-2 mb-4 text-primary">Categories</h3>
          <ul className="space-y-2 text-sm">
            {['sofa', 'bed', 'dining-table', 'chair', 'wardrobe', 'desk', 'decor'].map(cat => (
              <li key={cat}>
                <button 
                  onClick={() => handleFilterChange('category', category === cat ? '' : cat)}
                  className={`capitalize hover:text-accent transition-colors ${category === cat ? 'text-accent font-bold' : 'text-text-secondary'}`}
                >
                  {cat.replace('-', ' ')}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-serif text-lg font-bold border-b border-border pb-2 mb-4 text-primary">Sort By</h3>
          <select 
            value={sort} 
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-full h-10 border border-border rounded-md bg-surface px-3 text-sm focus:ring-primary focus:border-primary"
          >
            <option value="createdAt">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="mb-8">
          <h1 className="text-3xl font-serif text-primary font-bold capitalize">
            {category ? category.replace('-', ' ') : 'All Products'}
          </h1>
          <p className="text-text-secondary mt-2">Explore our premium collection of meticulously crafted pieces.</p>
        </header>

        {status === 'pending' ? (
          <Loader />
        ) : status === 'error' ? (
          <p className="text-error">Error loading products.</p>
        ) : (
          <>
            {data.pages[0].products.length === 0 ? (
              <div className="text-center py-20 bg-surface-2 rounded-lg border border-border">
                <p className="text-lg text-text-secondary">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.pages.map((page, i) => (
                  <div key={i} className="contents">
                    {page.products.map((product) => (
                      <Link to={`/products/${product.slug}`} key={product._id} className="group block">
                        <div className="aspect-[4/5] bg-surface-2 rounded-lg overflow-hidden mb-4 relative border border-border group-hover:border-accent/30 group-hover:shadow-warm transition-all">
                          <img 
                            src={product.images[0]?.url || 'https://placehold.co/400x500/F8F6F0/1A1A2E'} 
                            alt={product.title} 
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                        </div>
                        <h3 className="font-serif font-semibold text-primary truncate group-hover:text-accent transition-colors">{product.title}</h3>
                        <p className="text-sm text-text-secondary truncate">{product.vendor.shopName}</p>
                        <div className="mt-2 text-lg font-medium text-primary">
                          ${product.discountPrice || product.price}
                        </div>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
            
            {hasNextPage && (
              <div className="mt-12 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => fetchNextPage()} 
                  isLoading={isFetchingNextPage}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
