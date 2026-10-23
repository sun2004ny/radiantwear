import React, { useState } from 'react';
import { Gamepad2, Sparkles, ArrowRight, Zap, ShieldCheck, Flame, Eye, Layers, Crosshair, Cpu, Activity } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Hero = () => {
  const { setSelectedCategory, chromaMode, setChromaMode } = useShop();
  const [activeVisualMode, setActiveVisualMode] = useState('character'); // 'character' or 'garment'
  const [neonOverdrive, setNeonOverdrive] = useState(false);

  const chromaOptions = [
    { id: 'cyan', label: 'CYBER CYAN', color: '#00f0ff' },
    { id: 'green', label: 'RAZER LIME', color: '#00ff66' },
    { id: 'purple', label: 'PLASMA VIOLET', color: '#a855f7' },
    { id: 'red', label: 'ROG CRIMSON', color: '#ff0055' },
    { id: 'spectrum', label: 'CHROMA RGB', isSpectrum: true }
  ];

  const handleShopNow = () => {
    setSelectedCategory('all');
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickDeploy = (cat) => {
    setSelectedCategory(cat);
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section full-screen-hero gamer-hero-theme">
      {/* Background Ambience & Cyber Floor */}
      <div className="hero-cyber-ambience">
        <div className="cyber-grid-floor"></div>
        <div className={`cyber-radial-aura ${neonOverdrive ? 'aura-overdrive' : ''}`}></div>
      </div>

      <div className="hero-full-container">
        <div className="hero-stage-grid">
          
          {/* Left Column: Minimal Punchy Gaming Content */}
          <div className="hero-content-col animate-fade-in">
            {/* Gamer Badge Pill */}
            <div className="hero-badge-pill gamer-badge">
              <span className="live-radar-beacon"></span>
              <Gamepad2 size={14} />
              <span>PLAYER ONE READY // ESPORTS LOADOUT 2099</span>
            </div>

            {/* Punchy Gaming Title with Glowing Gradient */}
            <h1 className="hero-title">
              PRO ESPORTS GEAR.<br />
              <span className="hero-neon-gradient">CHROMA RGB DRIP.</span>
            </h1>

            {/* Short Minimal Subtitle */}
            <p className="hero-subtitle">
              Tournament-grade 520 GSM ballistic weaves, anti-sweat CoolMax membranes, and fiber-optic RGB gaming streetwear.
            </p>

            {/* Quick Tactical Loadout Buttons */}
            <div className="hero-quick-chips">
              <span className="quick-chip-label">QUICK DEPLOY:</span>
              <button onClick={() => handleQuickDeploy('outerwear')} className="hero-chip-btn">
                <Zap size={12} />
                <span>OUTERWEAR</span>
              </button>
              <button onClick={() => handleQuickDeploy('hoodies')} className="hero-chip-btn">
                <Flame size={12} />
                <span>HOODIES</span>
              </button>
              <button onClick={() => handleQuickDeploy('all')} className="hero-chip-btn">
                <Crosshair size={12} />
                <span>ALL LOOT</span>
              </button>
            </div>

            {/* Main Action Buttons */}
            <div className="hero-actions">
              <button className="btn btn-primary hero-btn hero-btn-glow" onClick={handleShopNow}>
                <span className="btn-laser-glimmer"></span>
                <span>DEPLOY INVENTORY</span>
                <ArrowRight size={17} />
              </button>
              <a href="#lookbook" className="btn btn-secondary hero-btn">
                <span>BATTLE LOADOUTS</span>
              </a>
            </div>

            {/* Live Gamer HUD Stats Bar */}
            <div className="hero-metrics gamer-hud-bar">
              <div className="metric-item">
                <Activity size={15} color="var(--anime-emerald)" />
                <strong>HP: 100/100</strong>
              </div>
              <div className="metric-item">
                <ShieldCheck size={15} color="var(--anime-magenta)" />
                <strong>ARMOR: 990 DEF</strong>
              </div>
              <div className="metric-item">
                <Cpu size={15} color="var(--anime-cyan)" />
                <strong>FPS: 240 // SYNCED</strong>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Floating Gamer & Legendary Gear Hologram */}
          <div className="hero-visual-col">
            <div className="floating-showcase-container gamer-terminal-frame">
              
              {/* Interactive Chroma & Viewport Bar */}
              <div className="floating-controls-bar">
                <div className="mode-toggle-group">
                  <button 
                    className={`mode-btn ${activeVisualMode === 'character' ? 'active' : ''}`}
                    onClick={() => setActiveVisualMode('character')}
                  >
                    <Gamepad2 size={13} />
                    <span>PLAYER ONE</span>
                  </button>
                  <button 
                    className={`mode-btn ${activeVisualMode === 'garment' ? 'active' : ''}`}
                    onClick={() => setActiveVisualMode('garment')}
                  >
                    <Layers size={13} />
                    <span>CHROMA ARMOR</span>
                  </button>
                </div>
              </div>

              {/* Real-time Chroma RGB Profile Switcher */}
              <div className="chroma-profile-bar">
                <span className="chroma-title">CHROMA LIGHTING:</span>
                <div className="chroma-buttons">
                  {chromaOptions.map(opt => (
                    <button
                      key={opt.id}
                      className={`chroma-btn ${chromaMode === opt.id ? 'active' : ''}`}
                      onClick={() => setChromaMode && setChromaMode(opt.id)}
                      title={`Switch to ${opt.label} lighting`}
                    >
                      <span 
                        className={`chroma-color-dot ${opt.isSpectrum ? 'dot-spectrum' : ''}`} 
                        style={!opt.isSpectrum ? { backgroundColor: opt.color } : {}}
                      />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dual Floating Cards Stage */}
              <div className="floating-stage-viewport">
                
                {/* 1. Floating Gaming Pro Character Card */}
                <div 
                  className={`floating-card floating-character-card gamer-card-effect ${activeVisualMode === 'character' ? 'card-focused' : 'card-subdued'} ${neonOverdrive ? 'glow-overdrive' : ''}`}
                  onClick={() => setActiveVisualMode('character')}
                >
                  <div className="floating-corner corner-tl"></div>
                  <div className="floating-corner corner-tr"></div>
                  <div className="floating-corner corner-bl"></div>
                  <div className="floating-corner corner-br"></div>
                  
                  <img 
                    src="/images/gaming_hero_character.jpg" 
                    alt="Pro Esports Gamer Player One"
                    className="floating-img"
                  />
                  <div className="laser-scan-line"></div>

                  {/* Floating Gamer HUD Tags */}
                  <div className="float-badge badge-top">
                    <span className="dot-pulse"></span>
                    <span>PLAYER ONE: AYAKA</span>
                  </div>

                  <div className="float-badge badge-bottom">
                    <span>RANK 1 RADIANT // ESPORTS HOODIE</span>
                  </div>
                </div>

                {/* 2. Floating Legendary Gaming Armor Card */}
                <div 
                  className={`floating-card floating-garment-card gamer-card-effect ${activeVisualMode === 'garment' ? 'card-focused' : 'card-subdued'} ${neonOverdrive ? 'glow-overdrive' : ''}`}
                  onClick={() => setActiveVisualMode('garment')}
                >
                  <div className="floating-corner corner-tl"></div>
                  <div className="floating-corner corner-tr"></div>
                  <div className="floating-corner corner-bl"></div>
                  <div className="floating-corner corner-br"></div>

                  <img 
                    src="/images/gaming_hero_armor.jpg" 
                    alt="Legendary RGB Gaming Techwear Jacket"
                    className="floating-img"
                  />
                  <div className="laser-scan-line"></div>

                  <div className="float-badge badge-top">
                    <span className="dot-pulse magenta"></span>
                    <span>DEFENSE 990 // LEVEL 99</span>
                  </div>

                  <div className="float-badge badge-bottom">
                    <span>CHROMA SYNC ACTIVE</span>
                  </div>
                </div>

              </div>

              {/* Bottom Holographic HUD Ticker */}
              <div className="floating-hud-footer">
                <div className="hud-metric">
                  <span className="hud-title">BATTLESTATION LINK</span>
                  <span className="hud-val">ONLINE // 240 FPS</span>
                </div>
                <div className="hud-waveform">
                  <span className="wave-bar w1"></span>
                  <span className="wave-bar w2"></span>
                  <span className="wave-bar w3"></span>
                  <span className="wave-bar w4"></span>
                  <span className="wave-bar w5"></span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="brand-ticker-bar gamer-ticker">
        <div className="ticker-track animate-marquee">
          <span className="ticker-item">✦ RADIANT WEARS // PRO ESPORTS APPAREL</span>
          <span className="ticker-item">✦ LEVEL 99 CHROMA RGB HOODIES</span>
          <span className="ticker-item">✦ 520 GSM BALLISTIC WEAVE // ANTI-SWEAT COOLMAX</span>
          <span className="ticker-item">✦ TOURNAMENT MYTHIC LOOT DROPS</span>
          <span className="ticker-item">✦ UNLOCK VIP CLAN PASS (25% XP BONUS)</span>
          <span className="ticker-item">✦ COMPLIMENTARY EXPRESS DISPATCH</span>
          <span className="ticker-item">✦ RADIANT WEARS // PRO ESPORTS APPAREL</span>
          <span className="ticker-item">✦ LEVEL 99 CHROMA RGB HOODIES</span>
          <span className="ticker-item">✦ 520 GSM BALLISTIC WEAVE // ANTI-SWEAT COOLMAX</span>
        </div>
      </div>
    </section>
  );
};
