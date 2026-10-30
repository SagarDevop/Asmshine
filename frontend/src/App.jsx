import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { CartWishlistProvider, useCartWishlist } from './context/CartWishlistContext';
import { HomePage } from './pages/HomePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AboutPage } from './pages/AboutPage';
import { CartPage } from './pages/CartPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AuthPage } from './pages/AuthPage';
import { AccountPage } from './pages/AccountPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DesktopNav } from './components/navigation/DesktopNav';
import { BottomNav } from './components/navigation/BottomNav';
import './styles/global.css';
import './styles/responsive.css';
import './styles/skeleton.css';
import './styles/auth.css';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { AdminLayout } from './admin/components/AdminLayout';
import { AdminLoginPage } from './admin/pages/AdminLoginPage';
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage';
import { AdminOrdersPage } from './admin/pages/AdminOrdersPage';
import { AdminProductsPage } from './admin/pages/AdminProductsPage';
import { AdminInventoryPage } from './admin/pages/AdminInventoryPage';
import { AdminCustomersPage } from './admin/pages/AdminCustomersPage';
import { AdminCouponsPage } from './admin/pages/AdminCouponsPage';
import { AdminSettingsPage } from './admin/pages/AdminSettingsPage';

/**
 * HashRedirectHandler:
 * Intercepts any legacy hash routes (e.g. #product/prod_1, #categories, #about, #cart, #checkout)
 * and seamlessly redirects to clean URLs (/product/prod_1, /categories, etc.)
 */
function HashRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleLegacyHash = () => {
      const hash = window.location.hash;
      if (!hash) return;

      if (hash.startsWith('#product/')) {
        const pid = hash.replace('#product/', '');
        navigate(`/product/${pid}`, { replace: true });
      } else if (hash.startsWith('#categories')) {
        const queryIndex = hash.indexOf('?');
        const query = queryIndex !== -1 ? hash.substring(queryIndex) : '';
        navigate(`/categories${query}`, { replace: true });
      } else if (hash === '#about') {
        navigate('/about', { replace: true });
      } else if (hash === '#cart') {
        navigate('/cart', { replace: true });
      } else if (hash.startsWith('#order/')) {
        const oid = hash.replace('#order/', '');
        navigate(`/order/${oid}`, { replace: true });
      } else if (hash.startsWith('#track-order')) {
        navigate('/track-order', { replace: true });
      } else if (hash === '#checkout') {
        navigate('/checkout', { replace: true });
      } else if (hash === '#account') {
        navigate('/account', { replace: true });
      } else if (hash === '#login') {
        navigate('/login', { replace: true });
      } else if (hash === '#signup') {
        navigate('/signup', { replace: true });
      } else if (hash === '#home' || hash === '#') {
        navigate('/', { replace: true });
      }
    };

    handleLegacyHash();
    window.addEventListener('hashchange', handleLegacyHash);
    return () => window.removeEventListener('hashchange', handleLegacyHash);
  }, [navigate, location]);

  return null;
}

/**
 * ScrollToTop:
 * Automatically scrolls to top on route change.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/**
 * Global Toast Notification
 */
function GlobalToast() {
  const { toastMessage } = useCartWishlist();
  if (!toastMessage) return null;

  return (
    <div className="toast-notice" role="alert" aria-live="polite">
      <CheckCircle2 size={16} className="toast-icon" />
      <span className="toast-text">{toastMessage}</span>
    </div>
  );
}

// Route Page Wrappers with appropriate Navigation & Containers
function CategoriesRoute() {
  return (
    <div className="app-shell">
      <DesktopNav />
      <div className="screen-container">
        <CategoriesPage />
      </div>
      <BottomNav activeTab="categories" />
    </div>
  );
}

function AboutRoute() {
  return (
    <div className="app-shell">
      <DesktopNav />
      <div className="screen-container">
        <AboutPage />
      </div>
      <BottomNav activeTab="about" />
    </div>
  );
}

function CartRoute() {
  return (
    <div className="app-shell">
      <DesktopNav />
      <div className="screen-container">
        <CartPage />
      </div>
    </div>
  );
}

function ProductDetailRoute() {
  return (
    <div className="app-shell">
      <ProductDetailPage />
    </div>
  );
}

function CheckoutRoute() {
  return (
    <div className="app-shell">
      <ProtectedRoute>
        <CheckoutPage />
      </ProtectedRoute>
    </div>
  );
}

function LoginRoute() {
  return (
    <div className="app-shell">
      <DesktopNav />
      <div className="screen-container">
        <AuthPage initialTab="login" />
      </div>
      <BottomNav activeTab="account" />
    </div>
  );
}

function SignupRoute() {
  return (
    <div className="app-shell">
      <DesktopNav />
      <div className="screen-container">
        <AuthPage initialTab="signup" />
      </div>
      <BottomNav activeTab="account" />
    </div>
  );
}

function AccountRoute() {
  return (
    <div className="app-shell">
      <DesktopNav />
      <div className="screen-container">
        <ProtectedRoute>
          <AccountPage />
        </ProtectedRoute>
      </div>
      <BottomNav activeTab="account" />
    </div>
  );
}

function OrderTrackingRoute() {
  return (
    <div className="app-shell">
      <DesktopNav />
      <div className="screen-container">
        <OrderTrackingPage />
      </div>
      <BottomNav activeTab="account" />
    </div>
  );
}


const DEFAULT_GOOGLE_CLIENT_ID = '544546980474-8pgk6kkellbbtmec3iun2p0v5kis143e.apps.googleusercontent.com';
const googleClientId =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID.trim() !== '' && !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('your_google_client_id_here'))
    ? import.meta.env.VITE_GOOGLE_CLIENT_ID.trim()
    : DEFAULT_GOOGLE_CLIENT_ID;

export function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AdminAuthProvider>
          <AuthProvider>
            <CartWishlistProvider>
              <HashRedirectHandler />
              <ScrollToTop />
              <Routes>
                {/* Dedicated Secure Admin Subsystem */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="coupons" element={<AdminCouponsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>

                {/* Customer Storefront Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/categories" element={<CategoriesRoute />} />
                <Route path="/categories/:categoryId" element={<CategoriesRoute />} />
                <Route path="/about" element={<AboutRoute />} />
                <Route path="/cart" element={<CartRoute />} />
                <Route path="/product/:id" element={<ProductDetailRoute />} />
                <Route path="/checkout" element={<CheckoutRoute />} />
                {/* Order Tracking Routes */}
                <Route path="/order/:orderId" element={<OrderTrackingRoute />} />
                <Route path="/track-order" element={<OrderTrackingRoute />} />
                <Route path="/track-order/:orderId" element={<OrderTrackingRoute />} />
                {/* Authentication & Profile Routes */}
                <Route path="/login" element={<LoginRoute />} />
                <Route path="/signup" element={<SignupRoute />} />
                <Route path="/account" element={<AccountRoute />} />
                <Route path="/profile" element={<Navigate to="/account" replace />} />
                {/* Wildcard redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <GlobalToast />
            </CartWishlistProvider>
          </AuthProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
