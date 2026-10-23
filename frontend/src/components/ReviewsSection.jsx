import React from 'react';
import { TESTIMONIALS } from '../data/products';
import { Star, CheckCircle2, Gamepad2 } from 'lucide-react';

export const ReviewsSection = () => {
  const gamingPress = [
    { name: 'IGN ESPORTS', quote: 'The cleanest RGB techwear ever made for competitive gamers.' },
    { name: 'PC GAMER', quote: 'Unreal comfort during 12-hour ranked grinds.' },
    { name: 'DEXERTO', quote: '520 GSM armor that bridges haute couture with esports.' },
    { name: 'KOTAKU', quote: 'A new gold standard for gaming streetwear.' }
  ];

  return (
    <section id="reviews" className="reviews-section">
      <div className="container">
        {/* Press Quotes Row */}
        <div className="press-quotes-grid">
          {gamingPress.map((press, idx) => (
            <div key={idx} className="press-quote-card glass-card">
              <span className="press-brand-title">{press.name}</span>
              <p className="press-quote-text">"{press.quote}"</p>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="section-header section-header--left" style={{ marginTop: '1.25rem' }}>
          <div className="rating-overview-badge badge badge-gold">
            <Star size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
            <span>4.9 RATING // 2,400+ VERIFIED CLAN MEMBERS</span>
          </div>
          <h2 className="section-title">COMMUNICATIONS // PRO CLAN LOGS</h2>
          <p className="section-description">
            Ranked battle logs and dispatch reviews from esports champions and vanguard gamers worldwide.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="testimonial-card glass-card">
              <div className="testimonial-top">
                <div className="stars-row">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={15} 
                      fill="var(--accent-gold)" 
                      color="var(--accent-gold)" 
                    />
                  ))}
                </div>
                <span className="verified-chip">
                  <CheckCircle2 size={13} color="var(--accent-emerald)" />
                  Verified GamerTag
                </span>
              </div>

              <p className="testimonial-comment">"{t.comment}"</p>

              <div className="testimonial-footer">
                <div className="user-avatar-initial">
                  {t.name.charAt(0)}
                </div>
                <div className="user-info">
                  <strong className="user-name">{t.name}</strong>
                  <span className="user-role">{t.role}</span>
                  {t.itemPurchased && (
                    <span className="user-item">Equipped: {t.itemPurchased}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
