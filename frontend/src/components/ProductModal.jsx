import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Heart, 
  Check, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles,
  Ruler
} from 'lucide-react';

export const ProductModal = () => {
  const {
    activeModalProduct,
    closeProductModal,
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist
  } = useShop();

  if (!activeModalProduct) return null;

  const product = activeModalProduct;

  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0].name : ''
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details'); // details | fabric | shipping
  const [justAdded, setJustAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeImage, setActiveImage] = useState(product.image);

  useEffect(() => {
    setActiveImage(product.image);
    setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0].name : '');
    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');
    setQuantity(1);
  }, [product]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeProductModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeProductModal]);

  const isFavorite = isInWishlist(product.id);

  const handleAdd = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={closeProductModal}>
      <div 
        className="product-modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          className="modal-close-btn"
          onClick={closeProductModal}
          aria-label="Close product details"
        >
          <X size={20} />
        </button>

        <div className="modal-grid">
          {/* Left: Gallery Column */}
          <div className="modal-gallery">
            <div className="modal-main-image-wrap">
              <img 
                src={activeImage} 
                alt={product.name} 
                className="modal-main-image"
              />
              <span className="modal-badge badge badge-gold">
                <Sparkles size={12} /> {product.tag}
              </span>
            </div>

            {/* Thumbnails */}
            <div className="modal-thumbnails-row">
              <button 
                className={`modal-thumb-btn ${activeImage === product.image ? 'active-thumb' : ''}`}
                onClick={() => setActiveImage(product.image)}
              >
                <img src={product.image} alt="Front Angle" />
              </button>
              {product.secondaryImage && (
                <button 
                  className={`modal-thumb-btn ${activeImage === product.secondaryImage ? 'active-thumb' : ''}`}
                  onClick={() => setActiveImage(product.secondaryImage)}
                >
                  <img src={product.secondaryImage} alt="Editorial Angle" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Info & Purchase Column */}
          <div className="modal-details-col">
            {/* Category & Rating */}
            <div className="modal-header-meta">
              <span className="modal-category-text">{product.category.toUpperCase()}</span>
              <div className="modal-rating-row">
                <div className="stars-group">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < Math.floor(product.rating) ? 'var(--accent-gold)' : 'none'} 
                      color="var(--accent-gold)" 
                    />
                  ))}
                </div>
                <span className="rating-score">{product.rating}</span>
                <span className="rating-reviews-count">({product.reviewsCount} verified reviews)</span>
              </div>
            </div>

            {/* Product Title */}
            <h2 className="modal-product-title">{product.name}</h2>

            {/* Price Row */}
            <div className="modal-price-row">
              <span className="modal-price-current">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="modal-price-original">{formatPrice(product.originalPrice)}</span>
              )}
              <span className="modal-tax-note">Tax included. Free express shipping on ₹150+</span>
            </div>

            {/* Stock Alert */}
            {product.stock && (
              <div className="modal-stock-banner">
                <div className="stock-pulse-dot"></div>
                <span>
                  <strong>Limited Quantity Available:</strong> Only {product.stock} items remaining in our atelier inventory.
                </span>
              </div>
            )}

            {/* Color Swatch Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="modal-option-section">
                <div className="option-label-row">
                  <span className="option-title">Colorway:</span>
                  <span className="option-selected-value">{selectedColor}</span>
                </div>
                <div className="color-swatches-grid">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      className={`modal-color-chip ${selectedColor === color.name ? 'selected-color-chip' : ''}`}
                      onClick={() => setSelectedColor(color.name)}
                    >
                      <span className="chip-dot" style={{ backgroundColor: color.hex }}></span>
                      <span className="chip-name">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="modal-option-section">
              <div className="option-label-row">
                <span className="option-title">Select Size:</span>
                <button 
                  className="size-guide-link"
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                >
                  <Ruler size={13} /> Size Guide
                </button>
              </div>
              <div className="size-pills-grid">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'selected-size' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* Size Guide Table Toggle */}
              {showSizeGuide && (
                <div className="size-guide-table-wrap animate-fade-in">
                  <table className="size-table">
                    <thead>
                      <tr>
                        <th>Size</th>
                        <th>Chest (in)</th>
                        <th>Waist (in)</th>
                        <th>Length (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>XS</td><td>36 - 38</td><td>28 - 30</td><td>27</td></tr>
                      <tr><td>S</td><td>38 - 40</td><td>30 - 32</td><td>28</td></tr>
                      <tr><td>M</td><td>40 - 42</td><td>32 - 34</td><td>29</td></tr>
                      <tr><td>L</td><td>42 - 44</td><td>34 - 36</td><td>30</td></tr>
                      <tr><td>XL</td><td>44 - 46</td><td>36 - 38</td><td>31</td></tr>
                      <tr><td>XXL</td><td>46 - 48</td><td>38 - 40</td><td>32</td></tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quantity Stepper & Add Actions */}
            <div className="modal-action-row">
              <div className="modal-qty-stepper">
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button 
                className="btn btn-primary modal-add-btn"
                onClick={handleAdd}
              >
                {justAdded ? (
                  <>
                    <Check size={18} />
                    <span>ADDED TO BAG!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>ADD TO BAG · {formatPrice(product.price * quantity)}</span>
                  </>
                )}
              </button>

              <button 
                className={`btn-icon modal-wishlist-btn ${isFavorite ? 'favorite-active' : ''}`}
                onClick={() => toggleWishlist(product)}
                title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label="Wishlist"
              >
                <Heart size={20} fill={isFavorite ? 'var(--accent-rose)' : 'none'} color={isFavorite ? 'var(--accent-rose)' : 'currentColor'} />
              </button>
            </div>

            {/* Interactive Tabbed Product Details */}
            <div className="modal-tabs-wrapper">
              <div className="tabs-header-bar">
                <button 
                  className={`tab-toggle-btn ${activeTab === 'details' ? 'active-tab' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Overview & Fit
                </button>
                <button 
                  className={`tab-toggle-btn ${activeTab === 'fabric' ? 'active-tab' : ''}`}
                  onClick={() => setActiveTab('fabric')}
                >
                  Craft & Care
                </button>
                <button 
                  className={`tab-toggle-btn ${activeTab === 'shipping' ? 'active-tab' : ''}`}
                  onClick={() => setActiveTab('shipping')}
                >
                  Delivery & Returns
                </button>
              </div>

              <div className="tab-content-panel">
                {activeTab === 'details' && (
                  <div className="tab-panel animate-fade-in">
                    <p className="tab-description">{product.description}</p>
                    <ul className="tab-features-list">
                      {product.features?.map((feat, idx) => (
                        <li key={idx}>
                          <Sparkles size={13} className="bullet-icon" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'fabric' && (
                  <div className="tab-panel animate-fade-in">
                    <div className="craft-card">
                      <ShieldCheck size={20} color="var(--accent-gold)" />
                      <div>
                        <strong>GOTS-Certified Sustainable Textiles</strong>
                        <p>Responsibly harvested and dyed with non-toxic, eco-certified pigments.</p>
                      </div>
                    </div>
                    <div className="care-instruction-wrap">
                      <strong>Garment Care Instructions:</strong>
                      <p>{product.care}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="tab-panel animate-fade-in">
                    <div className="shipping-perks-list">
                      <div className="perk-row">
                        <Truck size={18} color="var(--accent-emerald)" />
                        <div>
                          <strong>Complimentary Express Delivery</strong>
                          <span>Free on orders over ₹150. Delivered in 2-4 business days.</span>
                        </div>
                      </div>
                      <div className="perk-row">
                        <RotateCcw size={18} color="var(--accent-gold)" />
                        <div>
                          <strong>30-Day Hassle-Free Returns</strong>
                          <span>Complimentary return label included in your package.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
