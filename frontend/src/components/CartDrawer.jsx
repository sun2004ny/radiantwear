import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Sparkles, 
  Tag, 
  Check, 
  ShieldCheck 
} from 'lucide-react';

export const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTotal,
    discountAmount,
    shippingCost,
    isFreeShipping,
    freeShippingThreshold,
    appliedPromo,
    promoError,
    applyPromoCode,
    removePromoCode,
    formatPrice,
    setIsCheckoutOpen
  } = useShop();

  const [promoInput, setPromoInput] = useState('');

  if (!isCartOpen) return null;

  // Calculate free shipping progress percentage
  const freeShipProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const amountLeftForFreeShip = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    applyPromoCode(promoInput);
    setPromoInput('');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="drawer-backdrop" onClick={() => setIsCartOpen(false)}>
      <div 
        className="drawer-content cart-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <ShoppingBag size={20} className="drawer-header-icon" />
            <h3 className="drawer-title">YOUR SHOPPING BAG</h3>
            <span className="drawer-item-count">
              ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </span>
          </div>
          <button 
            className="drawer-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="shipping-meter-wrap">
          <div className="meter-label-row">
            <Truck size={16} color={isFreeShipping ? 'var(--accent-emerald)' : 'var(--accent-gold)'} />
            <span className="meter-status-text">
              {isFreeShipping ? (
                <strong>You've unlocked Complimentary Express Delivery!</strong>
              ) : (
                <span>
                  Add <strong>{formatPrice(amountLeftForFreeShip)}</strong> more for Free Worldwide Express Delivery
                </span>
              )}
            </span>
          </div>
          <div className="progress-bar-track">
            <div 
              className="progress-bar-fill"
              style={{ 
                width: `${freeShipProgress}%`,
                background: isFreeShipping 
                  ? 'linear-gradient(90deg, #10b981, #34d399)' 
                  : 'linear-gradient(90deg, #e5b869, #f3cb82)'
              }}
            />
          </div>
        </div>

        {/* Cart Line Items */}
        <div className="drawer-items-list">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.cartItemId} className="cart-item-row glass-card">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="cart-item-img"
                />

                <div className="cart-item-details">
                  <div className="cart-item-title-row">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <button 
                      className="cart-item-remove-btn"
                      onClick={() => removeFromCart(item.cartItemId)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="cart-item-variant-pills">
                    <span className="variant-pill">Size: {item.size}</span>
                    <span className="variant-pill">Color: {item.color}</span>
                  </div>

                  <div className="cart-item-price-qty-row">
                    <div className="cart-qty-stepper">
                      <button 
                        onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                        className="cart-qty-btn"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="cart-qty-num">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                        className="cart-qty-btn"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-total-price">
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-cart-state">
              <ShoppingBag size={48} className="empty-bag-icon" />
              <h4 className="empty-cart-title">Your Bag is Empty</h4>
              <p className="empty-cart-text">
                Explore our latest collection drops and add iconic silhouettes to your wardrobe.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setIsCartOpen(false)}
              >
                START SHOPPING
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer & Checkout Summary */}
        {cart.length > 0 && (
          <div className="drawer-footer glass-card">
            {/* Promo Code Applicator */}
            <div className="promo-input-section">
              {appliedPromo ? (
                <div className="applied-promo-tag">
                  <div className="applied-promo-info">
                    <Tag size={15} color="var(--accent-gold)" />
                    <span>Promo <strong>{appliedPromo.code}</strong> applied ({appliedPromo.label})</span>
                  </div>
                  <button 
                    onClick={removePromoCode}
                    className="remove-promo-btn"
                    title="Remove coupon code"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="promo-form">
                  <div className="promo-input-group">
                    <Tag size={16} className="promo-icon" />
                    <input 
                      type="text" 
                      placeholder="Promo Code (e.g. RADIANT15)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="promo-input"
                    />
                    <button type="submit" className="btn-apply-promo">
                      APPLY
                    </button>
                  </div>
                  {promoError && (
                    <span className="promo-error-msg">{promoError}</span>
                  )}
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="summary-breakdown">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="summary-line discount-line">
                  <span>Discount ({appliedPromo?.discountPercent}%)</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="summary-line">
                <span>Estimated Express Shipping</span>
                <span>{shippingCost === 0 ? <strong style={{ color: 'var(--accent-emerald)' }}>FREE</strong> : formatPrice(shippingCost)}</span>
              </div>

              <div className="summary-line summary-total-line">
                <span className="total-label">Total Amount</span>
                <span className="total-amount-val">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button 
              className="btn btn-primary btn-checkout"
              onClick={handleProceedToCheckout}
            >
              <span>PROCEED TO SECURE CHECKOUT</span>
              <ArrowRight size={18} />
            </button>

            <div className="checkout-trust-badge">
              <ShieldCheck size={14} color="var(--accent-gold)" />
              <span>256-Bit Encrypted Secure SSL Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
