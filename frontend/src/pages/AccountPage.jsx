import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { CURRENCIES } from '../data/products';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  LogOut, 
  Package, 
  Tag, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sun,
  Moon
} from 'lucide-react';

export default function AccountPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    currentUser,
    customerLogin,
    customerRegister,
    customerLogout,
    userOrders,
    isUserLoading,
    formatPrice,
    theme,
    toggleTheme,
    currency,
    setCurrency
  } = useShop();

  // Mode: 'login' | 'register'
  const modeParam = searchParams.get('mode');
  const [authMode, setAuthMode] = useState(modeParam === 'register' ? 'register' : 'login');

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState('orders'); // 'orders' | 'details' | 'perks'

  // Sync mode with URL query if changed
  useEffect(() => {
    if (modeParam === 'register') {
      setAuthMode('register');
    } else if (modeParam === 'login') {
      setAuthMode('login');
    }
  }, [modeParam]);

  // Clear errors when toggling modes
  useEffect(() => {
    setErrorMsg('');
    setShowPassword(false);
  }, [authMode]);

  const handleModeSwitch = (mode) => {
    setAuthMode(mode);
    setSearchParams({ mode });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await customerLogin(loginForm.email, loginForm.password);
      setLoginForm({ email: '', password: '' });
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (registerForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      await customerRegister(registerForm.name, registerForm.email, registerForm.password);
      setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getInitials = (name) => {
    if (!name) return 'RW';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="account-page-wrapper">
      {/* ── Top Bar Header ────────────────────────────────────────── */}
      <header className="account-top-bar glass-card">
        <div className="container account-top-container">
          <Link to="/" className="account-brand-logo">
            <div className="logo-emblem">
              <svg viewBox="0 0 100 100" className="emblem-svg">
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.4" />
                <polygon points="50,15 60,38 85,42 66,58 72,82 50,70 28,82 34,58 15,42 40,38" fill="var(--accent-gold)" />
              </svg>
            </div>
            <div className="logo-text-group">
              <span className="logo-title">RADIANT</span>
              <span className="logo-subtitle">WEARS</span>
            </div>
          </Link>

          <div className="account-top-actions">
            <Link to="/" className="btn-back-to-shop">
              <ArrowLeft size={16} />
              <span>RETURN TO STOREFRONT</span>
            </Link>

            {/* Currency Selector */}
            <div className="currency-selector-wrapper">
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                className="currency-select"
                aria-label="Select Currency"
              >
                {Object.keys(CURRENCIES).map((cur) => (
                  <option key={cur} value={cur}>
                    {cur} ({CURRENCIES[cur].symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle */}
            <button 
              className="action-btn theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Body ─────────────────────────────────────────────── */}
      <main className="account-main-content">
        <div className="container">
          {!currentUser ? (
            /* ──────────────────────────────────────────────────────── */
            /* UNLOGGED STATE: LOGIN / CREATE AN ACCOUNT PAGE           */
            /* ──────────────────────────────────────────────────────── */
            <div className="account-auth-grid animate-fade-in">
              {/* Left Column: Brand & Atelier Perks Banner */}
              <div className="account-perks-showcase glass-card">
                <div className="showcase-glow" />
                <div className="showcase-content">
                  <div className="auth-badge-pill">
                    <Sparkles size={13} className="text-gold" />
                    <span>RADIANT CLIENTELE</span>
                  </div>
                  <h1 className="showcase-title">HAUTE STREETWEAR ATELIER</h1>
                  <p className="showcase-subtitle">
                    Step into an exclusive sanctuary of architectural silhouettes, organic heavyweight textiles, and bespoke tailoring.
                  </p>

                  <div className="showcase-features-list">
                    <div className="showcase-feature-item">
                      <div className="feature-icon-circle">
                        <CheckCircle2 size={16} className="text-gold" />
                      </div>
                      <div>
                        <h4>Complimentary Express Shipping</h4>
                        <p>Receive express courier dispatch on all curated drops worldwide.</p>
                      </div>
                    </div>

                    <div className="showcase-feature-item">
                      <div className="feature-icon-circle">
                        <CheckCircle2 size={16} className="text-gold" />
                      </div>
                      <div>
                        <h4>Private Lookbook Capsules</h4>
                        <p>Enjoy 48-hour priority reservation on limited release garments.</p>
                      </div>
                    </div>

                    <div className="showcase-feature-item">
                      <div className="feature-icon-circle">
                        <CheckCircle2 size={16} className="text-gold" />
                      </div>
                      <div>
                        <h4>Wardrobe Tracking & Atelier Care</h4>
                        <p>Monitor your bespoke order status and lifetime fabric care guidelines.</p>
                      </div>
                    </div>
                  </div>

                  <div className="showcase-quote-box">
                    <p className="quote-text">
                      "Perfection is not when there is nothing more to add, but when there is nothing left to take away."
                    </p>
                    <span className="quote-author">— RADIANT ATELIER MANIFESTO</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Form Box */}
              <div className="account-form-box glass-card">
                {/* Mode Switcher Tabs */}
                <div className="auth-mode-tabs">
                  <button 
                    className={`auth-mode-tab ${authMode === 'login' ? 'active' : ''}`}
                    onClick={() => handleModeSwitch('login')}
                  >
                    <span>SIGN IN</span>
                  </button>
                  <button 
                    className={`auth-mode-tab ${authMode === 'register' ? 'active' : ''}`}
                    onClick={() => handleModeSwitch('register')}
                  >
                    <span>CREATE AN ACCOUNT</span>
                  </button>
                </div>

                {errorMsg && (
                  <div className="auth-error-alert animate-shake">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {authMode === 'login' ? (
                  /* ── Form: Login ── */
                  <form onSubmit={handleLoginSubmit} className="auth-form animate-fade-in">
                    <div className="auth-box-header">
                      <h2 className="auth-box-title">WELCOME BACK</h2>
                      <p className="auth-box-desc">
                        Sign in to access your wardrobe, track orders, and view private drops.
                      </p>
                    </div>

                    <div className="auth-input-group">
                      <label className="auth-label">Email Address</label>
                      <div className="auth-input-wrapper">
                        <Mail size={17} className="auth-input-icon" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. alexander@radiant.design"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="auth-input"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <div className="auth-label-row">
                        <label className="auth-label">Password</label>
                      </div>
                      <div className="auth-input-wrapper">
                        <Lock size={17} className="auth-input-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Enter your account password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="auth-input"
                        />
                        <button
                          type="button"
                          className="auth-toggle-pwd"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex="-1"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUserLoading}
                      className="btn btn-primary auth-submit-btn"
                    >
                      <span>{isUserLoading ? 'AUTHENTICATING...' : 'SIGN IN TO ATELIER'}</span>
                      {!isUserLoading && <ArrowRight size={16} />}
                    </button>

                    <div className="auth-footer-prompt">
                      <span>Don't have an atelier account?</span>
                      <button 
                        type="button"
                        className="auth-switch-link"
                        onClick={() => handleModeSwitch('register')}
                      >
                        Create an Account
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ── Form: Register ── */
                  <form onSubmit={handleRegisterSubmit} className="auth-form animate-fade-in">
                    <div className="auth-box-header">
                      <h2 className="auth-box-title">CREATE AN ACCOUNT</h2>
                      <p className="auth-box-desc">
                        Register your client profile for bespoke drops and exclusive privileges.
                      </p>
                    </div>

                    <div className="auth-input-group">
                      <label className="auth-label">Full Name</label>
                      <div className="auth-input-wrapper">
                        <User size={17} className="auth-input-icon" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Christian Dior"
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                          className="auth-input"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label className="auth-label">Email Address</label>
                      <div className="auth-input-wrapper">
                        <Mail size={17} className="auth-input-icon" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. christian@fashion.com"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className="auth-input"
                        />
                      </div>
                    </div>

                    <div className="auth-form-row">
                      <div className="auth-input-group flex-1">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrapper">
                          <Lock size={17} className="auth-input-icon" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Min 6 characters"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                            className="auth-input"
                          />
                        </div>
                      </div>

                      <div className="auth-input-group flex-1">
                        <label className="auth-label">Confirm Password</label>
                        <div className="auth-input-wrapper">
                          <Lock size={17} className="auth-input-icon" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Repeat password"
                            value={registerForm.confirmPassword}
                            onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                            className="auth-input"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUserLoading}
                      className="btn btn-primary auth-submit-btn"
                    >
                      <span>{isUserLoading ? 'CREATING CLIENT ACCOUNT...' : 'REGISTER & ACCESS PROFILE'}</span>
                      {!isUserLoading && <ArrowRight size={16} />}
                    </button>

                    <div className="auth-footer-prompt">
                      <span>Already registered with Radiant?</span>
                      <button 
                        type="button"
                        className="auth-switch-link"
                        onClick={() => handleModeSwitch('login')}
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : (
            /* ──────────────────────────────────────────────────────── */
            /* LOGGED IN STATE: FULL DEDICATED PROFILE PAGE             */
            /* ──────────────────────────────────────────────────────── */
            <div className="account-profile-page animate-fade-in">
              {/* Profile Top Banner */}
              <div className="profile-hero-card glass-card">
                <div className="profile-avatar-large">
                  <span>{getInitials(currentUser.name)}</span>
                  <span className="profile-avatar-ring" />
                </div>
                <div className="profile-identity">
                  <div className="profile-role-badge">
                    <Sparkles size={13} />
                    <span>{currentUser.role === 'admin' ? 'ATELIER CURATOR & ADMIN' : 'VIP ATELIER MEMBER'}</span>
                  </div>
                  <h2 className="profile-user-name">{currentUser.name}</h2>
                  <p className="profile-user-email">{currentUser.email}</p>
                </div>

                <div className="profile-header-actions-right">
                  {currentUser.role === 'admin' && (
                    <button
                      className="btn btn-outline admin-header-btn"
                      onClick={() => navigate('/admin-panel/dashboard')}
                    >
                      <ExternalLink size={15} />
                      <span>ADMIN CONSOLE</span>
                    </button>
                  )}

                  <button
                    className="btn btn-logout"
                    onClick={() => {
                      customerLogout();
                      handleModeSwitch('login');
                    }}
                  >
                    <LogOut size={15} />
                    <span>LOGOUT</span>
                  </button>
                </div>
              </div>

              {/* Profile Nav Tabs */}
              <div className="profile-tabs-container">
                <div className="profile-nav-tabs">
                  <button
                    className={`profile-tab-btn ${activeProfileTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveProfileTab('orders')}
                  >
                    <Package size={16} />
                    <span>Wardrobe Orders ({userOrders.length})</span>
                  </button>
                  <button
                    className={`profile-tab-btn ${activeProfileTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveProfileTab('details')}
                  >
                    <User size={16} />
                    <span>Account Profile</span>
                  </button>
                  <button
                    className={`profile-tab-btn ${activeProfileTab === 'perks' ? 'active' : ''}`}
                    onClick={() => setActiveProfileTab('perks')}
                  >
                    <Tag size={16} />
                    <span>Member Privileges</span>
                  </button>
                </div>

                {/* Tab 1: Orders */}
                {activeProfileTab === 'orders' && (
                  <div className="profile-tab-pane animate-fade-in">
                    {userOrders && userOrders.length > 0 ? (
                      <div className="profile-orders-grid">
                        {userOrders.map((ord) => {
                          const totalFormatted = ord.totals?.total 
                            ? formatPrice(ord.totals.total) 
                            : (ord.totals?.subtotal ? formatPrice(ord.totals.subtotal) : '—');
                          const itemsList = Array.isArray(ord.items) ? ord.items : [];
                          const createdDate = ord.created_at ? new Date(ord.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'Recent';

                          return (
                            <div key={ord.order_id} className="profile-order-item glass-card">
                              <div className="order-item-header">
                                <div>
                                  <span className="order-id-label">ORDER #{ord.order_id}</span>
                                  <span className="order-date-label">{createdDate}</span>
                                </div>
                                <span className={`order-status-pill status-${(ord.status || 'confirmed').toLowerCase()}`}>
                                  {ord.status || 'CONFIRMED'}
                                </span>
                              </div>

                              <div className="order-items-preview">
                                {itemsList.map((item, idx) => (
                                  <div key={idx} className="order-item-chip">
                                    {item.image && <img src={item.image} alt={item.name} className="order-chip-img" />}
                                    <span className="order-chip-title">{item.name}</span>
                                    <span className="order-chip-qty">×{item.quantity || 1}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="order-item-footer">
                                <span className="order-delivery-est">
                                  Est. Delivery: {ord.estimated_delivery || '2-4 Business Days'}
                                </span>
                                <span className="order-total-price">{totalFormatted}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="profile-empty-orders glass-card">
                        <Package size={44} className="text-gold" />
                        <h3>Your Wardrobe is Awaiting Its First Silhouette</h3>
                        <p>You haven't placed any orders yet. Discover our curated seasonal garments.</p>
                        <button 
                          className="btn btn-primary"
                          onClick={() => navigate('/#catalog')}
                        >
                          DISCOVER PIECES
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Account Details */}
                {activeProfileTab === 'details' && (
                  <div className="profile-tab-pane animate-fade-in">
                    <div className="profile-details-grid">
                      <div className="profile-detail-card glass-card">
                        <span className="detail-label">Client Name</span>
                        <span className="detail-value">{currentUser.name}</span>
                      </div>
                      <div className="profile-detail-card glass-card">
                        <span className="detail-label">Client Email</span>
                        <span className="detail-value">{currentUser.email}</span>
                      </div>
                      <div className="profile-detail-card glass-card">
                        <span className="detail-label">Membership Tier</span>
                        <span className="detail-value text-gold">Radiant Haute Elite</span>
                      </div>
                      <div className="profile-detail-card glass-card">
                        <span className="detail-label">Account Security</span>
                        <span className="detail-value text-green">
                          <ShieldCheck size={15} style={{ display: 'inline', marginRight: '4px' }} />
                          Verified & Active
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Privileges */}
                {activeProfileTab === 'perks' && (
                  <div className="profile-tab-pane animate-fade-in">
                    <div className="perks-list">
                      <div className="perk-card glass-card">
                        <div className="perk-info">
                          <span className="perk-title">VIP Client Privilege</span>
                          <span className="perk-desc">Enjoy 25% off all seasonal drops</span>
                        </div>
                        <button 
                          className="btn-copy-code"
                          onClick={() => handleCopyCode('VIPGOLD')}
                        >
                          {copiedCode === 'VIPGOLD' ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedCode === 'VIPGOLD' ? 'COPIED' : 'VIPGOLD'}</span>
                        </button>
                      </div>

                      <div className="perk-card glass-card">
                        <div className="perk-info">
                          <span className="perk-title">Complimentary Express Delivery</span>
                          <span className="perk-desc">Free express courier on any order value</span>
                        </div>
                        <button 
                          className="btn-copy-code"
                          onClick={() => handleCopyCode('FREESHIP')}
                        >
                          {copiedCode === 'FREESHIP' ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedCode === 'FREESHIP' ? 'COPIED' : 'FREESHIP'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
