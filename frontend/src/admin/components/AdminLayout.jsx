import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Trash2,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin-panel/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin-panel/products',         icon: Package,         label: 'Products'  },
  { to: '/admin-panel/orders',           icon: ShoppingCart,    label: 'Orders'    },
  { to: '/admin-panel/customers',        icon: Users,           label: 'Customers' },
  { to: '/admin-panel/settings',         icon: Settings,        label: 'Settings'  },
  { to: '/admin-panel/deleted-products', icon: Trash2,          label: 'Deleted Products' },
];

export default function AdminLayout() {
  const { isAuthenticated, admin, logout } = useAdmin();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Guard: redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin-panel" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin-panel', { replace: true });
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/admin-panel/dashboard');
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">
            <Sparkles size={18} strokeWidth={1.5} />
          </div>
          <div className="admin-brand-text">
            <span className="admin-brand-name">Radiant Wears</span>
            <span className="admin-brand-sub">Admin Console</span>
          </div>
          <button className="admin-sidebar-close" onClick={closeSidebar} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>


        {/* Nav */}
        <nav className="admin-nav">
          <p className="admin-nav-section-label">Main Menu</p>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`
              }
            >
              <Icon size={18} strokeWidth={1.5} />
              <span>{label}</span>
              <ChevronRight size={14} className="admin-nav-arrow" />
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={18} strokeWidth={1.5} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-back-btn"
              onClick={handleBack}
              title="Go back to last visited page"
              aria-label="Back"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
            <div className="admin-topbar-title">
              <Sparkles size={16} strokeWidth={1.5} />
              <span>Radiant Wears Admin</span>
            </div>
          </div>
          <button
            className="admin-topbar-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </header>

        {/* Page content injected here */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
