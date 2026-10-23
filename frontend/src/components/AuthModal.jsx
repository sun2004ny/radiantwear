import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
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
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalView,
    setAuthModalView,
    currentUser,
    customerLogin,
    customerRegister,
    customerLogout,
    userOrders,
    isUserLoading,
    formatPrice
  } = useShop();

  const navigate = useNavigate();

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState('orders'); // 'orders' | 'details' | 'perks'

  // Clear errors when changing views or opening
  useEffect(() => {
    setErrorMsg('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [authModalView, isAuthModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    if (isAuthModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await customerLogin(loginForm.email, loginForm.password);
      setLoginForm({ email: '', password: '' });
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
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
      setErrorMsg('Password must be at least 6 characters.');
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

  // Helper for initials
  const getInitials = (name) => {
    if (!name) return 'RW';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="auth-modal-overlay animate-fade-in" onClick={closeAuthModal}>
      <div 
        className="auth-modal-container glass-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button 
          className="modal-close-btn"
          onClick={closeAuthModal}
          aria-label="Close Account Modal"
        >
          <X size={20} />
        </button>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* VIEW 1: LOGIN                                               */}
        {/* ──────────────────────────────────────────────────────────── */}
        {authModalView === 'login' && (
          <div className="auth-view-content">
            <div className="auth-header">
              <div className="auth-badge-pill">
                <Sparkles size={13} className="text-gold" />
                <span>RADIANT CLIENTELE</span>
              </div>
              <h2 className="auth-title">WELCOME TO THE ATELIER</h2>
              <p className="auth-subtitle">
                Sign in to manage your silhouettes, order history, and access private drops.
              </p>
            </div>

            {errorMsg && (
              <div className="auth-error-alert animate-shake">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={17} className="auth-input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. alexander@radiant.com"
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
                    placeholder="Enter your password"
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
            </form>

            <div className="auth-footer-prompt">
              <span>New to Radiant Wears?</span>
              <button 
                type="button"
                className="auth-switch-link"
                onClick={() => setAuthModalView('register')}
              >
                Create an Account
              </button>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* VIEW 2: REGISTER                                            */}
        {/* ──────────────────────────────────────────────────────────── */}
        {authModalView === 'register' && (
          <div className="auth-view-content">
            <div className="auth-header">
              <div className="auth-badge-pill">
                <Sparkles size={13} className="text-gold" />
                <span>BESPOKE MEMBERSHIP</span>
              </div>
              <h2 className="auth-title">CREATE AN ACCOUNT</h2>
              <p className="auth-subtitle">
                Join the Radiant Wears Atelier for priority drops, wardrobe tracking, and luxury benefits.
              </p>
            </div>

            {errorMsg && (
              <div className="auth-error-alert animate-shake">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="auth-form">
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
                    <button
                      type="button"
                      className="auth-toggle-pwd"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="auth-input-group flex-1">
                  <label className="auth-label">Confirm Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={17} className="auth-input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="auth-toggle-pwd"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Atelier Perks Summary */}
              <div className="auth-perks-box">
                <div className="auth-perk-item">
                  <CheckCircle2 size={14} className="text-gold" />
                  <span>Complimentary express delivery on limited drops</span>
                </div>
                <div className="auth-perk-item">
                  <CheckCircle2 size={14} className="text-gold" />
                  <span>Private access to seasonal lookbook capsules</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUserLoading}
                className="btn btn-primary auth-submit-btn"
              >
                <span>{isUserLoading ? 'CREATING ATELIER ACCOUNT...' : 'REGISTER & ACCESS PROFILE'}</span>
                {!isUserLoading && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="auth-footer-prompt">
              <span>Already have an account?</span>
              <button 
                type="button"
                className="auth-switch-link"
                onClick={() => setAuthModalView('login')}
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* VIEW 3: PROFILE / ACCOUNT AREA                              */}
        {/* ──────────────────────────────────────────────────────────── */}
        {authModalView === 'profile' && currentUser && (
          <div className="auth-view-content profile-view-content">
            {/* Profile Hero Header */}
            <div className="profile-hero-card">
              <div className="profile-avatar-large">
                <span>{getInitials(currentUser.name)}</span>
                <span className="profile-avatar-ring" />
              </div>
              <div className="profile-identity">
                <div className="profile-role-badge">
                  <Sparkles size={12} />
                  <span>{currentUser.role === 'admin' ? 'ATELIER CURATOR & ADMIN' : 'VIP ATELIER MEMBER'}</span>
                </div>
                <h3 className="profile-user-name">{currentUser.name}</h3>
                <p className="profile-user-email">{currentUser.email}</p>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="profile-nav-tabs">
              <button
                className={`profile-tab-btn ${activeProfileTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveProfileTab('orders')}
              >
                <Package size={15} />
                <span>Orders ({userOrders.length})</span>
              </button>
              <button
                className={`profile-tab-btn ${activeProfileTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveProfileTab('details')}
              >
                <User size={15} />
                <span>Account Info</span>
              </button>
              <button
                className={`profile-tab-btn ${activeProfileTab === 'perks' ? 'active' : ''}`}
                onClick={() => setActiveProfileTab('perks')}
              >
                <Tag size={15} />
                <span>Member Privileges</span>
              </button>
            </div>

            {/* Tab 1: Orders */}
            {activeProfileTab === 'orders' && (
              <div className="profile-tab-pane animate-fade-in">
                {userOrders && userOrders.length > 0 ? (
                  <div className="profile-orders-list">
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
                            {itemsList.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="order-item-chip">
                                {item.image && <img src={item.image} alt={item.name} className="order-chip-img" />}
                                <span className="order-chip-title">{item.name}</span>
                                <span className="order-chip-qty">×{item.quantity || 1}</span>
                              </div>
                            ))}
                            {itemsList.length > 3 && (
                              <span className="order-chip-more">+{itemsList.length - 3} more</span>
                            )}
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
                  <div className="profile-empty-orders">
                    <Package size={38} className="text-gold" />
                    <h4>Your Wardrobe is Awaiting Its First Piece</h4>
                    <p>You haven't placed any orders yet. Discover our curated seasonal silhouettes.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        closeAuthModal();
                        const el = document.getElementById('catalog');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      EXPLORE CATALOG
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Account Details */}
            {activeProfileTab === 'details' && (
              <div className="profile-tab-pane animate-fade-in">
                <div className="profile-details-grid">
                  <div className="profile-detail-card">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">{currentUser.name}</span>
                  </div>
                  <div className="profile-detail-card">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-value">{currentUser.email}</span>
                  </div>
                  <div className="profile-detail-card">
                    <span className="detail-label">Membership Tier</span>
                    <span className="detail-value text-gold">Radiant Haute Elite</span>
                  </div>
                  <div className="profile-detail-card">
                    <span className="detail-label">Account Security</span>
                    <span className="detail-value text-green">
                      <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px' }} />
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
                  <div className="perk-card">
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

                  <div className="perk-card">
                    <div className="perk-info">
                      <span className="perk-title">Complimentary Delivery</span>
                      <span className="perk-desc">Free express courier on any cart value</span>
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

            {/* Profile Footer Actions */}
            <div className="profile-footer-actions">
              {currentUser.role === 'admin' && (
                <button
                  className="btn btn-outline admin-portal-btn"
                  onClick={() => {
                    closeAuthModal();
                    navigate('/admin-panel/dashboard');
                  }}
                >
                  <ExternalLink size={15} />
                  <span>ENTER ADMIN CONSOLE</span>
                </button>
              )}

              <button
                className="btn btn-logout"
                onClick={customerLogout}
              >
                <LogOut size={15} />
                <span>SIGN OUT OF ACCOUNT</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
