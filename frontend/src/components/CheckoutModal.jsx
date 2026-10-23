import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import confetti from 'canvas-confetti';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  Lock, 
  Sparkles, 
  ArrowRight,
  Printer
} from 'lucide-react';

export const CheckoutModal = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    clearCart,
    cartSubtotal,
    cartTotal,
    discountAmount,
    shippingCost,
    appliedPromo,
    formatPrice,
    currentUser
  } = useShop();

  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [formData, setFormData] = useState({
    firstName: 'Alexander',
    lastName: 'Wright',
    email: 'alex.wright@radiant.design',
    address: '742 Evergreen Atelier Way',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'United States',
    cardNumber: '•••• •••• •••• 4242',
    cardExp: '08/29',
    cardCvc: '•••',
    paymentMethod: 'card' // 'card' | 'apple' | 'google'
  });

  // Pre-fill user info if logged in
  useEffect(() => {
    if (currentUser && isCheckoutOpen) {
      const parts = (currentUser.name || '').trim().split(' ');
      const fName = parts[0] || '';
      const lName = parts.slice(1).join(' ') || '';
      setFormData(prev => ({
        ...prev,
        firstName: fName || prev.firstName,
        lastName: lName || prev.lastName,
        email: currentUser.email || prev.email
      }));
    }
  }, [currentUser, isCheckoutOpen]);

  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isCheckoutOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const generatedOrder = `RW-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderNumber(generatedOrder);
      setStep('success');

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#e5b869', '#f3cb82', '#10b981', '#ffffff']
        });
      } catch (err) {
        console.log('Confetti triggered', err);
      }

      clearCart();
    }, 1200);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep('form');
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div 
        className="checkout-modal-content glass-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="checkout-modal-header">
          <div className="checkout-title-row">
            <Lock size={18} color="var(--accent-gold)" />
            <h3 className="checkout-title">
              {step === 'form' ? 'RADIANT ATELIER CHECKOUT' : 'ORDER CONFIRMED'}
            </h3>
          </div>
          <button 
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close checkout"
          >
            <X size={20} />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handlePlaceOrder} className="checkout-body-grid">
            {/* Left Form Column */}
            <div className="checkout-form-col">
              {/* Express Checkout Fast Pay */}
              <div className="fast-pay-section">
                <span className="fast-pay-label">EXPRESS 1-CLICK CHECKOUT</span>
                <div className="fast-pay-buttons-grid">
                  <button 
                    type="button"
                    className="btn-fast-pay apple-pay-btn"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'apple' })}
                  >
                     Apple Pay
                  </button>
                  <button 
                    type="button"
                    className="btn-fast-pay google-pay-btn"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'google' })}
                  >
                    Google Pay
                  </button>
                </div>
                <div className="divider-or">
                  <span>OR PAY WITH CARD</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="form-section-block">
                <h4 className="form-block-title">1. Shipping Information</h4>
                
                <div className="form-row-2">
                  <div className="form-field">
                    <label>First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Email Address (For Order Tracking)</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Street Address</label>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row-3">
                  <div className="form-field">
                    <label>City</label>
                    <input 
                      type="text" 
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>State / Region</label>
                    <input 
                      type="text" 
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Postal Code</label>
                    <input 
                      type="text" 
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="form-section-block">
                <h4 className="form-block-title">2. Payment Method</h4>
                <div className="payment-fields-wrap glass-card">
                  <div className="payment-header-badge">
                    <CreditCard size={18} color="var(--accent-gold)" />
                    <span>Encrypted Card Payment</span>
                  </div>

                  <div className="form-field">
                    <label>Card Number</label>
                    <input 
                      type="text" 
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Expiry Date</label>
                      <input 
                        type="text" 
                        name="cardExp"
                        value={formData.cardExp}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>CVC Security Code</label>
                      <input 
                        type="text" 
                        name="cardCvc"
                        value={formData.cardCvc}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary place-order-btn"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span>AUTHORIZING TRANSACTION...</span>
                ) : (
                  <>
                    <span>COMPLETE PURCHASE · {formatPrice(cartTotal)}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>

            {/* Right Summary Column */}
            <div className="checkout-summary-col glass-card">
              <h4 className="summary-col-title">Order Breakdown</h4>

              <div className="checkout-items-preview">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="checkout-preview-item">
                    <img src={item.image} alt={item.name} className="checkout-thumb" />
                    <div className="checkout-thumb-details">
                      <strong className="item-title">{item.name}</strong>
                      <span className="item-variants">Qty {item.quantity} · {item.size} · {item.color}</span>
                      <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="checkout-calc-list">
                <div className="calc-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="calc-row discount-text">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="calc-row">
                  <span>Express Insured Shipping</span>
                  <span>{shippingCost === 0 ? <strong style={{ color: 'var(--accent-emerald)' }}>COMPLIMENTARY</strong> : formatPrice(shippingCost)}</span>
                </div>
                <div className="calc-row total-calc-row">
                  <span>Total Due</span>
                  <span className="total-gold-price">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <div className="checkout-guarantees">
                <div className="guarantee-item">
                  <Truck size={16} color="var(--accent-gold)" />
                  <span>Dispatches within 24 hours in signature luxury packaging.</span>
                </div>
                <div className="guarantee-item">
                  <ShieldCheck size={16} color="var(--accent-gold)" />
                  <span>30-day effortless worldwide returns & full warranty.</span>
                </div>
              </div>
            </div>
          </form>
        ) : (
          /* Success Screen */
          <div className="checkout-success-view">
            <div className="success-icon-wrap">
              <CheckCircle2 size={64} color="var(--accent-emerald)" />
            </div>

            <span className="success-eyebrow">PAYMENT AUTHORIZED & CONFIRMED</span>
            <h2 className="success-heading">THANK YOU FOR YOUR PATRONAGE</h2>
            <p className="success-subtext">
              Your bespoke Radiant Wears order has been received by our master atelier. We are currently preparing your pieces with white-glove care.
            </p>

            <div className="order-receipt-card glass-card">
              <div className="receipt-header">
                <div>
                  <span className="receipt-label">ORDER REFERENCE</span>
                  <strong className="receipt-id text-radiant-gold">{orderNumber}</strong>
                </div>
                <div>
                  <span className="receipt-label">ESTIMATED DELIVERY</span>
                  <strong className="receipt-date">2-4 Business Days</strong>
                </div>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-details-grid">
                <div>
                  <span className="receipt-label">SHIPPED TO</span>
                  <p>{formData.firstName} {formData.lastName}</p>
                  <p>{formData.address}, {formData.city}, {formData.zip}</p>
                </div>
                <div>
                  <span className="receipt-label">ORDER CONFIRMATION SENT TO</span>
                  <p><strong>{formData.email}</strong></p>
                  <p>Tracking link will be emailed upon carrier pickup.</p>
                </div>
              </div>
            </div>

            <div className="success-actions-row">
              <button 
                className="btn btn-outline"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                <span>PRINT RECEIPT</span>
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleClose}
              >
                <span>CONTINUE EXPLORING</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
