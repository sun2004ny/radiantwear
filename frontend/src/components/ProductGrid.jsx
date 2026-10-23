import React, { useMemo, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { CategoryPills } from './CategoryPills';
import { ArrowUpDown, Search, RotateCcw, Sparkles, RefreshCw, PackageOpen, LayoutGrid, Grid3X3, Zap, Flame } from 'lucide-react';

export const ProductGrid = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    maxPriceFilter,
    setMaxPriceFilter,
    formatPrice,
    products,
    productsLoading,
    productsError,
    refreshProducts
  } = useShop();

  const [viewMode, setViewMode] = useState('tactical'); // 'tactical' (4 cols) or 'showcase' (2 cols)
  const [quickBadge, setQuickBadge] = useState('all');

  const allProducts = products || [];

  // Calculate dynamic highest price across catalog (default minimum 1000)
  const highestCatalogPrice = useMemo(() => {
    if (!allProducts.length) return 1000;
    const maxVal = Math.max(...allProducts.map(p => Number(p.price) || 0));
    return Math.max(Math.ceil(maxVal / 50) * 50, 1000);
  }, [allProducts]);

  const currentMaxPrice = maxPriceFilter !== null ? maxPriceFilter : highestCatalogPrice;

  // Filtered and Sorted Products from Database
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      // Category Match
      const matchesCategory = selectedCategory === 'all' || (p.category || '').toLowerCase() === selectedCategory.toLowerCase();

      // Search Query Match
      const matchesSearch = searchQuery
        ? (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.productType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.tag || '').toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // Price Match
      const matchesPrice = maxPriceFilter !== null ? Number(p.price) <= maxPriceFilter : true;

      // Quick Badge Filter
      let matchesBadge = true;
      if (quickBadge === 'limited') matchesBadge = (p.badge || '').toLowerCase().includes('limited');
      if (quickBadge === 'new') matchesBadge = (p.badge || '').toLowerCase().includes('new');
      if (quickBadge === 'under150') matchesBadge = Number(p.price) <= 150;

      return matchesCategory && matchesSearch && matchesPrice && matchesBadge;
    }).sort((a, b) => {
      if (sortOption === 'price-low') return a.price - b.price;
      if (sortOption === 'price-high') return b.price - a.price;
      if (sortOption === 'rating') return (b.rating || 5) - (a.rating || 5);
      if (sortOption === 'reviews') return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      return 0;
    });
  }, [allProducts, selectedCategory, searchQuery, sortOption, maxPriceFilter, quickBadge]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortOption('featured');
    setMaxPriceFilter(null);
    setQuickBadge('all');
  };

  return (
    <section id="catalog" className="catalog-section full-screen-catalog">
      <div className="catalog-full-container">
        {/* Section Header */}
        <div className="section-header section-header--left">
          <span className="section-eyebrow">INVENTORY PROTOCOL // TOURNAMENT LOADOUT</span>
          <h2 className="section-title">GAMING ARSENAL // LOOT DROPS</h2>
          <p className="section-description">
            High-performance esports streetwear engineered with CoolMax anti-sweat weave, reactive Chroma RGB fiber optics, and tournament cuts.
          </p>
        </div>

        {/* Category Pills */}
        <CategoryPills />

        {/* Quick Filter Tag Chips Bar */}
        <div className="quick-filter-strip">
          <span className="strip-title">FILTER LOOT:</span>
          <button 
            className={`quick-tag-chip ${quickBadge === 'all' ? 'active' : ''}`}
            onClick={() => setQuickBadge('all')}
          >
            <span>ALL GEAR</span>
          </button>
          <button 
            className={`quick-tag-chip ${quickBadge === 'limited' ? 'active' : ''}`}
            onClick={() => setQuickBadge('limited')}
          >
            <Flame size={12} />
            <span>LEGENDARY DROPS</span>
          </button>
          <button 
            className={`quick-tag-chip ${quickBadge === 'new' ? 'active' : ''}`}
            onClick={() => setQuickBadge('new')}
          >
            <Sparkles size={12} />
            <span>MYTHIC RELEASES</span>
          </button>
          <button 
            className={`quick-tag-chip ${quickBadge === 'under150' ? 'active' : ''}`}
            onClick={() => setQuickBadge('under150')}
          >
            <Zap size={12} />
            <span>STARTER LOOT [UNDER $150]</span>
          </button>
        </div>

        {/* Filters & Sorting Controls Bar */}
        <div className="catalog-controls-bar glass-card">
          {/* Active Results Count */}
          <div className="results-count-group">
            <span className="count-number">
              {productsLoading ? '—' : filteredProducts.length}
            </span>
            <span className="count-label">
              {filteredProducts.length === 1 ? 'Item in Loadout' : 'Items in Loadout'}
            </span>
            {searchQuery && (
              <span className="search-tag-pill">
                Query: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="remove-tag-btn">×</button>
              </span>
            )}
            {quickBadge !== 'all' && (
              <span className="search-tag-pill">
                Tag: {quickBadge.toUpperCase()}
                <button onClick={() => setQuickBadge('all')} className="remove-tag-btn">×</button>
              </span>
            )}
          </div>

          {/* Right Controls: View Mode, Slider & Sort */}
          <div className="controls-right-group">
            {/* View Mode Toggle */}
            <div className="view-mode-toggle-group">
              <button 
                className={`view-toggle-btn ${viewMode === 'tactical' ? 'active' : ''}`}
                onClick={() => setViewMode('tactical')}
                title="Tactical Grid View (Compact)"
                aria-label="Tactical Grid View"
              >
                <Grid3X3 size={16} />
                <span>4-COL</span>
              </button>
              <button 
                className={`view-toggle-btn ${viewMode === 'showcase' ? 'active' : ''}`}
                onClick={() => setViewMode('showcase')}
                title="Showcase View (Large)"
                aria-label="Showcase View"
              >
                <LayoutGrid size={16} />
                <span>2-COL</span>
              </button>
            </div>

            {/* Price Filter Slider */}
            <div className="price-slider-group">
              <label htmlFor="price-range" className="slider-label">
                <span>Max Price:</span>
                <strong>{formatPrice(currentMaxPrice)}</strong>
              </label>
              <input
                id="price-range"
                type="range"
                min="0"
                max={highestCatalogPrice}
                step="10"
                value={currentMaxPrice}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                className="custom-range-slider"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="sort-dropdown-group">
              <ArrowUpDown size={15} className="sort-icon" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="sort-select"
                aria-label="Sort products"
              >
                <option value="featured">Featured Collection</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="reviews">Most Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid / State Views */}
        {productsLoading ? (
          /* Loading Skeletons */
          <div className="products-grid">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="product-card glass-card skeleton-card" style={{ minHeight: '440px' }}>
                <div style={{ width: '100%', height: '320px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ width: '40%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                  <div style={{ width: '80%', height: '18px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
                  <div style={{ width: '30%', height: '16px', background: 'rgba(229,184,105,0.1)', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : productsError ? (
          /* Error State */
          <div className="empty-catalog-state glass-card">
            <RefreshCw size={44} className="empty-icon" style={{ color: '#fb7185' }} />
            <h3 className="empty-title">Catalog Temporarily Unavailable</h3>
            <p className="empty-desc">{productsError}</p>
            <button className="btn btn-primary" onClick={refreshProducts}>
              <RefreshCw size={15} />
              <span>RETRY CONNECTION</span>
            </button>
          </div>
        ) : allProducts.length === 0 ? (
          /* Database Empty State */
          <div className="empty-catalog-state glass-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '1.2rem', borderRadius: '50%', background: 'rgba(229,184,105,0.08)', border: '1px solid rgba(229,184,105,0.2)', marginBottom: '1.25rem', color: 'var(--accent-gold)' }}>
              <PackageOpen size={48} strokeWidth={1.2} />
            </div>
            <h3 className="empty-title" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.05em' }}>
              CURATING THE RADIANT WARDROBE
            </h3>
            <p className="empty-desc" style={{ maxWidth: '520px', margin: '0.75rem auto 1.5rem', lineHeight: '1.6' }}>
              The atelier is currently curating new bespoke silhouettes. Add fashion pieces in <strong>Admin Panel → Products</strong> to showcase them live in this collection.
            </p>
            <button className="btn btn-outline" onClick={refreshProducts} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={14} />
              <span>CHECK FOR NEW PIECES</span>
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Products Grid with dynamic View Mode */
          <div className={`products-grid ${viewMode === 'showcase' ? 'products-grid-showcase' : 'products-grid-tactical'}`}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id || product.dbId} product={product} />
            ))}
          </div>
        ) : (
          /* Filter No-Match State */
          <div className="empty-catalog-state glass-card">
            <Search size={48} className="empty-icon" />
            <h3 className="empty-title">No Silhouettes Matched</h3>
            <p className="empty-desc">
              We couldn't find any pieces matching your current filters or search criteria.
            </p>
            <button className="btn btn-primary" onClick={handleResetFilters}>
              <RotateCcw size={16} />
              <span>RESET ALL FILTERS</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
