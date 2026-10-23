import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CURRENCIES, PROMO_CODES } from '../data/products';
import apiFetch from '../lib/api';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  // Database-driven Products State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const refreshProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const res = await apiFetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products from database');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('[ShopContext] Error fetching products:', err);
      setProductsError(err.message || 'Error fetching catalog');
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('rw_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rw_theme', theme);
  }, [theme]);

  // Chroma RGB Gaming Theme State
  const [chromaMode, setChromaMode] = useState(() => {
    return localStorage.getItem('rw_chroma') || 'cyan'; // 'cyan' | 'green' | 'purple' | 'red' | 'spectrum'
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-chroma', chromaMode);
    localStorage.setItem('rw_chroma', chromaMode);
  }, [chromaMode]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Currency State
  const [currency, setCurrency] = useState('INR');
  const currencyInfo = CURRENCIES[currency] || CURRENCIES.INR;

  const formatPrice = (usdAmount) => {
    const converted = usdAmount * currencyInfo.rate;
    return `${currencyInfo.symbol}${Math.round(converted).toLocaleString()}`;
  };

  // Cart State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('rw_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('rw_cart', JSON.stringify(cart));
  }, [cart]);

  // Wishlist State
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('rw_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('rw_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Promo Code State
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ── Customer Auth State ──────────────────────────────────────────────────
  const CUSTOMER_USER_KEY  = 'rw_customer_user';
  const CUSTOMER_TOKEN_KEY = 'rw_customer_token';

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(CUSTOMER_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState(() => {
    try {
      return localStorage.getItem(CUSTOMER_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login'); // 'login' | 'register' | 'profile'
  const [userOrders, setUserOrders] = useState([]);
  const [isUserLoading, setIsUserLoading] = useState(false);

  // Sync token & profile on mount or token change
  const fetchUserProfile = useCallback(async (tokenToUse) => {
    const token = tokenToUse || authToken;
    if (!token) return;

    try {
      setIsUserLoading(true);
      const res = await apiFetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem(CUSTOMER_USER_KEY);
          localStorage.removeItem(CUSTOMER_TOKEN_KEY);
          setCurrentUser(null);
          setAuthToken(null);
          setUserOrders([]);
        }
        return;
      }

      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setUserOrders(data.orders || []);
        localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(data.user));
      }
    } catch (err) {
      console.warn('[ShopContext] Failed to refresh user profile:', err);
    } finally {
      setIsUserLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    if (authToken) {
      fetchUserProfile(authToken);
    }
  }, [authToken, fetchUserProfile]);

  const openAuthModal = useCallback((view = null) => {
    if (view) {
      setAuthModalView(view);
    } else {
      setAuthModalView(currentUser ? 'profile' : 'login');
    }
    setIsAuthModalOpen(true);
  }, [currentUser]);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const customerLogin = useCallback(async (email, password) => {
    setIsUserLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(data.user));
      localStorage.setItem(CUSTOMER_TOKEN_KEY, data.token);
      setCurrentUser(data.user);
      setAuthToken(data.token);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      setAuthModalView('profile');
      fetchUserProfile(data.token);
      return data.user;
    } finally {
      setIsUserLoading(false);
    }
  }, [addToast, fetchUserProfile]);

  const customerRegister = useCallback(async (name, email, password) => {
    setIsUserLoading(true);
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(data.user));
      localStorage.setItem(CUSTOMER_TOKEN_KEY, data.token);
      setCurrentUser(data.user);
      setAuthToken(data.token);
      addToast(`Welcome to Radiant Atelier, ${data.user.name}!`, 'success');
      setAuthModalView('profile');
      return data.user;
    } finally {
      setIsUserLoading(false);
    }
  }, [addToast]);

  const customerLogout = useCallback(() => {
    localStorage.removeItem(CUSTOMER_USER_KEY);
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    setCurrentUser(null);
    setAuthToken(null);
    setUserOrders([]);
    setIsAuthModalOpen(false);
    addToast('You have been signed out.', 'info');
  }, [addToast]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('featured');
  const [maxPriceFilter, setMaxPriceFilter] = useState(null);

  // Cart Actions
  const addToCart = (product, size, color, quantity = 1) => {
    const chosenSize = size || product.sizes[0] || 'Standard';
    const chosenColor = color || (product.colors && product.colors[0]?.name) || 'Original';
    const cartItemId = `${product.id}-${chosenSize}-${chosenColor}`;

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          size: chosenSize,
          color: chosenColor,
          quantity
        }
      ];
    });

    addToast(`Added "${product.name}" (${chosenSize}) to cart!`, 'success');
  };

  const updateCartQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist Actions
  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        addToast(`Removed "${product.name}" from wishlist`, 'info');
        return prev.filter(item => item.id !== product.id);
      } else {
        addToast(`Saved "${product.name}" to wishlist!`, 'success');
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  // Promo Code Application
  const applyPromoCode = (code) => {
    setPromoError('');
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    if (PROMO_CODES[cleanCode]) {
      setAppliedPromo({ code: cleanCode, ...PROMO_CODES[cleanCode] });
      addToast(`Promo code "${cleanCode}" applied successfully!`, 'success');
    } else {
      setPromoError('Invalid promo code.');
      addToast('Invalid promo code', 'error');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoError('');
    addToast('Promo code removed', 'info');
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingThreshold = 150;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold || appliedPromo?.freeShipping;
  
  let discountAmount = 0;
  if (appliedPromo?.discountPercent) {
    discountAmount = (cartSubtotal * appliedPromo.discountPercent) / 100;
  }

  const shippingCost = cart.length === 0 ? 0 : isFreeShipping ? 0 : 15;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  // Quick View Modal
  const openProductModal = (product) => {
    setActiveModalProduct(product);
  };

  const closeProductModal = () => {
    setActiveModalProduct(null);
  };

  return (
    <ShopContext.Provider
      value={{
        theme,
        toggleTheme,
        currency,
        setCurrency,
        currencyInfo,
        formatPrice,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartItemCount,
        cartTotal,
        discountAmount,
        shippingCost,
        isFreeShipping,
        freeShippingThreshold,
        appliedPromo,
        promoError,
        applyPromoCode,
        removePromoCode,
        wishlist,
        toggleWishlist,
        isInWishlist,
        toasts,
        addToast,
        removeToast,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        activeModalProduct,
        openProductModal,
        closeProductModal,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortOption,
        setSortOption,
        maxPriceFilter,
        setMaxPriceFilter,
        products,
        productsLoading,
        productsError,
        refreshProducts,
        currentUser,
        authToken,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalView,
        setAuthModalView,
        openAuthModal,
        closeAuthModal,
        customerLogin,
        customerRegister,
        customerLogout,
        userOrders,
        isUserLoading,
        fetchUserProfile,
        chromaMode,
        setChromaMode
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
