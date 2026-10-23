import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import {
  Package,
  PlusCircle,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Sparkles,
  Layers,
  Tag,
  DollarSign,
  Palette,
  Check,
  Eye,
  Sliders,
  ListFilter,
  Pencil,
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import './AdminProducts.css';

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

const BADGE_OPTIONS = [
  { value: '', label: 'None / Standard' },
  { value: 'New Season', label: 'New Season' },
  { value: 'Hot', label: 'Hot' },
  { value: 'Exclusive', label: 'Exclusive' },
  { value: 'Bestseller', label: 'Bestseller' },
  { value: 'Popular', label: 'Popular' },
  { value: 'Trending', label: 'Trending' },
  { value: 'Limited Drop', label: 'Limited Drop' },
  { value: 'Sale', label: 'Sale' },
];

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'One Size'];

const PRESET_COLORS = [
  { name: 'Obsidian Black', hex: '#0f0f11' },
  { name: 'Radiant Gold', hex: '#b3822a' },
  { name: 'Charcoal Grey', hex: '#2b2b36' },
  { name: 'Oatmeal Ecru', hex: '#e3ddd1' },
  { name: 'Midnight Navy', hex: '#1a2332' },
  { name: 'Vintage Clay', hex: '#8a624a' },
  { name: 'Aura Green', hex: '#1d3326' },
  { name: 'Pure White', hex: '#ffffff' },
];

const INITIAL_FORM_STATE = {
  name: '',
  category: 'outerwear',
  productType: '',
  description: '',
  price: '',
  originalPrice: '',
  discountInfo: '',
  badge: 'New Season',
  tag: 'Bestseller',
  stock: 10,
  status: 'active',
  sizes: ['S', 'M', 'L', 'XL'],
  colors: [{ name: 'Obsidian Black', hex: '#0f0f11' }],
  features: '',
  care: 'Dry clean only. Cool iron on reverse.',
  image: '',
  secondaryImage: '',
  displayOrder: 0,
};

export default function AdminProducts() {
  const { authFetch } = useAdmin();
  const navigate = useNavigate();

  // Tab State: 'list' (default) | 'create'
  const [activeTab, setActiveTab] = useState('list');

  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#b3822a');

  // Image Local Preview State (Prepared locally; not uploaded until submit)
  const [imagePreview, setImagePreview] = useState('');
  const [secondaryImagePreview, setSecondaryImagePreview] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const fileInputRef = useRef(null);
  const secondaryFileInputRef = useRef(null);

  // Submission / Loading / Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('Piece Successfully Created!');
  const [createdProduct, setCreatedProduct] = useState(null);

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

  // Catalog Products State
  const [productsList, setProductsList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Selected product for "View Details" modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalActiveImage, setModalActiveImage] = useState('');

  // Product queued for deletion (disclaimer modal)
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Product being edited (null = new product)
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch products from database
  const fetchProductsList = async () => {
    setLoadingList(true);
    setListError('');
    try {
      const res = await authFetch('/api/admin/products');
      if (!res.ok) throw new Error('Failed to retrieve database products.');
      const data = await res.json();
      setProductsList(data.products || []);
    } catch (err) {
      setListError(err.message || 'Unable to connect to database.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  // Filtered & Sorted Catalog Products
  const filteredProducts = useMemo(() => {
    let list = [...productsList];

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

    // 3. Stock filter
    if (stockFilter === 'in-stock') {
      list = list.filter((p) => Number(p.stock) > 0);
    } else if (stockFilter === 'low-stock') {
      list = list.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 4);
    } else if (stockFilter === 'out-of-stock') {
      list = list.filter((p) => Number(p.stock) <= 0);
    }

    // 4. Sort
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = a.createdAt || a.created_at || a.id || 0;
        const dateB = b.createdAt || b.created_at || b.id || 0;
        return dateB > dateA ? 1 : dateB < dateA ? -1 : 0;
      }
      if (sortBy === 'oldest') {
        const dateA = a.createdAt || a.created_at || a.id || 0;
        const dateB = b.createdAt || b.created_at || b.id || 0;
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
      if (sortBy === 'stock-desc') {
        return Number(b.stock || 0) - Number(a.stock || 0);
      }
      return 0;
    });

    return list;
  }, [productsList, searchTerm, categoryFilter, stockFilter, sortBy]);

  const hasActiveFilters = searchTerm.trim() !== '' || categoryFilter !== 'all' || stockFilter !== 'all' || sortBy !== 'newest';

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStockFilter('all');
    setSortBy('newest');
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-compute discount label if original price is entered and greater than price
      if (name === 'price' || name === 'originalPrice') {
        const p = parseFloat(name === 'price' ? value : prev.price);
        const op = parseFloat(name === 'originalPrice' ? value : prev.originalPrice);
        if (!isNaN(p) && !isNaN(op) && op > p && p > 0) {
          const discountPct = Math.round(((op - p) / op) * 100);
          updated.discountInfo = `${discountPct}% OFF`;
        }
      }
      return updated;
    });
  };

  // Image File Selection (Prepares locally; DOES NOT UPLOAD TO CLOUDINARY OR SERVER)
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    // Read as Data URL strictly for local preview & submission package
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setImagePreview(dataUrl);
      setImageFileName(file.name);
      setFormData((prev) => ({ ...prev, image: dataUrl }));
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview('');
    setImageFileName('');
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Secondary Image File Selection
  const handleSecondaryImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Secondary image must be a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setSecondaryImagePreview(dataUrl);
      setFormData((prev) => ({ ...prev, secondaryImage: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleClearSecondaryImage = () => {
    setSecondaryImagePreview('');
    setFormData((prev) => ({ ...prev, secondaryImage: '' }));
    if (secondaryFileInputRef.current) secondaryFileInputRef.current.value = '';
  };

  // Size toggle
  const toggleSize = (size) => {
    if (isSubmitting) return;
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      const nextSizes = exists
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: nextSizes };
    });
  };

  // Color Swatches Toggle
  const toggleColorPreset = (preset) => {
    if (isSubmitting) return;
    setFormData((prev) => {
      const exists = prev.colors.some((c) => c.name === preset.name);
      const nextColors = exists
        ? prev.colors.filter((c) => c.name !== preset.name)
        : [...prev.colors, preset];
      return { ...prev, colors: nextColors };
    });
  };

  const addCustomColor = () => {
    if (!customColorName.trim()) return;
    const newColor = { name: customColorName.trim(), hex: customColorHex };
    setFormData((prev) => {
      if (prev.colors.some((c) => c.name.toLowerCase() === newColor.name.toLowerCase())) {
        return prev;
      }
      return { ...prev, colors: [...prev.colors, newColor] };
    });
    setCustomColorName('');
  };

  const removeColor = (colorName) => {
    if (isSubmitting) return;
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c.name !== colorName),
    }));
  };

  // Start editing an existing product
  const handleStartEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      category: prod.category || 'outerwear',
      productType: prod.productType || '',
      description: prod.description || '',
      price: prod.price != null ? String(prod.price) : '',
      originalPrice: prod.originalPrice != null ? String(prod.originalPrice) : '',
      discountInfo: prod.discountInfo || '',
      badge: prod.badge || '',
      tag: prod.tag || '',
      stock: prod.stock != null ? prod.stock : 10,
      status: prod.status || 'active',
      sizes: Array.isArray(prod.sizes) && prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(prod.colors) && prod.colors.length > 0 ? prod.colors : [{ name: 'Obsidian Black', hex: '#0f0f11' }],
      features: Array.isArray(prod.features) ? prod.features.join('\n') : (prod.features || ''),
      care: prod.care || 'Dry clean only. Cool iron on reverse.',
      image: prod.image || '',
      secondaryImage: prod.secondaryImage || '',
      displayOrder: prod.displayOrder || 0,
    });
    setImagePreview(prod.image || '');
    setSecondaryImagePreview(prod.secondaryImage || '');
    setImageFileName('');
    setErrorMessage('');
    setSuccessMessage('');
    setActiveTab('create');
  };

  // Trigger Delete Disclaimer Modal (Replaces native browser alert)
  const handleDeleteProduct = (prod) => {
    setProductToDelete(prod);
  };

  // Confirm Soft-Delete from Neon DB (moves to Deleted Products)
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await authFetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to move product to Deleted archive.');
      }
      setSuccessTitle('Piece Successfully Archived!');
      setSuccessMessage(`"${productToDelete.name}" has been removed from active catalog and moved to Deleted Products archive.`);
      setProductToDelete(null);
      fetchProductsList();
    } catch (err) {
      setErrorMessage(err.message || 'Could not delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  // --------------------------------------------------------------------------
  // FORM SUBMIT HANDLER
  // --------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate clicks
    if (isSubmitting) return;

    setErrorMessage('');
    setSuccessMessage('');
    setCreatedProduct(null);

    // 1. Client-Side Validation
    if (!formData.name.trim()) {
      setErrorMessage('Please enter a product name.');
      return;
    }

    if (!formData.category) {
      setErrorMessage('Please select a garment category.');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('Please provide a valid price greater than 0.');
      return;
    }

    if (!formData.image.trim()) {
      setErrorMessage('Please select an image for this silhouette.');
      return;
    }

    if (formData.sizes.length === 0) {
      setErrorMessage('Please select at least one available size.');
      return;
    }

    // 2. Lock form & initiate submit
    setIsSubmitting(true);

    try {
      // Prepare payload
      const featuresArray = formData.features
        ? formData.features
            .split('\n')
            .map((f) => f.trim())
            .filter(Boolean)
        : [];

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        productType: formData.productType.trim() || formData.category,
        description: formData.description.trim(),
        price: priceNum,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        discountInfo: formData.discountInfo.trim(),
        badge: formData.badge,
        tag: formData.tag.trim() || (formData.badge || 'New Season'),
        stock: parseInt(formData.stock, 10) || 10,
        status: formData.status,
        sizes: formData.sizes,
        colors: formData.colors,
        features: featuresArray,
        care: formData.care.trim(),
        image: formData.image,
        secondaryImage: formData.secondaryImage || null,
        displayOrder: parseInt(formData.displayOrder, 10) || 0,
      };

      const isEditing = Boolean(editingProduct?.id);
      const url = isEditing
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Server error while saving product.');
      }

      // Success!
      setSuccessTitle(
        isEditing
          ? 'Piece Successfully Updated!'
          : 'Piece Successfully Created!'
      );
      setSuccessMessage(
        isEditing
          ? `"${payload.name}" has been updated in Neon DB!`
          : `"${payload.name}" has been published to Neon DB and is now active in the "${payload.category}" collection!`
      );
      setCreatedProduct(data.product);

      // Reset form
      setEditingProduct(null);
      setFormData(INITIAL_FORM_STATE);
      setImagePreview('');
      setSecondaryImagePreview('');
      setImageFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (secondaryFileInputRef.current) secondaryFileInputRef.current.value = '';

      // Refresh products catalog list and switch to catalog view
      fetchProductsList();
      setActiveTab('list');
    } catch (err) {
      console.error('[Submit Error]', err);
      setErrorMessage(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-products-page animate-fade-in">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">
            <Sparkles size={20} strokeWidth={1.5} />
            Product Atelier & Wardrobe Management
          </h2>
          <p className="admin-page-sub">
            Create, configure, and manage luxury silhouettes stored directly in Neon DB.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="admin-tab-controls">
          <button
            className={`admin-tab-btn ${activeTab === 'list' ? 'admin-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('list')}
            type="button"
          >
            <Layers size={16} />
            <span>Wardrobe Catalog ({productsList.length})</span>
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'create' ? 'admin-tab-btn--active' : ''}`}
            onClick={() => {
              if (activeTab === 'create' && editingProduct) {
                setEditingProduct(null);
                setFormData(INITIAL_FORM_STATE);
                setImagePreview('');
                setSecondaryImagePreview('');
                setImageFileName('');
              }
              setActiveTab('create');
            }}
            type="button"
          >
            <PlusCircle size={16} />
            <span>{editingProduct ? 'Edit Silhouette' : 'Create New Product'}</span>
          </button>
        </div>
      </div>

      {/* Global Notifications */}
      {successMessage && (
        <div className="admin-banner admin-banner--success animate-fade-in">
          <CheckCircle2 size={18} className="banner-icon" />
          <div className="banner-text">
            <strong>{successTitle || 'Catalog Updated!'}</strong>
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
            <strong>Submission Error</strong>
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

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 1: PRODUCT CREATION FORM                                 */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="product-form-container">
          {/* Active Edit Mode Notification Banner */}
          {editingProduct && (
            <div className="admin-banner admin-banner--edit-mode animate-fade-in">
              <Sparkles size={18} className="banner-icon text-gold" />
              <div className="banner-text">
                <strong>Editing Silhouette: {editingProduct.name}</strong>
                <p>Modify specs below. Saved changes update directly in Neon DB.</p>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-cancel-edit"
                onClick={() => {
                  setEditingProduct(null);
                  setFormData(INITIAL_FORM_STATE);
                  handleClearImage();
                  handleClearSecondaryImage();
                  setActiveTab('list');
                }}
              >
                Cancel Edit
              </button>
            </div>
          )}

          {/* Submission Loading Overlay */}
          {isSubmitting && (
            <div className="form-busy-overlay animate-fade-in">
              <div className="busy-spinner-card">
                <RefreshCw size={36} className="spinning-loader" />
                <h4 className="busy-title">
                  {editingProduct
                    ? 'Updating Silhouette in Neon DB'
                    : 'Publishing Silhouette to Neon DB'}
                </h4>
                <p className="busy-sub">
                  Processing garment specs and persisting catalog record...
                </p>
                <span className="busy-badge">Atelier Processing</span>
              </div>
            </div>
          )}

          <div className="product-form-grid">
            {/* LEFT COLUMN: Visual Media (Image selection - prepared on client, uploaded on Submit) */}
            <div className="form-col-media">
              <div className="glass-panel form-card">
                <div className="panel-header">
                  <ImageIcon size={18} className="panel-icon" />
                  <h3 className="panel-title">Primary Silhouette Imagery</h3>
                </div>
                <p className="panel-hint">
                  Select a high-resolution garment photo. Image is prepared locally and only uploaded upon clicking Submit.
                </p>

                {/* Primary Image Upload Dropzone */}
                <div
                  className={`image-dropzone ${imagePreview ? 'has-preview' : ''}`}
                  onClick={() => !imagePreview && !isSubmitting && fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ display: 'none' }}
                    disabled={isSubmitting}
                  />

                  {imagePreview ? (
                    <div className="image-preview-wrap">
                      <img src={imagePreview} alt="Preview" className="image-preview-img" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearImage();
                        }}
                        disabled={isSubmitting}
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                      <div className="image-info-tag">
                        <span>{imageFileName || 'Prepared for Submit'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="dropzone-placeholder">
                      <div className="upload-icon-circle">
                        <Upload size={24} />
                      </div>
                      <p className="upload-prompt">
                        <strong>Click to select photo</strong> or drag & drop here
                      </p>
                      <span className="upload-support-text">
                        Supports WebP, JPG, PNG · Cloudinary ready
                      </span>
                    </div>
                  )}
                </div>

                {/* Image URL Direct Input (Optional fallback) */}
                <div className="image-url-toggle-row">
                  <label htmlFor="image-url-input" className="form-label-small">
                    Or Enter Direct Image URL:
                  </label>
                  <input
                    id="image-url-input"
                    type="text"
                    name="image"
                    value={formData.image.startsWith('data:') ? '' : formData.image}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, image: e.target.value }));
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/... or Cloudinary URL"
                    className="form-input form-input--compact"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Secondary Image (Editorial / Hover angle) */}
                <div className="secondary-image-section">
                  <div className="panel-header-compact">
                    <span className="compact-title">Secondary / Editorial Angle (Optional)</span>
                    {secondaryImagePreview && (
                      <button
                        type="button"
                        className="text-clear-btn"
                        onClick={handleClearSecondaryImage}
                        disabled={isSubmitting}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={secondaryFileInputRef}
                    accept="image/*"
                    onChange={handleSecondaryImageChange}
                    style={{ display: 'none' }}
                    disabled={isSubmitting}
                  />
                  {secondaryImagePreview ? (
                    <div className="secondary-preview-wrap">
                      <img
                        src={secondaryImagePreview}
                        alt="Editorial preview"
                        className="secondary-preview-img"
                      />
                      <span className="secondary-badge">Hover Angle Active</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn-select-secondary"
                      onClick={() => secondaryFileInputRef.current?.click()}
                      disabled={isSubmitting}
                    >
                      <Upload size={14} />
                      <span>Attach Alternate View</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status & Merchandising Placement */}
              <div className="glass-panel form-card mt-4">
                <div className="panel-header">
                  <Sliders size={18} className="panel-icon" />
                  <h3 className="panel-title">Positioning & Availability</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">Garment Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={isSubmitting}
                  >
                    <option value="active">Active (Visible in Wardrobe)</option>
                    <option value="draft">Draft (Hidden in Atelier)</option>
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label">Inventory Count</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      className="form-input"
                      disabled={isSubmitting}
                    />
                    <span className="form-help-text">Shows "Only X Left" if ≤ 4</span>
                  </div>

                  <div className="form-group flex-1">
                    <label className="form-label">Catalog Display Order</label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={isSubmitting}
                    />
                    <span className="form-help-text">Lower numbers appear first</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Garment Details, Category, Sizes, Colors, Pricing */}
            <div className="form-col-details">
              <div className="glass-panel form-card">
                <div className="panel-header">
                  <Tag size={18} className="panel-icon" />
                  <h3 className="panel-title">Garment Specifications</h3>
                </div>

                {/* Name */}
                <div className="form-group">
                  <label className="form-label">
                    Product Name <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Aetheria Tactical Bomber Jacket"
                    className="form-input form-input--lg"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {/* Category & Product Type */}
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label">
                      Wardrobe Category <span className="required-star">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-select"
                      disabled={isSubmitting}
                      required
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group flex-1">
                    <label className="form-label">Clothing / Silhouette Type</label>
                    <input
                      type="text"
                      name="productType"
                      value={formData.productType}
                      onChange={handleInputChange}
                      placeholder="e.g. Bomber Jacket, Graphic Hoodie"
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Garment Story & Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Artisanal techwear meets haute couture tailoring. High-density organic textile with water-resistant matte finish..."
                    className="form-textarea"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Pricing & Badges */}
                <div className="form-row form-row--pricing">
                  <div className="form-group flex-1">
                    <label className="form-label">
                      Price (₹ / USD / Base) <span className="required-star">*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-prefix">₹</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="1"
                        placeholder="285.00"
                        className="form-input pl-currency"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group flex-1">
                    <label className="form-label">Compare-at Price (Original)</label>
                    <div className="input-with-icon">
                      <span className="input-prefix">₹</span>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        placeholder="340.00"
                        className="form-input pl-currency"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="form-group flex-1">
                    <label className="form-label">Discount Badge Text</label>
                    <input
                      type="text"
                      name="discountInfo"
                      value={formData.discountInfo}
                      onChange={handleInputChange}
                      placeholder="e.g. 15% OFF"
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Storefront Badges & Tag */}
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label">Featured Badge</label>
                    <select
                      name="badge"
                      value={formData.badge}
                      onChange={handleInputChange}
                      className="form-select"
                      disabled={isSubmitting}
                    >
                      {BADGE_OPTIONS.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group flex-1">
                    <label className="form-label">Sub-Tag Label</label>
                    <input
                      type="text"
                      name="tag"
                      value={formData.tag}
                      onChange={handleInputChange}
                      placeholder="e.g. Bestseller, Essential, New Drop"
                      className="form-input"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* SIZES & COLORS SELECTION */}
              <div className="glass-panel form-card mt-4">
                <div className="panel-header">
                  <Palette size={18} className="panel-icon" />
                  <h3 className="panel-title">Sizes & Colorways</h3>
                </div>

                {/* Sizes Selection */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label">
                      Available Sizes <span className="required-star">*</span>
                    </label>
                    <span className="form-label-meta">
                      Selected: {formData.sizes.join(', ') || 'None selected'}
                    </span>
                  </div>
                  <div className="size-chips-grid">
                    {PRESET_SIZES.map((size) => {
                      const isSelected = formData.sizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          className={`size-chip-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => toggleSize(size)}
                          disabled={isSubmitting}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Colors Selection */}
                <div className="form-group">
                  <label className="form-label">Available Colorways</label>
                  <div className="color-presets-row">
                    {PRESET_COLORS.map((preset) => {
                      const isSelected = formData.colors.some((c) => c.name === preset.name);
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          className={`color-preset-pill ${isSelected ? 'active' : ''}`}
                          onClick={() => toggleColorPreset(preset)}
                          disabled={isSubmitting}
                          title={preset.name}
                        >
                          <span
                            className="color-dot-indicator"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span>{preset.name}</span>
                          {isSelected && <Check size={12} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Color Input */}
                  <div className="custom-color-row">
                    <div className="custom-color-picker-wrap">
                      <input
                        type="color"
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        className="custom-color-picker"
                        disabled={isSubmitting}
                        title="Choose custom color hex"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Add custom color name (e.g. Sage Green)"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      className="form-input custom-color-input"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="btn-add-color"
                      onClick={addCustomColor}
                      disabled={isSubmitting || !customColorName.trim()}
                    >
                      Add Color
                    </button>
                  </div>

                  {/* Active Selected Colors list */}
                  {formData.colors.length > 0 && (
                    <div className="active-colors-tags">
                      {formData.colors.map((c) => (
                        <span key={c.name} className="active-color-tag">
                          <span
                            className="tag-dot"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() => removeColor(c.name)}
                            disabled={isSubmitting}
                            className="remove-color-x"
                            aria-label={`Remove ${c.name}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Features & Care */}
                <div className="form-group">
                  <label className="form-label">Garment Highlights & Features (1 per line)</label>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Japanese high-density water-repellent shell&#10;Solid brass 24k gold-dipped signature zipper&#10;Thermore® eco-insulated diamond interior"
                    className="form-textarea"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">Care Instructions</label>
                  <input
                    type="text"
                    name="care"
                    value={formData.care}
                    onChange={handleInputChange}
                    placeholder="e.g. Dry clean only. Cool iron on reverse."
                    className="form-input"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Action Controls — Full-width bottom alignment */}
          <div className="form-submit-panel">
            <button
              type="submit"
              className="btn btn-primary btn-submit-product"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={18} className="admin-spin" />
                  <span>
                    {editingProduct
                      ? 'UPDATING IN NEON DB...'
                      : 'PERSISTING TO NEON DB...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>
                    {editingProduct
                      ? 'UPDATE & SAVE SILHOUETTE'
                      : 'SUBMIT & PUBLISH TO WARDROBE'}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline btn-clear-product"
              onClick={() => {
                setEditingProduct(null);
                setFormData(INITIAL_FORM_STATE);
                handleClearImage();
                handleClearSecondaryImage();
                setErrorMessage('');
                setSuccessMessage('');
              }}
              disabled={isSubmitting}
            >
              {editingProduct ? 'CANCEL & RESET' : 'CLEAR FORM'}
            </button>
          </div>
        </form>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 2: WARDROBE CATALOG TABLE                                */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'list' && (
        <div className="admin-catalog-view glass-panel">
          <div className="catalog-view-header">
            <div>
              <h3 className="panel-title">Published Silhouettes in Neon DB</h3>
              <p className="panel-sub">
                Total {productsList.length} items live in the Radiant database.
              </p>
            </div>
            <button
              className="btn btn-outline btn-refresh-list"
              onClick={fetchProductsList}
              disabled={loadingList}
            >
              <RefreshCw size={14} className={loadingList ? 'admin-spin' : ''} />
              <span>Refresh Catalog</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="admin-toolbar-row">
            <div className="admin-search-box">
              <Search size={15} className="admin-search-icon" />
              <input
                type="text"
                placeholder="Search products by name, type, category..."
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

              {/* Stock Filter */}
              <div className="admin-filter-item">
                <Package size={13} className="admin-filter-icon" />
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="admin-filter-select"
                  aria-label="Filter by stock"
                >
                  <option value="all">All Stock Status</option>
                  <option value="in-stock">In Stock (&gt; 0)</option>
                  <option value="low-stock">Low Stock (≤ 4)</option>
                  <option value="out-of-stock">Out of Stock (0)</option>
                </select>
              </div>

              {/* Sorting */}
              <div className="admin-filter-item">
                <ArrowUpDown size={13} className="admin-filter-icon" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="admin-filter-select"
                  aria-label="Sort products"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="stock-desc">Stock: High to Low</option>
                </select>
              </div>

              {/* Reset Filter Button */}
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
          {hasActiveFilters && productsList.length > 0 && (
            <div className="admin-results-count">
              <span>
                Showing <strong className="admin-results-badge">{filteredProducts.length}</strong> of {productsList.length} items
              </span>
            </div>
          )}

          {loadingList ? (
            <div className="catalog-loading-state">
              <RefreshCw size={28} className="admin-spin" />
              <p>Fetching catalog records from Neon DB...</p>
            </div>
          ) : listError ? (
            <div className="catalog-error-state">
              <AlertCircle size={28} color="#fb7185" />
              <p>{listError}</p>
            </div>
          ) : productsList.length === 0 ? (
            <div className="catalog-empty-state">
              <Package size={44} strokeWidth={1.2} />
              <h4>No Products in Database Yet</h4>
              <p>
                Click <strong>"Create New Product"</strong> above to publish your first garment.
              </p>
              <button
                className="btn btn-primary mt-2"
                onClick={() => setActiveTab('create')}
              >
                <PlusCircle size={16} />
                <span>Create First Product</span>
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="admin-search-empty-state">
              <Package size={42} strokeWidth={1.2} color="#7d7d8e" />
              <h4>No Matching Silhouettes Found</h4>
              <p>No products match your current search and filter criteria. Adjust your query or reset filters.</p>
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
              {filteredProducts.map((prod) => (
                <div key={prod.id || prod.dbId} className="admin-product-card">
                  <div className="admin-card-image-wrap">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="admin-card-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="admin-card-no-img">
                        <Package size={32} strokeWidth={1.2} />
                      </div>
                    )}
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

                    {/* 3 Action Buttons in 1 Row: View Details (text), Edit (icon), Delete (icon) */}
                    <div className="admin-card-actions-row">
                      <button
                        type="button"
                        className="admin-btn-view-details"
                        onClick={() => {
                          setSelectedProduct(prod);
                          setModalActiveImage(prod.image);
                        }}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        className="admin-btn-icon admin-btn-edit"
                        onClick={() => handleStartEdit(prod)}
                        title="Edit Garment"
                        aria-label="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn-icon admin-btn-delete"
                        onClick={() => handleDeleteProduct(prod)}
                        title="Delete Garment"
                        aria-label="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
                  <span className={`admd-status-pill status-${selectedProduct.status}`}>
                    {selectedProduct.status}
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
                        <span className="admd-stock-value">{selectedProduct.stock} units in stock</span>
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
                  handleStartEdit(p);
                }}
              >
                <Pencil size={14} />
                <span>Edit Silhouette</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* DELETE PRODUCT DISCLAIMER MODAL (CUSTOM IN-APP DIALOG)       */}
      {/* ──────────────────────────────────────────────────────────── */}
      {productToDelete && createPortal(
        <div className="admd-modal-backdrop" onClick={() => !isDeleting && setProductToDelete(null)}>
          <div className="admd-disclaimer-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admd-disclaimer-header">
              <div className="admd-disclaimer-title-wrap">
                <div className="admd-disclaimer-icon-wrap">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="admd-disclaimer-title">Archive Silhouette</h3>
                  <p className="admd-disclaimer-sub">Review before removing from live wardrobe</p>
                </div>
              </div>
              <button
                type="button"
                className="admd-close-button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admd-disclaimer-body">
              {/* Product preview strip */}
              <div className="admd-preview-strip">
                <img
                  src={productToDelete.image}
                  alt={productToDelete.name}
                  className="admd-preview-img"
                />
                <div className="admd-preview-info">
                  <h4 className="admd-preview-name">{productToDelete.name}</h4>
                  <div className="admd-preview-meta">
                    <span className="admd-preview-cat">{productToDelete.category}</span>
                    <span className="admd-preview-dot">·</span>
                    <span className="admd-preview-price">₹{productToDelete.price}</span>
                    <span className="admd-preview-dot">·</span>
                    <span className="admd-preview-stock">{productToDelete.stock} in stock</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer Notice */}
              <div className="admd-disclaimer-alert-card">
                <div className="admd-disclaimer-badge">Disclaimer Notice</div>
                <p className="admd-disclaimer-text">
                  This silhouette will be immediately <strong>unpublished from the live storefront</strong> and removed from the active wardrobe catalog.
                </p>
                <ul className="admd-disclaimer-bullets">
                  <li>It will be safely moved to your <strong>Deleted Products</strong> archive.</li>
                  <li>Customers on the storefront will no longer see or be able to order this item.</li>
                  <li>You can <strong>restore & repost</strong> this silhouette back to the active catalog at any time with a single click.</li>
                </ul>
              </div>
            </div>

            <div className="admd-disclaimer-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn admd-btn-confirm-delete"
                onClick={confirmDeleteProduct}
                disabled={isDeleting}
              >
                {isDeleting ? (
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
