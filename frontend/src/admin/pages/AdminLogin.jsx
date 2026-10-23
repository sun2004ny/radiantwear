import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, Loader } from 'lucide-react';
import './AdminLogin.css';

export default function AdminLogin() {
  const { login, isAuthenticated, loginError, setLoginError, isLoggingIn } = useAdmin();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Already authenticated → go straight to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate('/admin-panel/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Clear server error when user starts typing
  useEffect(() => {
    if (loginError) setLoginError('');
  }, [email, password]); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    const ok = await login(email.trim(), password);
    if (ok) navigate('/admin-panel/dashboard', { replace: true });
  };

  return (
    <div className="admin-login-page">
      {/* Background glow spheres */}
      <div className="admin-glow admin-glow--tl" />
      <div className="admin-glow admin-glow--br" />

      <div className="admin-login-card animate-fade-in">
        {/* Header */}
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <ShieldCheck size={28} strokeWidth={1.5} />
          </div>
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="admin-login-subtitle">RADIANT WEARS — Restricted Access</p>
        </div>

        {/* Server / auth error */}
        {loginError && (
          <div className="admin-alert admin-alert--error">
            <AlertCircle size={16} />
            <span>{loginError}</span>
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className={`admin-field ${errors.email ? 'admin-field--error' : ''}`}>
            <label className="admin-label" htmlFor="admin-email">Admin Email</label>
            <div className="admin-input-wrap">
              <Mail size={16} className="admin-input-icon" />
              <input
                id="admin-email"
                type="email"
                className="admin-input"
                placeholder="admin@radiantwears.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
            {errors.email && <p className="admin-field-error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className={`admin-field ${errors.password ? 'admin-field--error' : ''}`}>
            <label className="admin-label" htmlFor="admin-password">Password</label>
            <div className="admin-input-wrap">
              <Lock size={16} className="admin-input-icon" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="admin-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-input-toggle"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="admin-field-error">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <Loader size={16} className="admin-spinner" />
                Authenticating…
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                Sign In to Admin Panel
              </>
            )}
          </button>
        </form>

        <p className="admin-login-footer">
          This area is restricted to authorised personnel only.
        </p>
      </div>
    </div>
  );
}
