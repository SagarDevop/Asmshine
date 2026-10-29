import React, { useState } from 'react';
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
  Bell
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../styles/admin.css';

export const AdminLayout = () => {
  const { admin, loading, logout, isAuthenticated } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
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
                <div className="admin-nav-link-content">
                  <Icon size={18} />
                  <span>{item.label}</span>
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
