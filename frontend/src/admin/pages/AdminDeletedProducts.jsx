import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAdmin } from '../context/AdminContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  RotateCcw,
  RefreshCw,
  Package,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  Eye,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import './AdminDeletedProducts.css';

const CATEGORY_OPTIONS = [
  { value: 'outerwear', label: 'Outerwear & Jackets' },
  { value: 'hoodies', label: 'Hoodies & Sweats' },
  { value: 'tees', label: 'Radiant Tops & Tees' },
  { value: 'bottoms', label: 'Tailored Bottoms' },
  { value: 'knitwear', label: 'Knitwear & Sweaters' },
  { value: 'accessories', label: 'Luxury Accessories' },
  { value: 'shirts', label: 'Shirts & Overshirts' },
  { value: 'dresses', label: 'Dresses & Silhouettes' },
];

export default function AdminDeletedProducts() {
  const { authFetch } = useAdmin();
  const navigate = useNavigate();

  const [deletedList, setDeletedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('Catalog Restored!');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalActiveImage, setModalActiveImage] = useState(null);
  const [productToPurge, setProductToPurge] = useState(null);
  const [isPurging, setIsPurging] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Auto-dismiss success banner after 3 seconds
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Auto-dismiss error banner after 4 seconds
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => {
      setErrorMessage('');
    }, 4000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  // Fetch deleted products from database
  const fetchDeletedProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/api/admin/products/deleted');
      if (!res.ok) throw new Error('Failed to retrieve deleted products.');
      const data = await res.json();
      setDeletedList(data.products || []);
    } catch (err) {
      setError(err.message || 'Unable to connect to database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedProducts();
  }, []);

  // Filtered & Sorted Deleted Products
  const filteredDeletedList = useMemo(() => {
    let list = [...deletedList];

    // 1. Search query (matches name, product type, category, description, id)
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const type = (p.productType || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const id = String(p.id || p.dbId || '');
        return name.includes(q) || cat.includes(q) || type.includes(q) || desc.includes(q) || id.includes(q);
      });
    }

    // 2. Category filter
    if (categoryFilter !== 'all') {
      list = list.filter((p) => (p.category || '').toLowerCase() === categoryFilter.toLowerCase());
    }

    // 3. Sort
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = a.deletedAt || a.deleted_at || a.createdAt || a.id || 0;
        const dateB = b.deletedAt || b.deleted_at || b.createdAt || b.id || 0;
        return dateB > dateA ? 1 : dateB < dateA ? -1 : 0;
      }
      if (sortBy === 'oldest') {
        const dateA = a.deletedAt || a.deleted_at || a.createdAt || a.id || 0;
        const dateB = b.deletedAt || b.deleted_at || b.createdAt || b.id || 0;
        return dateA > dateB ? 1 : dateA < dateB ? -1 : 0;
      }
      if (sortBy === 'price-asc') {
        return Number(a.price || 0) - Number(b.price || 0);
      }
      if (sortBy === 'price-desc') {
        return Number(b.price || 0) - Number(a.price || 0);
      }
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });

    return list;
  }, [deletedList, searchTerm, categoryFilter, sortBy]);

  const hasActiveFilters = searchTerm.trim() !== '' || categoryFilter !== 'all' || sortBy !== 'newest';

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setSortBy('newest');
  };

  // Repost a deleted product back to active catalog
  const handleRepost = async (prod) => {
    setActionLoadingId(prod.id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await authFetch(`/api/admin/products/${prod.id}/repost`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to repost product.');
      }
      setSuccessTitle('Catalog Restored!');
      setSuccessMessage(`"${prod.name}" has been successfully reposted and is live in the wardrobe catalog!`);
      // Remove immediately from deleted list
      setDeletedList((prev) => prev.filter((p) => (p.id || p.dbId) !== (prod.id || prod.dbId)));
    } catch (err) {
      setErrorMessage(err.message || 'Could not repost product.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Trigger Permanent Purge Disclaimer Modal (replaces browser confirm)
  const handlePermanentDelete = (prod) => {
    setProductToPurge(prod);
  };

  // Execute Permanent Purge from Neon DB
  const confirmPurgeProduct = async () => {
    if (!productToPurge) return;
    setIsPurging(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await authFetch(`/api/admin/products/${productToPurge.id}?permanent=true`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to permanently delete product.');
      }
      setSuccessTitle('Piece Permanently Purged!');
      setSuccessMessage(`"${productToPurge.name}" has been permanently purged from Neon DB.`);
      setDeletedList((prev) => prev.filter((p) => (p.id || p.dbId) !== (productToPurge.id || productToPurge.dbId)));
      setProductToPurge(null);
    } catch (err) {
      setErrorMessage(err.message || 'Could not permanently delete product.');
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="admin-deleted-page animate-fade-in">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">
            <Trash2 size={20} strokeWidth={1.5} className="text-rose" />
            Deleted Products & Silhouettes Archive
          </h2>
          <p className="admin-page-sub">
            Review soft-deleted pieces stored in Neon DB. Simply repost any silhouette to immediately restore it to the live catalog.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link to="/admin-panel/products" className="btn btn-outline btn-back-catalog">
            <span>Active Wardrobe</span>
            <ArrowRight size={14} />
          </Link>
          <button
            className="btn btn-outline btn-refresh-archive"
            onClick={fetchDeletedProducts}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'admin-spin' : ''} />
            <span>Refresh Archive</span>
          </button>
        </div>
      </div>

      {/* Global Notifications */}
      {successMessage && (
        <div className="admin-banner admin-banner--success animate-fade-in">
          <CheckCircle2 size={18} className="banner-icon" />
          <div className="banner-text">
            <strong>{successTitle || 'Catalog Restored!'}</strong>
            <p>{successMessage}</p>
          </div>
          <button
            className="banner-close-btn"
            onClick={() => setSuccessMessage('')}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="admin-banner admin-banner--error animate-fade-in">
          <AlertCircle size={18} className="banner-icon" />
          <div className="banner-text">
            <strong>Operation Error</strong>
            <p>{errorMessage}</p>
          </div>
          <button
            className="banner-close-btn"
            onClick={() => setErrorMessage('')}
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Deleted Catalog Glass Panel */}
      <div className="admin-catalog-view glass-panel">
        <div className="catalog-view-header">
          <div>
            <h3 className="panel-title">Archived Silhouettes ({deletedList.length})</h3>
            <p className="panel-sub">
              {deletedList.length === 0
                ? 'Archive is clear.'
                : `${deletedList.length} deleted piece${deletedList.length > 1 ? 's' : ''} available to repost.`}
            </p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="admin-toolbar-row">
          <div className="admin-search-box">
            <Search size={15} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search deleted pieces by name, type, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="admin-filters-group">
            {/* Category Filter */}
            <div className="admin-filter-item">
              <Filter size={13} className="admin-filter-icon" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="admin-filter-select"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div className="admin-filter-item">
              <ArrowUpDown size={13} className="admin-filter-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="admin-filter-select"
                aria-label="Sort deleted products"
              >
                <option value="newest">Newest Deleted First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                className="admin-btn-reset-filters"
                onClick={resetFilters}
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Count Banner */}
        {hasActiveFilters && deletedList.length > 0 && (
          <div className="admin-results-count">
            <span>
              Showing <strong className="admin-results-badge">{filteredDeletedList.length}</strong> of {deletedList.length} archived pieces
            </span>
          </div>
        )}

        {loading ? (
          <div className="catalog-loading-state">
            <RefreshCw size={28} className="admin-spin text-gold" />
            <p>Loading deleted silhouettes from Neon DB...</p>
          </div>
        ) : error ? (
          <div className="catalog-error-state">
            <AlertCircle size={28} color="#fb7185" />
            <p>{error}</p>
          </div>
        ) : deletedList.length === 0 ? (
          <div className="catalog-empty-state">
            <Package size={44} strokeWidth={1.2} />
            <h4>No Deleted Products</h4>
            <p>
              Your archive is clean. Any product you delete from the Wardrobe Catalog will appear here and can be reposted at any time.
            </p>
            <Link to="/admin-panel/products" className="btn btn-primary mt-2">
              <Sparkles size={16} />
              <span>Back to Products</span>
            </Link>
          </div>
        ) : filteredDeletedList.length === 0 ? (
          <div className="admin-search-empty-state">
            <Package size={42} strokeWidth={1.2} color="#7d7d8e" />
            <h4>No Matching Archived Pieces</h4>
            <p>No deleted products match your current search and filter criteria. Adjust your query or reset filters.</p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={resetFilters}
            >
              <RotateCcw size={14} />
              <span>Clear Search & Filters</span>
            </button>
          </div>
        ) : (
          <div className="admin-products-cards-grid">
            {filteredDeletedList.map((prod) => {
              const isBusy = actionLoadingId === prod.id;
              return (
                <div key={prod.id || prod.dbId} className="admin-product-card admin-product-card--deleted">
                  <div className="admin-card-image-wrap">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="admin-card-img grayscale-preview"
                        loading="lazy"
                      />
                    ) : (
                      <div className="admin-card-no-img">
                        <Package size={32} strokeWidth={1.2} />
                      </div>
                    )}
                    <span className="deleted-tag-overlay">Deleted</span>
                  </div>

                  <div className="admin-card-content">
                    <div className="admin-card-header">
                      <h4 className="admin-card-name" title={prod.name}>
                        {prod.name}
                      </h4>
                    </div>

                    <div className="admin-card-meta-list">
                      <div className="admin-card-meta-row">
                        <span className="admin-card-label">Category</span>
                        <span className={`admin-card-value admin-card-cat-badge cat-${(prod.category || '').toLowerCase()}`}>
                          {prod.category || '—'}
                        </span>
                      </div>

                      <div className="admin-card-meta-row">
                        <span className="admin-card-label">Type</span>
                        <span className="admin-card-value admin-card-type">
                          {prod.productType || '—'}
                        </span>
                      </div>

                      <div className="admin-card-meta-row">
                        <span className="admin-card-label">Price</span>
                        <span className="admin-card-value admin-card-price">
                          <strong>₹{prod.price}</strong>
                          {prod.originalPrice && (
                            <span className="admin-card-strikethrough">
                              ₹{prod.originalPrice}
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="admin-card-meta-row">
                        <span className="admin-card-label">Stock</span>
                        <span
                          className={`admin-card-value admin-card-stock ${
                            prod.stock <= 4 ? 'low-stock' : ''
                          }`}
                        >
                          <span className="stock-dot" />
                          {prod.stock} in stock
                        </span>
                      </div>
                    </div>

                    {/* Actions row: Repost Product button + Permanent Delete button */}
                    <div className="admin-card-actions-row">
                      <button
                        type="button"
                        className="admin-btn-repost"
                        onClick={() => handleRepost(prod)}
                        disabled={isBusy}
                        title="Repost this product back to the active catalog"
                      >
                        {isBusy ? (
                          <RefreshCw size={12} className="admin-spin" />
                        ) : (
                          <RotateCcw size={12} />
                        )}
                        <span>Repost Product</span>
                      </button>

                      <button
                        type="button"
                        className="admin-btn-icon admin-btn-view"
                        onClick={() => {
                          setSelectedProduct(prod);
                          setModalActiveImage(prod.image);
                        }}
                        title="View Details"
                        aria-label="View Details"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        type="button"
                        className="admin-btn-icon admin-btn-delete"
                        onClick={() => handlePermanentDelete(prod)}
                        disabled={isBusy}
                        title="Permanently Purge from Database"
                        aria-label="Permanently Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* VIEW DETAILS MODAL — PORTAL TO BODY (PERFECTLY CENTERED)     */}
      {/* ──────────────────────────────────────────────────────────── */}
      {selectedProduct && createPortal(
        <div className="admd-modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="admd-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="admd-modal-header">
              <div className="admd-header-left">
                <div className="admd-header-badges">
                  <span className={`admd-cat-badge cat-${(selectedProduct.category || '').toLowerCase()}`}>
                    {selectedProduct.category}
                  </span>
                  {selectedProduct.badge && (
                    <span className="admd-featured-badge">{selectedProduct.badge}</span>
                  )}
                  {selectedProduct.tag && selectedProduct.tag !== selectedProduct.badge && (
                    <span className="admd-sub-tag">{selectedProduct.tag}</span>
                  )}
                  <span className="admd-status-pill status-out_of_stock">
                    Archived / Deleted
                  </span>
                </div>
                <h3 className="admd-product-title">{selectedProduct.name}</h3>
                <span className="admd-product-id">ID: {selectedProduct.id}</span>
              </div>

              <button
                type="button"
                className="admd-close-button"
                onClick={() => setSelectedProduct(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="admd-modal-body">
              {/* Top Grid: Images + Quick Metrics */}
              <div className="admd-top-grid">
                {/* Images Column */}
                <div className="admd-images-col">
                  <div className="admd-main-image-wrap">
                    <img
                      src={modalActiveImage || selectedProduct.image}
                      alt={selectedProduct.name}
                      className="admd-main-image"
                    />
                    <span className="admd-image-tag">
                      {modalActiveImage === selectedProduct.secondaryImage
                        ? 'Editorial / Alternate Angle'
                        : 'Primary Silhouette'}
                    </span>
                  </div>

                  {selectedProduct.secondaryImage && (
                    <div className="admd-thumbnails-row">
                      <button
                        type="button"
                        className={`admd-thumb-btn ${(!modalActiveImage || modalActiveImage === selectedProduct.image) ? 'active' : ''}`}
                        onClick={() => setModalActiveImage(selectedProduct.image)}
                      >
                        <img src={selectedProduct.image} alt="Primary" />
                        <span>Front View</span>
                      </button>
                      <button
                        type="button"
                        className={`admd-thumb-btn ${modalActiveImage === selectedProduct.secondaryImage ? 'active' : ''}`}
                        onClick={() => setModalActiveImage(selectedProduct.secondaryImage)}
                      >
                        <img src={selectedProduct.secondaryImage} alt="Secondary" />
                        <span>Editorial View</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Metrics & Parameters Column */}
                <div className="admd-metrics-col">
                  <div className="admd-metrics-grid">
                    {/* Price */}
                    <div className="admd-metric-card">
                      <span className="admd-metric-label">Price</span>
                      <div className="admd-metric-price-wrap">
                        <span className="admd-metric-price">₹{selectedProduct.price}</span>
                        {selectedProduct.originalPrice && (
                          <span className="admd-metric-original">₹{selectedProduct.originalPrice}</span>
                        )}
                        {selectedProduct.discountInfo && (
                          <span className="admd-metric-discount">{selectedProduct.discountInfo}</span>
                        )}
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="admd-metric-card">
                      <span className="admd-metric-label">Stock & Inventory</span>
                      <div className="admd-metric-stock">
                        <span className={`admd-stock-dot ${selectedProduct.stock <= 4 ? 'low' : ''}`} />
                        <span className="admd-stock-value">{selectedProduct.stock} units recorded</span>
                      </div>
                    </div>

                    {/* Silhouette Type */}
                    <div className="admd-metric-card">
                      <span className="admd-metric-label">Silhouette Type</span>
                      <span className="admd-metric-value">{selectedProduct.productType || 'Standard'}</span>
                    </div>

                    {/* Catalog Display Order */}
                    <div className="admd-metric-card">
                      <span className="admd-metric-label">Catalog Display Order</span>
                      <span className="admd-metric-value">#{selectedProduct.displayOrder ?? 0}</span>
                    </div>
                  </div>

                  {/* Garment Story */}
                  <div className="admd-detail-box">
                    <h4 className="admd-box-title">Garment Story & Description</h4>
                    <p className="admd-story-text">
                      {selectedProduct.description || 'No detailed story provided for this silhouette.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* All Specification Sections */}
              <div className="admd-specs-sections">
                {/* Available Sizes */}
                <div className="admd-spec-section">
                  <h4 className="admd-section-heading">
                    Available Sizes ({selectedProduct.sizes?.length || 0})
                  </h4>
                  <div className="admd-chips-wrap">
                    {(selectedProduct.sizes && selectedProduct.sizes.length > 0) ? (
                      selectedProduct.sizes.map((size) => (
                        <span key={size} className="admd-size-chip">{size}</span>
                      ))
                    ) : (
                      <span className="admd-empty-text">No sizes specified</span>
                    )}
                  </div>
                </div>

                {/* Available Colorways */}
                <div className="admd-spec-section">
                  <h4 className="admd-section-heading">
                    Available Colorways ({selectedProduct.colors?.length || 0})
                  </h4>
                  <div className="admd-chips-wrap">
                    {(selectedProduct.colors && selectedProduct.colors.length > 0) ? (
                      selectedProduct.colors.map((color, idx) => (
                        <span key={idx} className="admd-color-chip">
                          <span className="admd-color-dot" style={{ backgroundColor: color.hex }} />
                          <span>{color.name}</span>
                          <span className="admd-hex-code">{color.hex}</span>
                        </span>
                      ))
                    ) : (
                      <span className="admd-empty-text">No colorways specified</span>
                    )}
                  </div>
                </div>

                {/* Signature Highlights & Features */}
                <div className="admd-spec-section">
                  <h4 className="admd-section-heading">Signature Highlights & Features</h4>
                  {(selectedProduct.features && selectedProduct.features.length > 0) ? (
                    <ul className="admd-features-list">
                      {selectedProduct.features.map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="admd-empty-text">Standard artisanal construction.</p>
                  )}
                </div>

                {/* Care Instructions */}
                <div className="admd-spec-section">
                  <h4 className="admd-section-heading">Care Instructions</h4>
                  <p className="admd-care-text">
                    {selectedProduct.care || 'Dry clean only. Cool iron on reverse.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="admd-modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedProduct(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const p = selectedProduct;
                  setSelectedProduct(null);
                  handleRepost(p);
                }}
              >
                <RotateCcw size={14} />
                <span>Repost to Active Wardrobe</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* PERMANENT PURGE DISCLAIMER MODAL                             */}
      {/* ──────────────────────────────────────────────────────────── */}
      {productToPurge && createPortal(
        <div className="admd-modal-backdrop" onClick={() => !isPurging && setProductToPurge(null)}>
          <div className="admd-disclaimer-dialog admd-dialog--danger" onClick={(e) => e.stopPropagation()}>
            <div className="admd-disclaimer-header">
              <div className="admd-disclaimer-title-wrap">
                <div className="admd-disclaimer-icon-wrap admd-icon--danger">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="admd-disclaimer-title text-rose">Permanent Purge</h3>
                  <p className="admd-disclaimer-sub">Critical Irreversible Action Disclaimer</p>
                </div>
              </div>
              <button
                type="button"
                className="admd-close-button"
                onClick={() => setProductToPurge(null)}
                disabled={isPurging}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admd-disclaimer-body">
              {/* Product preview strip */}
              <div className="admd-preview-strip">
                <img
                  src={productToPurge.image}
                  alt={productToPurge.name}
                  className="admd-preview-img"
                />
                <div className="admd-preview-info">
                  <h4 className="admd-preview-name">{productToPurge.name}</h4>
                  <div className="admd-preview-meta">
                    <span className="admd-preview-cat">{productToPurge.category}</span>
                    <span className="admd-preview-dot">·</span>
                    <span className="admd-preview-price">₹{productToPurge.price}</span>
                    <span className="admd-preview-dot">·</span>
                    <span className="admd-preview-stock">{productToPurge.stock} units recorded</span>
                  </div>
                </div>
              </div>

              {/* Critical Disclaimer Notice */}
              <div className="admd-disclaimer-alert-card admd-alert--critical">
                <div className="admd-disclaimer-badge admd-badge--critical">Irreversible Disclaimer</div>
                <p className="admd-disclaimer-text">
                  This action will <strong>permanently erase this silhouette from Neon PostgreSQL database</strong>.
                </p>
                <ul className="admd-disclaimer-bullets">
                  <li>This piece <strong>cannot be restored or reposted</strong> once purged.</li>
                  <li>All associated database rows and image references will be completely deleted.</li>
                  <li>If you only wish to remove it from customer view, it is already archived safely.</li>
                </ul>
              </div>
            </div>

            <div className="admd-disclaimer-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setProductToPurge(null)}
                disabled={isPurging}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn admd-btn-confirm-purge"
                onClick={confirmPurgeProduct}
                disabled={isPurging}
              >
                {isPurging ? (
                  <>
                    <RefreshCw size={15} className="admin-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
