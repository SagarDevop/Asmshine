import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  Tag,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  Bell,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminLiveOrderProvider, useAdminLiveOrder } from '../context/AdminLiveOrderContext';
import '../styles/admin.css';

const AdminLayoutInner = () => {
  const { admin, logout } = useAdminAuth();
  const {
    isLiveConnected,
    incomingOrders,
    unreadCount,
    latestAlert,
    soundEnabled,
    toggleSound,
    dismissAlert,
    markAllAsRead
  } = useAdminLiveOrder();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close bell dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When visiting orders page, clear unread count
  useEffect(() => {
    if (location.pathname.startsWith('/admin/orders')) {
      markAllAsRead();
    }
  }, [location.pathname, markAllAsRead]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag, badge: unreadCount > 0 ? `+${unreadCount}` : null },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Inventory', path: '/admin/inventory', icon: Layers },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Coupons & Offers', path: '/admin/coupons', icon: Tag },
    { label: 'Settings & Logs', path: '/admin/settings', icon: Settings }
  ];

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/admin') return 'Dashboard';
    if (p.startsWith('/admin/orders')) return 'Order Management';
    if (p.startsWith('/admin/products')) return 'Product Catalogue';
    if (p.startsWith('/admin/inventory')) return 'Inventory & Stock Control';
    if (p.startsWith('/admin/customers')) return 'Customer Management';
    if (p.startsWith('/admin/coupons')) return 'Coupons & Discounts';
    if (p.startsWith('/admin/settings')) return 'Store Settings & Audit Logs';
    return 'Admin';
  };

  return (
    <div className="admin-root-container">
      {/* 0. Floating Real-Time Order Toast */}
      {latestAlert && (
        <div className="admin-live-order-toast" role="alert">
          <div className="admin-live-order-toast-icon">
            <ShoppingBag size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} />
                NEW ORDER RECEIVED!
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>Live</span>
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              #{latestAlert.orderId}
            </div>
            <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '3px' }}>
              <strong>{latestAlert.customerName}</strong> • ₹{latestAlert.totalAmount} ({(latestAlert.paymentMethod || 'COD').toUpperCase()})
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  dismissAlert();
                  navigate('/admin/orders');
                }}
                className="admin-btn admin-btn-sm admin-btn-primary"
                style={{ padding: '5px 12px', fontSize: '11.5px', fontWeight: 700 }}
              >
                View Order Table
              </button>
              <button
                onClick={dismissAlert}
                className="admin-btn admin-btn-sm admin-btn-secondary"
                style={{ padding: '5px 9px', fontSize: '11.5px' }}
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={dismissAlert}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px', marginLeft: '4px' }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 1. Left Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <img src="/favicon.svg" alt="ASM Shine" className="admin-sidebar-logo" />
          <div>
            <div className="admin-sidebar-brand-name">SM SHINE</div>
            <span className="admin-sidebar-brand-badge">ADMIN CONSOLE</span>
          </div>
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', marginLeft: 'auto', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="admin-nav-group">
          <div className="admin-nav-title">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setMobileMenuOpen(false)}
                className={`admin-nav-link ${isActive ? 'active' : ''}`}
              >
                <div className="admin-nav-link-content" style={{ width: '100%' }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="admin-nav-live-badge">{item.badge}</span>
                  )}
                </div>
              </NavLink>
            );
          })}
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {(admin?.name?.[0] || 'A').toUpperCase()}
            </div>
            <div>
              <div className="admin-user-name">{admin?.name || 'Administrator'}</div>
              <div className="admin-user-role">{admin?.role?.replace('_', ' ') || 'Admin'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out of admin console"
            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '6px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="admin-main-wrap">
        <header className="admin-top-header">
          <div className="admin-header-left">
            <button
              className="admin-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>
            <div className="admin-breadcrumb">
              <span>Admin</span>
              <span>/</span>
              <span className="admin-breadcrumb-active">{getPageTitle()}</span>
            </div>
          </div>

          <div className="admin-header-right">
            {/* Live Connection Pulse Indicator */}
            <div
              className={`admin-live-indicator ${!isLiveConnected ? 'disconnected' : ''}`}
              title={isLiveConnected ? 'Connected to live push server. Instant updates without page refresh.' : 'Reconnecting to live sync server...'}
            >
              <span className={`admin-live-dot ${!isLiveConnected ? 'disconnected' : ''}`} />
              <span>{isLiveConnected ? 'Live Real-Time Sync' : 'Reconnecting...'}</span>
            </div>

            {/* Audio Chime Notification Toggle */}
            <button
              onClick={toggleSound}
              className="admin-header-tool-btn"
              title={soundEnabled ? 'Order sound alert is ON (click to mute)' : 'Order sound alert is MUTED (click to enable)'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 size={15} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '11.5px' }}>Sound On</span>
                </>
              ) : (
                <>
                  <VolumeX size={15} style={{ color: '#94A3B8' }} />
                  <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>Muted</span>
                </>
              )}
            </button>

            {/* Live Notification Bell & Dropdown */}
            <div style={{ position: 'relative' }} ref={bellRef}>
              <button
                onClick={() => {
                  setBellOpen((prev) => !prev);
                  if (unreadCount > 0) markAllAsRead();
                }}
                className="admin-header-tool-btn"
                title="Recent incoming orders"
                style={{ padding: '0 9px' }}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="admin-badge-count">{unreadCount}</span>
                )}
              </button>

              {bellOpen && (
                <div className="admin-bell-popover">
                  <div className="admin-bell-popover-header">
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                      Live Activity ({incomingOrders.length})
                    </span>
                    <button
                      onClick={() => {
                        markAllAsRead();
                        setBellOpen(false);
                      }}
                      style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Close
                    </button>
                  </div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {incomingOrders.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '12.5px' }}>
                        No incoming orders received during this session yet.
                      </div>
                    ) : (
                      incomingOrders.map((ord) => (
                        <div
                          key={ord.orderId || ord.id}
                          className="admin-bell-item"
                          onClick={() => {
                            setBellOpen(false);
                            navigate('/admin/orders');
                          }}
                        >
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', marginTop: '6px', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                              #{ord.orderId}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                              {ord.customerName} • ₹{ord.totalAmount} ({ord.paymentMethod?.toUpperCase()})
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {incomingOrders.length > 0 && (
                    <div style={{ padding: '8px 16px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setBellOpen(false);
                          navigate('/admin/orders');
                        }}
                        style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Go to Order Management →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-view-store-btn"
              title="Open customer storefront in new tab"
            >
              <ExternalLink size={14} />
              <span>Live Storefront</span>
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#EFF6FF', color: '#1D4ED8', padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700 }}>
                <Shield size={13} />
                <span>{(admin?.role || 'admin').toUpperCase()}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="admin-logout-btn"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="admin-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AdminLayout = () => {
  const { loading, isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
          <p style={{ color: '#64748B', fontSize: '14px', fontWeight: 600 }}>Verifying Administrator Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <AdminLiveOrderProvider>
      <AdminLayoutInner />
    </AdminLiveOrderProvider>
  );
};
