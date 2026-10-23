import React from 'react';
import { useShop } from '../context/ShopContext';
import { Heart, X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const WishlistDrawer = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    toggleWishlist,
    addToCart,
    formatPrice,
    openProductModal
  } = useShop();

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (product) => {
    addToCart(product, product.sizes[0], product.colors && product.colors[0]?.name, 1);
    toggleWishlist(product);
  };

  const handleMoveAllToCart = () => {
    wishlist.forEach(item => {
      addToCart(item, item.sizes[0], item.colors && item.colors[0]?.name, 1);
      toggleWishlist(item);
    });
  };

  return (
    <div className="drawer-backdrop" onClick={() => setIsWishlistOpen(false)}>
      <div 
        className="drawer-content wishlist-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Heart size={20} className="drawer-header-icon" fill="var(--accent-rose)" color="var(--accent-rose)" />
            <h3 className="drawer-title">SAVED SILHOUETTES</h3>
            <span className="drawer-item-count">({wishlist.length})</span>
          </div>
          <button 
            className="drawer-close-btn"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close wishlist"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content List */}
        <div className="drawer-items-list">
          {wishlist.length > 0 ? (
            wishlist.map((item) => (
              <div key={item.id} className="cart-item-row glass-card">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="cart-item-img"
                  onClick={() => {
                    setIsWishlistOpen(false);
                    openProductModal(item);
                  }}
                  style={{ cursor: 'pointer' }}
                />

                <div className="cart-item-details">
                  <div className="cart-item-title-row">
                    <h4 
                      className="cart-item-name" 
                      onClick={() => {
                        setIsWishlistOpen(false);
                        openProductModal(item);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {item.name}
                    </h4>
                    <button 
                      className="cart-item-remove-btn"
                      onClick={() => toggleWishlist(item)}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <span className="wishlist-category-tag">{item.category}</span>

                  <div className="wishlist-item-bottom-row">
                    <span className="wishlist-price">{formatPrice(item.price)}</span>
                    <button 
                      className="btn btn-primary wishlist-move-btn"
                      onClick={() => handleMoveToCart(item)}
                    >
                      <ShoppingBag size={14} />
                      <span>MOVE TO BAG</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-cart-state">
              <Heart size={48} className="empty-bag-icon" color="var(--accent-rose)" />
              <h4 className="empty-cart-title">Your Wishlist is Empty</h4>
              <p className="empty-cart-text">
                Tap the heart icon on any piece across our lookbook and collection to save it for later.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setIsWishlistOpen(false)}
              >
                DISCOVER PIECES
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Footer */}
        {wishlist.length > 0 && (
          <div className="drawer-footer glass-card">
            <button 
              className="btn btn-primary btn-checkout"
              onClick={handleMoveAllToCart}
            >
              <span>MOVE ALL TO SHOPPING BAG</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
