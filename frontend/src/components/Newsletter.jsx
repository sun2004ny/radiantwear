import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles, ArrowRight, Check, ShieldCheck, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Newsletter = () => {
  const { addToast } = useShop();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubscribed(true);
    addToast('Welcome to the Radiant VIP Atelier! Use code VIPGOLD for 25% off.', 'success');

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#e5b869', '#f3cb82', '#ffffff']
      });
    } catch (err) {
      console.log('confetti error', err);
    }
  };

  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-card glass-card">
          <div className="newsletter-glow-orb"></div>
          
          <div className="newsletter-content">
            <span className="newsletter-eyebrow">
              <Sparkles size={14} /> VIP CLAN PASS // 25% XP BONUS
            </span>
            <h2 className="newsletter-title">
              UNLOCK EXCLUSIVE <span className="text-radiant-gold">LOOT CRATE DROPS</span>
            </h2>
            <p className="newsletter-desc">
              Join 25,000+ pro gamers worldwide. Receive early tournament drop notifications, member-only clan sales, and an immediate <strong>25% VIP gift</strong> for your first loadout.
            </p>

            {subscribed ? (
              <div className="newsletter-success-box glass-card animate-fade-in">
                <Check size={24} color="var(--accent-emerald)" />
                <div>
                  <strong>YOU HAVE UNLOCKED THE VIP CLAN PASS</strong>
                  <p>Your 25% loot discount code is: <code className="vip-code">CLANVIP25</code></p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="newsletter-form">
                <div className="newsletter-input-wrap">
                  <Mail size={18} className="newsletter-icon" />
                  <input 
                    type="email" 
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="newsletter-input"
                    required
                  />
                  <button type="submit" className="btn btn-primary newsletter-submit-btn">
                    <span>JOIN VIP ATELIER</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="newsletter-privacy-note">
                  <ShieldCheck size={13} color="var(--text-muted)" />
                  <span>Zero spam. Strict privacy protection. Unsubscribe anytime.</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
