import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ── Storefront ────────────────────────────────────────────
import { ShopProvider } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { Lookbook } from './components/Lookbook';
import { BrandValues } from './components/BrandValues';
import { ReviewsSection } from './components/ReviewsSection';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ToastContainer } from './components/ToastContainer';
import AccountPage from './pages/AccountPage';

// ── Admin Panel ───────────────────────────────────────────
import { AdminProvider } from './admin/context/AdminContext';
import AdminLogin from './admin/pages/AdminLogin';
import AdminLayout from './admin/components/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminProducts from './admin/pages/AdminProducts';
import AdminDeletedProducts from './admin/pages/AdminDeletedProducts';
import ComingSoon from './admin/pages/ComingSoon';

import './App.css';

// Storefront page (single page app, all sections stacked)
function StoreFront() {
  return (
    <div className="radiant-app">
      <Navbar />
      <main>
        <Hero />
        <ProductGrid />
        <Lookbook />
        <BrandValues />
        <ReviewsSection />
        <Newsletter />
      </main>
      <Footer />
      <ProductModal />
      <CartDrawer />
      <WishlistDrawer />
      <CheckoutModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Storefront ── */}
      <Route
        path="/"
        element={
          <ShopProvider>
            <StoreFront />
          </ShopProvider>
        }
      />

      {/* ── Dedicated Account / Auth Pages ── */}
      <Route
        path="/account"
        element={
          <ShopProvider>
            <AccountPage />
            <ToastContainer />
          </ShopProvider>
        }
      />
      <Route
        path="/login"
        element={
          <ShopProvider>
            <AccountPage />
            <ToastContainer />
          </ShopProvider>
        }
      />
      <Route
        path="/register"
        element={
          <ShopProvider>
            <AccountPage />
            <ToastContainer />
          </ShopProvider>
        }
      />

      {/* ── Admin Panel ── */}
      <Route
        path="/admin-panel"
        element={<AdminProvider />}
      >
        {/* /admin-panel → Login */}
        <Route index element={<AdminLogin />} />

        {/* /admin-panel/* → Protected layout with sidebar */}
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products"  element={<AdminProducts />} />
          <Route path="orders"    element={<ComingSoon title="Orders" />} />
          <Route path="customers" element={<ComingSoon title="Customers" />} />
          <Route path="settings"  element={<ComingSoon title="Settings" />} />
          <Route path="deleted-products" element={<AdminDeletedProducts />} />
        </Route>

        {/* Unknown admin sub-routes → back to login */}
        <Route path="*" element={<Navigate to="/admin-panel" replace />} />
      </Route>

      {/* Catch-all → storefront */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
