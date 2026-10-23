import React from 'react';
import { useShop } from '../context/ShopContext';
import { ArrowUp, Globe, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  const { setSelectedCategory } = useShop();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-section">
      <div className="container">
        {/* Top Row with Brand & Navigation */}
        <div className="footer-top-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <div className="footer-logo">
              <svg viewBox="0 0 100 100" className="footer-emblem-svg">
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.4" />
                <polygon points="50,15 60,38 85,42 66,58 72,82 50,70 28,82 34,58 15,42 40,38" fill="var(--accent-gold)" />
              </svg>
              <div className="footer-logo-text">
                <span className="logo-title">RADIANT</span>
                <span className="logo-subtitle">WEARS</span>
              </div>
            </div>

            <p className="footer-about-text">
              Radiant Wears is a luxury streetwear atelier engineering high-density organic textiles, architectural tailoring, and sustainable haute apparel for the modern generation.
            </p>

            <div className="footer-social-row">
              <a href="#" className="social-icon-btn" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="social-icon-btn" aria-label="X / Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="social-icon-btn" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"></polygon>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">COLLECTIONS</h4>
            <ul className="footer-links-list">
              <li><a href="#catalog" onClick={() => setSelectedCategory('outerwear')}>Outerwear & Bombers</a></li>
              <li><a href="#catalog" onClick={() => setSelectedCategory('hoodies')}>Heavyweight Hoodies</a></li>
              <li><a href="#catalog" onClick={() => setSelectedCategory('tees')}>Radiant Graphic Tops</a></li>
              <li><a href="#catalog" onClick={() => setSelectedCategory('bottoms')}>Tailored Wide-Leg Trousers</a></li>
              <li><a href="#catalog" onClick={() => setSelectedCategory('knitwear')}>Mohair Artisanal Knits</a></li>
              <li><a href="#catalog" onClick={() => setSelectedCategory('accessories')}>Leather Crossbody Bags</a></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">CLIENT SERVICES</h4>
            <ul className="footer-links-list">
              <li><a href="#sustainability">Sustainable Craftsmanship</a></li>
              <li><a href="#lookbook">Editorial Lookbook</a></li>
              <li><a href="#reviews">Verified Reviews</a></li>
              <li><a href="#">Size & Measurement Guide</a></li>
              <li><a href="#">Worldwide Express Delivery</a></li>
              <li><a href="#">30-Day Returns & Care</a></li>
            </ul>
          </div>

          {/* Links Col 3 */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">ATELIER CONTACT</h4>
            <ul className="footer-links-list">
              <li className="footer-contact-info">Flagship Studio: 742 Evergreen Atelier Way, New York, NY</li>
              <li className="footer-contact-info">Client Care: concierge@radiantwears.com</li>
              <li className="footer-contact-info">Hours: Mon – Sat, 9am – 8pm EST</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="copyright-group">
            <span>© {new Date().getFullYear()} RADIANT WEARS INC. // ARCHIVE DEPLOYMENT // ALL RIGHTS RESERVED.</span>
            <div className="telemetry-bar">
              <span className="telemetry-dot"></span>
              <span>GRID-NET: ACTIVE</span>
              <span>·</span>
              <span>LATENCY: 14MS</span>
              <span>·</span>
              <span>SYNC-RATE: 99.8%</span>
            </div>
            <div className="legal-links">
              <a href="#">Privacy Protocol</a>
              <span>·</span>
              <a href="#">Terms of Engagement</a>
              <span>·</span>
              <a href="#">Pilot Directives</a>
            </div>
          </div>

          <div className="footer-right-actions">
            <div className="payment-icons-row">
              <span className="payment-chip">VISA</span>
              <span className="payment-chip">MASTERCARD</span>
              <span className="payment-chip">AMEX</span>
              <span className="payment-chip">APPLE PAY</span>
              <span className="payment-chip">GPAY</span>
            </div>

            <button 
              className="back-to-top-btn"
              onClick={scrollToTop}
              title="Back to Top"
            >
              <ArrowUp size={16} />
              <span>TOP</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
