import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import MainLayout from './components/layout/MainLayout.jsx'
import DashboardLayout from './components/layout/DashboardLayout.jsx'
import Home from './pages/customer/Home.jsx'
import Shop from './pages/customer/Shop.jsx'
import ProductDetail from './pages/customer/ProductDetail.jsx'
import CartPage from './pages/customer/CartPage.jsx'
import Checkout from './pages/customer/Checkout.jsx'
import Orders from './pages/customer/Orders.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import VendorDashboard from './pages/vendor/VendorDashboard.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ className: 'font-sans' }} />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Shop />} />
          <Route path="products/:slug" element={<ProductDetail />} />
          <Route path="category/:categoryName" element={<Shop />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="auth/login" element={<Login />} />
          <Route path="auth/register" element={<Register />} />
        </Route>
        
        <Route path="/" element={<MainLayout />}>
          <Route path="vendor" element={<DashboardLayout expectedRole="vendor" />}>
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="products" element={<div className="text-xl">Vendor Products (Implementation in progress)</div>} />
            <Route path="orders" element={<div className="text-xl">Vendor Orders (Implementation in progress)</div>} />
            <Route path="settings" element={<div className="text-xl">Vendor Settings (Implementation in progress)</div>} />
          </Route>
          
          <Route path="admin" element={<DashboardLayout expectedRole="admin" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<div className="text-xl">Manage Users (Implementation in progress)</div>} />
            <Route path="vendors" element={<div className="text-xl">Manage Vendors (Implementation in progress)</div>} />
            <Route path="products" element={<div className="text-xl">Manage Products (Implementation in progress)</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
