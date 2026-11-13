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
  Sparkles,
  ChevronRight
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

  const navGroups = [
    {
      group: 'Core',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
        { label: 'Orders', path: '/admin/orders', icon: ShoppingBag, badge: unreadCount > 0 ? `+${unreadCount}` : null }
      ]
    },
    {
      group: 'Catalogue & Stock',
      items: [
        { label: 'Products', path: '/admin/products', icon: Package },
        { label: 'Inventory', path: '/admin/inventory', icon: Layers }
      ]
    },
    {
      group: 'Customers & Offers',
      items: [
        { label: 'Customers', path: '/admin/customers', icon: Users },
        { label: 'Coupons & Offers', path: '/admin/coupons', icon: Tag }
      ]
    },
    {
      group: 'System',
      items: [
        { label: 'Settings & Logs', path: '/admin/settings', icon: Settings }
      ]
    }
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
            <ShoppingBag size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} />
                NEW ORDER RECEIVED!
              </span>
              <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>Live</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              #{latestAlert.orderId}
            </div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
              <strong>{latestAlert.customerName}</strong> • ₹{latestAlert.totalAmount} ({(latestAlert.paymentMethod || 'COD').toUpperCase()})
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  dismissAlert();
                  navigate('/admin/orders');
                }}
                className="admin-btn admin-btn-sm admin-btn-primary"
                style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}
              >
                View Order
              </button>
              <button
                onClick={dismissAlert}
                className="admin-btn admin-btn-sm admin-btn-secondary"
                style={{ padding: '4px 8px', fontSize: '11px' }}
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
            <X size={15} />
          </button>
        </div>
      )}

      {/* 1. Left Obsidian Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <img src="/favicon.svg" alt="ASM Shine" className="admin-sidebar-logo" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="admin-sidebar-brand-name">ASM SHINE</div>
            <span className="admin-sidebar-brand-badge">ADMIN CONSOLE</span>
          </div>
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', marginLeft: 'auto', cursor: 'pointer', padding: '4px' }}
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div style={{ flex: 1, padding: '10px 0' }}>
          {navGroups.map((grp) => (
            <div key={grp.group} className="admin-nav-group">
              <div className="admin-nav-title">{grp.group}</div>
              {grp.items.map((item) => {
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
                      <Icon size={17} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="admin-nav-live-badge">{item.badge}</span>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          ))}
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
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
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
              <Menu size={20} />
            </button>
            <div className="admin-breadcrumb">
              <span>Admin</span>
              <ChevronRight size={13} color="#94A3B8" />
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
              <span>{isLiveConnected ? 'Live Real-Time' : 'Reconnecting...'}</span>
            </div>

            {/* Audio Chime Notification Toggle */}
            <button
              onClick={toggleSound}
              className="admin-header-tool-btn"
              title={soundEnabled ? 'Order audio chime is ON (click to mute)' : 'Order audio chime is MUTED (click to enable)'}
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
                style={{ padding: '0 8px' }}
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span className="admin-badge-count">{unreadCount}</span>
                )}
              </button>

              {bellOpen && (
                <div className="admin-bell-popover">
                  <div className="admin-bell-popover-header">
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                      Live Activity ({incomingOrders.length})
                    </span>
                    <button
                      onClick={() => {
                        markAllAsRead();
                        setBellOpen(false);
                      }}
                      style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Clear
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
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', marginTop: '6px', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                              #{ord.orderId}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
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
                        style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
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
              <ExternalLink size={13} />
              <span>Storefront</span>
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }}>
                <Shield size={12} />
                <span>{(admin?.role || 'admin').toUpperCase()}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="admin-logout-btn"
              title="Sign out"
            >
              <LogOut size={13} />
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
          <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
          <p style={{ color: '#64748B', fontSize: '13px', fontWeight: 600 }}>Verifying Administrator Session...</p>
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
export default AdminLayout;
