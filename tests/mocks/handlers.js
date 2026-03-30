import { http, HttpResponse } from 'msw';

export const handlers = [
  // ─── AUTH ENDPOINTS ─────────────────────────────────────────
  http.get('*/api/v1/auth/me', () => {
    return HttpResponse.json({
      status: 'success',
      data: { user: { _id: 'test_id', name: 'Test Customer', email: 'test@example.com', role: 'customer' } }
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

  // ─── PRODUCT ENDPOINTS ───────────────────────────────────────
  http.get('*/api/v1/products', () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        products: [
          { _id: 'p1', title: 'Sofa A', price: 15000, category: 'sofa', vendor: { shopName: 'Vendor A' }, comments: [] }
        ],
        pagination: { total: 1, limit: 10, page: 1, pages: 1 }
      }
    });
  }),
  http.get('*/api/v1/products/slug/:slug', () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        product: { _id: 'p1', title: 'Sofa A', price: 15000, category: 'sofa', description: 'Test', stock: 10, vendor: { shopName: 'Vendor A' }, colors: [], images: [] }
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

  // ─── DEFAULT HANDLERS ────────────────────────────────────────
  http.get('*', () => {
    return HttpResponse.json({ message: 'Fallback' }, { status: 404 });
  })
];
