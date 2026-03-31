import { http, HttpResponse } from 'msw';
import { API_URL } from '../constants.js';

export const handlers = [
  // ─── AUTH ENDPOINTS ─────────────────────────────────────────
  http.get('*/api/v1/auth/me', () => {
    return HttpResponse.json({
      status: 'success',
      data: { 
        user: { 
          _id: 'test_id', 
          name: 'Test Customer', 
          email: 'test@example.com', 
          role: 'customer',
          bio: 'Living life one furniture piece at a time. 🛋️',
          website: 'https://furnihub.com'
        } 
      }
    });
  }),
  http.post('*/api/v1/auth/login', () => {
    return HttpResponse.json({
      status: 'success',
      data: { user: { name: 'Test Customer' }, accessToken: 'mock_token' }
    });
  }),
  http.post('*/api/v1/auth/register', () => {
    return HttpResponse.json({
      status: 'success',
      data: { user: { name: 'Test Customer', email: 'test@test.com' } }
    });
  }),

  http.patch(`${API_URL}/auth/update-me`, async ({ request }) => {
    const updates = await request.json();
    return HttpResponse.json({
      status: 'success',
      data: {
        user: {
          _id: 'test_id',
          name: updates.name || 'Test Customer',
          email: updates.email || 'test@example.com',
          role: 'customer',
          bio: updates.bio || '',
          website: updates.website || '',
          phone: updates.phone || ''
        }
      }
    });
  }),

  // ─── PRODUCT ENDPOINTS ───────────────────────────────────────
  http.get('*/api/v1/products', ({ request }) => {
    return HttpResponse.json({
      status: 'success',
      data: {
        products: [
          { 
            _id: 'p1', 
            title: 'Sofa A', 
            price: 15000, 
            category: 'sofa', 
            slug: 'sofa-a',
            vendor: { _id: 'v1', shopName: 'Vendor A', shopLogo: 'test.jpg' }, 
            colors: [], 
            images: [{ url: 'test.jpg' }],
            createdAt: new Date().toISOString()
          }
        ],
        pagination: { total: 1, limit: 10, page: 1, pages: 1, next: null }
      }
    });
  }),
  http.get('*/api/v1/products/categories', () => {
    return HttpResponse.json({
      status: 'success',
      data: { categories: ['sofa', 'chair', 'bed', 'table'] }
    });
  }),
  http.get('*/api/v1/products/:slug', () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        product: { _id: 'p1', title: 'Sofa A', price: 15000, category: 'sofa', description: 'Test', stock: 10, vendor: { shopName: 'Vendor A' }, colors: [], images: [] }
      }
    });
  }),

  // ─── VENDOR ENDPOINTS ────────────────────────────────────────
  http.get('*/api/v1/vendors', () => {
      return HttpResponse.json({
          status: 'success',
          data: {
              vendors: [
                  { _id: 'v1', shopName: 'Luxe Furniture', shopLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Luxe' },
                  { _id: 'v2', shopName: 'Modern Home', shopLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Modern' }
              ]
          }
      });
  }),
  http.get('*/api/v1/vendors/stats', () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        stats: { totalRevenue: 50000, totalOrders: 10, totalProductsSold: 25 },
        vendor: {
          _id: 'vendor_id',
          shopName: 'Luxe Furniture Co.',
          description: 'Premium modern and minimalist furniture.',
          shopLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Luxe',
          shopBanner: 'https://placehold.co/600x200',
          isApproved: true,
          rating: 4.8,
          totalSales: 125,
          address: { city: 'Lahore', country: 'PK' }
        }
      }
    });
  }),

  http.get(`${API_URL}/vendor/:id`, ({ params }) => {
    return HttpResponse.json({
      status: 'success',
      data: {
        vendor: {
          _id: params.id,
          userId: params.id,
          shopName: 'Luxe Furniture Co.',
          description: 'Premium modern and minimalist furniture.',
          shopLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=Luxe',
          shopBanner: 'https://placehold.co/600x200',
          isApproved: true,
          rating: 4.8,
          totalSales: 125,
          address: { city: 'Lahore', country: 'PK' }
        }
      }
    });
  }),

  http.put(`${API_URL}/vendor/profile`, async ({ request }) => {
    const updates = await request.json();
    return HttpResponse.json({
      status: 'success',
      data: {
        vendor: {
          _id: 'vendor_id',
          userId: 'test_id',
          ...updates
        }
      }
    });
  }),

  // ─── CART ENDPOINTS ──────────────────────────────────────────
  http.get('*/api/v1/cart', () => {
    return HttpResponse.json({
      status: 'success',
      data: { cart: { items: [] } }
    });
  }),
  http.post('*/api/v1/cart/add', () => {
    return HttpResponse.json({
      status: 'success',
      data: { cart: { items: [{ product: { _id: 'p1', price: 15000 }, quantity: 1 }] } }
    });
  }),

  // ─── WISHLIST ENDPOINTS ──────────────────────────────────────
  http.get('*/api/v1/wishlist', () => {
    return HttpResponse.json({
      status: 'success',
      data: { 
        wishlist: { 
          products: [
            { _id: 'p1', title: 'Sofa A', price: 15000, slug: 'sofa-a', images: [{ url: 'test.jpg' }] }
          ] 
        } 
      }
    });
  }),

  // ─── ORDER ENDPOINTS ─────────────────────────────────────────
  http.get('*/api/v1/orders/my-orders', () => {
    return HttpResponse.json({
      status: 'success',
      data: { 
        orders: [
          { _id: 'order1', totalAmount: 15000, orderStatus: 'delivered', items: [{ product: { images: [{ url: 'test.jpg' }] } }] }
        ] 
      }
    });
  }),

  // ─── DEFAULT HANDLERS ────────────────────────────────────────
  http.get('*', () => {
    return HttpResponse.json({ message: 'Fallback' }, { status: 404 });
  }),
];
