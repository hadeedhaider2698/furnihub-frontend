import { useEffect, useRef } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import PostCard from '../../components/ui/PostCard.jsx';
import { PostSkeleton } from '../../components/ui/Skeleton.jsx';

const fetchProducts = async ({ pageParam = 1 }) => {
  const res = await api.get(`/products?page=${pageParam}&limit=5`);
  return {
    products: res.data.data.products,
    nextPage: res.data.data.pagination?.next ? pageParam + 1 : undefined,
  };
};

const fetchVendors = async () => {
  const res = await api.get('/vendors');
  return res.data.data.vendors;
};

export default function Home() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isLoadingProducts } = useInfiniteQuery({
    queryKey: ['feedProducts'],
    queryFn: fetchProducts,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const { data: vendors = [], isLoading: isLoadingVendors } = useQuery({
    queryKey: ['vendorsList'],
    queryFn: fetchVendors,
  });

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const products = data ? data.pages.flatMap((page) => page.products) : [];

  return (
    <div className="w-full bg-[var(--surface)] min-h-screen lg:pt-6 max-w-[600px] mx-auto lg:px-0">
      <Helmet><title>FurniHub | Premium Marketplace</title></Helmet>

      {/* Stories Row */}
      <div className="bg-[var(--surface-2)] border-b border-[var(--border)] py-4 overflow-x-auto no-scrollbar lg:rounded-2xl lg:border lg:mb-6 max-w-[600px] mx-auto w-full">
        <div className="flex space-x-4 px-4 w-max">
          {isLoadingVendors ? (
              [1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-16 h-16 rounded-full bg-[var(--surface)] animate-pulse" />
              ))
          ) : (
            vendors.map((vendor) => (
                <Link 
                  to={`/vendor/${vendor._id}`} 
                  key={vendor._id} 
                  className="flex flex-col items-center space-y-1 w-16 cursor-pointer hover:opacity-80 transition group"
                >
                  <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[var(--accent-2)] to-[var(--accent)] group-active:scale-95 transition-transform">
                    <div className="w-full h-full rounded-full border-2 border-[var(--surface-2)] overflow-hidden bg-white flex items-center justify-center">
                      <img 
                        src={vendor.shopLogo || `https://api.dicebear.com/7.x/initials/svg?seed=${vendor.shopName}`} 
                        alt={vendor.shopName} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-[var(--text-primary)] truncate w-full text-center">
                    {vendor.shopName.split(' ')[0]}
                  </span>
                </Link>
              ))
          )}
        </div>
      </div>

      {/* Feed Posts */}
      <div className="w-full pb-20">
        {isLoadingProducts ? (
          <div className="space-y-6"><PostSkeleton /><PostSkeleton /></div>
        ) : (
          products.map((product) => (
            <PostCard key={product._id} product={product} />
          ))
        )}
        
        {/* Infinite Scroll Trigger */}
        <div ref={observerTarget} className="w-full h-20 flex items-center justify-center">
          {isFetchingNextPage && <div className="text-[var(--text-secondary)] text-sm">Loading more...</div>}
          {!hasNextPage && !isLoadingProducts && <div className="text-[var(--text-secondary)] text-sm mb-4">You're all caught up</div>}
        </div>
      </div>
    </div>
  );
}
