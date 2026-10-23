import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import './AdminDashboard.css';

function StatCard({ icon: Icon, label, value, sub, accent, loading }) {
  return (
    <div className={`admin-stat-card ${accent ? `admin-stat-card--${accent}` : ''}`}>
      <div className="admin-stat-icon">
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <div className="admin-stat-body">
        <p className="admin-stat-label">{label}</p>
        {loading ? (
          <div className="admin-stat-skeleton" />
        ) : (
          <p className="admin-stat-value">{value ?? '—'}</p>
        )}
        {sub && !loading && <p className="admin-stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

function OrderRow({ order }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemCount = items.reduce((s, i) => s + (i.quantity || 1), 0);
  const total = order.totals?.total
    ? `₹${parseFloat(order.totals.total).toFixed(2)}`
    : '—';
  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <tr className="admin-table-row">
      <td className="admin-table-cell">
        <span className="admin-order-id">{order.order_id}</span>
      </td>
      <td className="admin-table-cell">
        {order.customer?.firstName
          ? `${order.customer.firstName} ${order.customer.lastName ?? ''}`.trim()
          : <span className="admin-muted">Guest</span>}
      </td>
      <td className="admin-table-cell admin-muted">{itemCount} item{itemCount !== 1 ? 's' : ''}</td>
      <td className="admin-table-cell">{total}</td>
      <td className="admin-table-cell">
        <span className={`admin-status-badge admin-status-badge--${(order.status || 'confirmed').toLowerCase()}`}>
          {order.status || 'CONFIRMED'}
        </span>
      </td>
      <td className="admin-table-cell admin-muted">{date}</td>
    </tr>
  );
}

export default function AdminDashboard() {
  const { admin, authFetch, logout } = useAdmin();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, ordersRes] = await Promise.all([
        authFetch('/api/admin/stats'),
        authFetch('/api/admin/orders?limit=8'),
      ]);

      // Token expired or revoked — force logout
      if (statsRes.status === 401 || ordersRes.status === 401) {
        logout();
        return;
      }

      if (!statsRes.ok || !ordersRes.ok) throw new Error('Failed to load dashboard data.');

      const [statsData, ordersData] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
      ]);

      setStats(statsData);
      setOrders(ordersData.orders || []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message || 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="admin-dashboard animate-fade-in">
      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">
                <Sparkles size={20} strokeWidth={1.5} />
                {greeting()}
              </h2>
          <p className="admin-page-sub">
            Here's what's happening at Radiant Wears today.
            {lastRefresh && (
              <span className="admin-last-refresh">
                &nbsp;· Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          className={`admin-refresh-btn ${loading ? 'admin-refresh-btn--spinning' : ''}`}
          onClick={fetchData}
          disabled={loading}
          aria-label="Refresh dashboard"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="admin-banner admin-banner--error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={fetchData} className="admin-banner-retry">Retry</button>
        </div>
      )}

      {/* Stat cards */}
      <div className="admin-stats-grid">
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={stats?.totalOrders}
          sub="All time"
          accent="gold"
          loading={loading}
        />
        <StatCard
          icon={Users}
          label="Newsletter Subscribers"
          value={stats?.totalSubscribers}
          sub="Unique emails"
          accent="purple"
          loading={loading}
        />
        <StatCard
          icon={Package}
          label="Products Listed"
          value={stats?.totalProducts}
          sub="In catalog"
          accent="cyan"
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue (Estimated)"
          value={stats?.estimatedRevenue != null ? `₹${Number(stats.estimatedRevenue).toLocaleString()}` : null}
          sub="From confirmed orders"
          accent="emerald"
          loading={loading}
        />
      </div>

      {/* Recent orders table */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">Recent Orders</h3>
          <span className="admin-section-badge">Last 8</span>
        </div>

        {loading ? (
          <div className="admin-table-skeleton">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="admin-row-skeleton" style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : error ? (
          <div className="admin-empty-state">
            <AlertCircle size={36} strokeWidth={1} style={{ color: '#ef4444' }} />
            <p>Failed to load orders. Please retry.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty-state">
            <ShoppingCart size={36} strokeWidth={1} />
            <p>No orders yet. They'll appear here once customers check out.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th">Order ID</th>
                  <th className="admin-th">Customer</th>
                  <th className="admin-th">Items</th>
                  <th className="admin-th">Total</th>
                  <th className="admin-th">Status</th>
                  <th className="admin-th">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <OrderRow key={o.order_id} order={o} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick status legend */}
      <div className="admin-legend">
        <div className="admin-legend-item">
          <CheckCircle2 size={14} className="admin-legend-icon--confirmed" />
          <span>Confirmed</span>
        </div>
        <div className="admin-legend-item">
          <Clock size={14} className="admin-legend-icon--pending" />
          <span>Pending</span>
        </div>
        <div className="admin-legend-item">
          <AlertCircle size={14} className="admin-legend-icon--error" />
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
}
