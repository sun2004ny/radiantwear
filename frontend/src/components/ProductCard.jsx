import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ProductCard = ({ product }) => {
  const {
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
    openProductModal
  } = useShop();

  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0].name : ''
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : ''
  );
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isFavorite = isInWishlist(product.id);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product, selectedSize, selectedColor, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div 
      className="product-card glass-card mecha-product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => openProductModal(product)}
    >
      {/* Mecha Cyber Corner Accents */}
      <div className="card-cyber-corner corner-tl"></div>
      <div className="card-cyber-corner corner-tr"></div>
      <div className="card-cyber-corner corner-bl"></div>
      <div className="card-cyber-corner corner-br"></div>

      {/* Holographic Laser Shimmer Strip */}
      <div className="card-laser-shimmer"></div>

      {/* Image Container */}
      <div className="product-image-wrap">
        <img 
          src={isHovered && product.secondaryImage ? product.secondaryImage : product.image} 
          alt={product.name} 
          className="product-main-img"
          loading="lazy"
        />

        {/* Dynamic Holographic Scanline Overlay on Image */}
        <div className="card-img-scanline"></div>

        {/* Badges */}
        <div className="product-badge-group">
          {product.badge && (
            <span className={`badge ${product.badge === 'Limited Drop' ? 'badge-gold' : product.badge === 'New Season' ? 'badge-new' : 'badge-sale'}`}>
              {product.badge === 'Limited Drop' ? 'LEGENDARY LOOT' : product.badge === 'New Season' ? 'MYTHIC DROP' : product.badge}
            </span>
          )}
          {product.stock <= 4 && (
            <span className="stock-alert-badge">⚠ LOW STOCK [ONLY {product.stock} LEFT]</span>
          )}
        </div>

        {/* Wishlist and Quick View Buttons */}
        <div className="card-top-actions">
          <button 
            className={`card-action-btn ${isFavorite ? 'favorite-active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist"
          >
            <Heart size={16} fill={isFavorite ? 'var(--accent-rose)' : 'none'} color={isFavorite ? 'var(--accent-rose)' : 'currentColor'} />
          </button>
          
          <button 
            className="card-action-btn quick-view-btn"
            onClick={(e) => {
              e.stopPropagation();
              openProductModal(product);
            }}
            title="Inspect Gear Stats"
            aria-label="Inspect Gear"
          >
            <Eye size={16} />
          </button>
        </div>

        {/* Floating Quick Add Bar on Hover */}
        <div className="card-hover-action">
          <button 
            className="btn btn-primary quick-add-btn"
            onClick={handleQuickAdd}
          >
            {justAdded ? (
              <>
                <Check size={16} />
                <span>EQUIPPED IN INVENTORY</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>EQUIP GEAR</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="product-info-wrap">
        {/* Rating & Tag */}
        <div className="product-meta-row">
          <span className="product-tag-text">
            <span className="mecha-dot"></span>
            {product.tag}
          </span>
          <div className="product-rating">
            <Star size={13} fill="var(--accent-gold)" color="var(--accent-gold)" />
            <span>{product.rating}</span>
            <span className="reviews-count">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Name */}
        <h3 className="product-title">{product.name}</h3>
        <div className="mecha-code-sub">SLOT 0{product.id || '1'} // ESPORTS ARMOR</div>

        {/* Color Swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="card-color-swatches" onClick={(e) => e.stopPropagation()}>
            {product.colors.map((c, idx) => (
              <button
                key={idx}
                className={`color-dot ${selectedColor === c.name ? 'active-dot' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setSelectedColor(c.name)}
                title={c.name}
                aria-label={c.name}
              />
            ))}
            <span className="selected-color-label">{selectedColor}</span>
          </div>
        )}

        {/* Price Row */}
        <div className="product-price-row">
          <div className="price-group">
            <span className="current-price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="original-price">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <span className="size-preview-text">
            {product.sizes.slice(0, 3).join(' · ')}{product.sizes.length > 3 ? ' +' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};
