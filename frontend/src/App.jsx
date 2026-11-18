import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { CartWishlistProvider, useCartWishlist } from './context/CartWishlistContext';
import { HomePage } from './pages/HomePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DesktopNav } from './components/navigation/DesktopNav';
import { BottomNav } from './components/navigation/BottomNav';
import './styles/global.css';
import './styles/responsive.css';
import './styles/skeleton.css';
import './styles/auth.css';

// Lazy-loaded customer routes (Code-splitting for faster initial page load)
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then((m) => ({ default: m.AccountPage })));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage').then((m) => ({ default: m.OrderTrackingPage })));
const CancelOrderPage = lazy(() => import('./pages/CancelOrderPage').then((m) => ({ default: m.CancelOrderPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage').then((m) => ({ default: m.RefundPolicyPage })));

// Lazy-loaded Admin-only routes (Keeps admin code completely out of customer bundle)
const AdminAuthProvider = lazy(() => import('./admin/context/AdminAuthContext').then((m) => ({ default: m.AdminAuthProvider })));
const AdminLayout = lazy(() => import('./admin/components/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminLoginPage = lazy(() => import('./admin/pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminOrdersPage = lazy(() => import('./admin/pages/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })));
const AdminProductsPage = lazy(() => import('./admin/pages/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })));
const AdminInventoryPage = lazy(() => import('./admin/pages/AdminInventoryPage').then((m) => ({ default: m.AdminInventoryPage })));
const AdminCustomersPage = lazy(() => import('./admin/pages/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage })));
const AdminCouponsPage = lazy(() => import('./admin/pages/AdminCouponsPage').then((m) => ({ default: m.AdminCouponsPage })));
const AdminSettingsPage = lazy(() => import('./admin/pages/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));
const AdminPoliciesPage = lazy(() => import('./admin/pages/AdminPoliciesPage').then((m) => ({ default: m.AdminPoliciesPage })));
const AdminAboutPage = lazy(() => import('./admin/pages/AdminAboutPage').then((m) => ({ default: m.AdminAboutPage })));

// Lightweight non-blocking page transition spinner
const PageLoadingFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#1C8E8F', fontWeight: 600, fontSize: '13px' }}>
      <RefreshCw size={20} className="animate-spin" />
      <span>Loading ASM Shine...</span>
    </div>
  </div>
);

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

function ForgotPasswordRoute() {
  return (
    <div className="app-shell">
      <DesktopNav />
      <div className="screen-container">
        <AuthPage initialTab="forgot" />
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

function CancelOrderRoute() {
  return (
    <div className="app-shell">
      <DesktopNav />
      <div className="screen-container">
        <CancelOrderPage />
      </div>
      <BottomNav activeTab="account" />
    </div>
  );
}

function TermsRoute() {
  return <TermsPage />;
}

function PrivacyPolicyRoute() {
  return <PrivacyPolicyPage />;
}

function RefundPolicyRoute() {
  return <RefundPolicyPage />;
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
        <AuthProvider>
          <CartWishlistProvider>
            <HashRedirectHandler />
            <ScrollToTop />
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* Dedicated Secure Admin Subsystem (Lazy-loaded isolated bundle) */}
                <Route
                  path="/admin/login"
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <AdminAuthProvider>
                        <AdminLoginPage />
                      </AdminAuthProvider>
                    </Suspense>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <Suspense fallback={<PageLoadingFallback />}>
                      <AdminAuthProvider>
                        <AdminLayout />
                      </AdminAuthProvider>
                    </Suspense>
                  }
                >
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="coupons" element={<AdminCouponsPage />} />
                  <Route path="about" element={<AdminAboutPage />} />
                  <Route path="policies" element={<AdminPoliciesPage />} />
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
                {/* Legal & Policy Management Pages */}
                <Route path="/terms-and-conditions" element={<TermsRoute />} />
                <Route path="/terms" element={<Navigate to="/terms-and-conditions" replace />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyRoute />} />
                <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
                <Route path="/refund-policy" element={<RefundPolicyRoute />} />
                <Route path="/refunds" element={<Navigate to="/refund-policy" replace />} />
                {/* Order Tracking Routes */}
                <Route path="/order/:orderId/cancel" element={<CancelOrderRoute />} />
                <Route path="/order/:orderId" element={<OrderTrackingRoute />} />
                <Route path="/track-order" element={<OrderTrackingRoute />} />
                <Route path="/track-order/:orderId" element={<OrderTrackingRoute />} />
                {/* Authentication & Profile Routes */}
                <Route path="/login" element={<LoginRoute />} />
                <Route path="/signup" element={<SignupRoute />} />
                <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
                <Route path="/account" element={<AccountRoute />} />
                <Route path="/profile" element={<Navigate to="/account" replace />} />
                {/* Wildcard redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <GlobalToast />
          </CartWishlistProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
