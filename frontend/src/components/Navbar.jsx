import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X,
  User,
  Zap
} from 'lucide-react';


export const Navbar = () => {
  const {
    cartItemCount,
    cartSubtotal,
    formatPrice,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    setSelectedCategory,
    currentUser
  } = useShop();

  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const navLinks = [
    { label: 'Loadouts', href: '#catalog', category: 'all' },
    { label: 'Outerwear', href: '#catalog', category: 'outerwear' },
    { label: 'Hoodies', href: '#catalog', category: 'hoodies' },
    { label: 'Battlefield', href: '#lookbook' },
    { label: 'Hardware Specs', href: '#sustainability' },
    { label: 'Clan Logs', href: '#reviews' }
  ];

  const handleNavClick = (link) => {
    if (link.category) {
      setSelectedCategory(link.category);
    }
    setIsMobileMenuOpen(false);
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
    <header className="navbar-wrapper">
      {/* Main Glass Navbar */}
      <nav className={`main-navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="nav-container">
          {/* Mobile Menu Button */}
          <button 
            className="mobile-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Brand Logo */}
          <a href="#" className="brand-logo">
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
          </a>

          {/* Desktop Nav Links — removed from top bar */}

          {/* Right Action Icons */}
          <div className="nav-actions">
            {/* Search Trigger */}
            <button 
              className="action-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              title="Search catalog"
              aria-label="Search catalog"
            >
              <Search size={20} />
            </button>



            {/* Wishlist Button */}
            <button 
              className="action-btn wishlist-btn"
              onClick={() => setIsWishlistOpen(true)}
              title="View Wishlist"
              aria-label="View Wishlist"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="count-badge wishlist-badge">{wishlist.length}</span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              className="cart-trigger-btn"
              onClick={() => setIsCartOpen(true)}
              title="Open Shopping Cart"
              aria-label="Open Shopping Bag"
            >
              <div className="cart-icon-wrap">
                <ShoppingBag size={19} />
                {cartItemCount > 0 && (
                  <span className="count-badge cart-badge">{cartItemCount}</span>
                )}
              </div>
              <span className="cart-total-text">
                {cartSubtotal > 0 ? formatPrice(cartSubtotal) : 'BAG'}
              </span>
            </button>

            {/* Dynamic Customer Login / Profile Button */}
            {!currentUser ? (
              <button 
                className="nav-auth-btn"
                onClick={() => navigate('/account?mode=login')}
                title="Sign in to your Radiant account"
                aria-label="Account Login"
              >
                <User size={16} />
                <span>LOGIN</span>
              </button>
            ) : (
              <button 
                className="nav-profile-avatar-btn"
                onClick={() => navigate('/account')}
                title={`${currentUser.name} — Atelier Profile`}
                aria-label="Open Account Profile"
              >
                <span className="nav-profile-initials">{getInitials(currentUser.name)}</span>
                <span className="nav-profile-online-dot" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Search Bar */}
        {isSearchOpen && (
          <div className="search-expand-bar animate-fade-in">
            <div className="search-container">
              <Search size={20} className="search-icon-inside" />
              <input 
                type="text" 
                placeholder="Search jackets, hoodies, tees, knitwear, trousers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
              {searchQuery && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={16} />
                </button>
              )}
              <button 
                className="close-search-btn"
                onClick={() => setIsSearchOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-menu-backdrop animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-drawer animate-fade-in">
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">// NAVIGATION MATRIX</span>
              <button 
                className="mobile-menu-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mobile-links-list">
              {navLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  className="mobile-nav-link"
                  onClick={() => handleNavClick(link)}
                >
                  <span className="mobile-link-text">{link.label}</span>
                  <span className="mobile-link-index">0{idx + 1} //</span>
                </a>
              ))}
            </div>

            <div className="mobile-menu-footer">
              <div className="mobile-drawer-actions">
                <button 
                  className="mobile-drawer-btn mobile-auth-btn" 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate(currentUser ? '/account' : '/account?mode=login');
                  }}
                >
                  <User size={16} />
                  <span>{currentUser ? `PROFILE (${currentUser.name.split(' ')[0]})` : 'SIGN IN / REGISTER'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Sticky Gaming HUD Dock */}
      <div className="mobile-cyber-dock">
        <a href="#catalog" className="dock-item" onClick={() => setSelectedCategory('all')}>
          <Zap size={18} />
          <span>LOADOUT</span>
        </a>
        <button className="dock-item" onClick={() => setIsSearchOpen(true)} aria-label="Search">
          <Search size={18} />
          <span>RADAR</span>
        </button>
        <button className="dock-item" onClick={() => setIsWishlistOpen(true)} aria-label="Wishlist">
          <div className="dock-icon-wrap">
            <Heart size={18} />
            {wishlist.length > 0 && <span className="dock-badge">{wishlist.length}</span>}
          </div>
          <span>QUESTS</span>
        </button>
        <button className="dock-item dock-item-cart" onClick={() => setIsCartOpen(true)} aria-label="Shopping Bag">
          <div className="dock-icon-wrap">
            <ShoppingBag size={18} />
            {cartItemCount > 0 && <span className="dock-badge dock-badge-cart">{cartItemCount}</span>}
          </div>
          <span>INVENTORY</span>
        </button>
        <button className="dock-item" onClick={() => navigate(currentUser ? '/account' : '/account?mode=login')} aria-label="Account">
          <User size={18} />
          <span>{currentUser ? 'PLAYER' : 'LOGIN'}</span>
        </button>
      </div>
    </header>
  );
};
