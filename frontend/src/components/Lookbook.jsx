import React, { useState } from 'react';
import { LOOKBOOK_ITEMS, PRODUCTS } from '../data/products';
import { useShop } from '../context/ShopContext';
import { Sparkles, ArrowRight, Eye, ShoppingBag } from 'lucide-react';

export const Lookbook = () => {
  const { openProductModal, formatPrice, products } = useShop();
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [hoveredHotspot, setHoveredHotspot] = useState(null);

  const currentLook = LOOKBOOK_ITEMS[activeLookIndex];

  const getProductForHotspot = (productId) => {
    return (products || []).find(p => p.id === productId) || PRODUCTS.find(p => p.id === productId);
  };

  return (
    <section id="lookbook" className="lookbook-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header section-header--left">
          <span className="section-eyebrow">BATTLEFIELD DOSSIER // MAP: CYBER ARENA</span>
          <h2 className="section-title">WARZONE LOADOUT SHOWCASE</h2>
          <p className="section-description">
            Interactive gaming gear loadout. Click or hover the glowing RGB coordinates to inspect item stats and equip them into your inventory.
          </p>
        </div>

        {/* Look Selector Tabs */}
        <div className="lookbook-tabs-row">
          {LOOKBOOK_ITEMS.map((look, idx) => (
            <button
              key={look.id}
              onClick={() => {
                setActiveLookIndex(idx);
                setHoveredHotspot(null);
              }}
              className={`lookbook-tab-btn ${activeLookIndex === idx ? 'active-look-tab' : ''}`}
            >
              <span className="look-season">{look.season}</span>
              <span className="look-title">{look.title}</span>
            </button>
          ))}
        </div>

        {/* Lookbook Showcase Layout */}
        <div className="lookbook-showcase-grid">
          {/* Main Visual with Hotspots */}
          <div className="lookbook-visual-stage glass-card">
            <img 
              src={currentLook.image} 
              alt={currentLook.title} 
              className="lookbook-featured-img"
            />
            <div className="lookbook-overlay-gradient"></div>

            {/* Interactive Pins */}
            {currentLook.hotspots.map((spot) => {
              const prod = getProductForHotspot(spot.productId);
              const isHovered = hoveredHotspot === spot.id;

              return (
                <div
                  key={spot.id}
                  className="hotspot-pin-wrapper"
                  style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                  onMouseEnter={() => setHoveredHotspot(spot.id)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                  onClick={() => prod && openProductModal(prod)}
                >
                  <div className={`hotspot-radiant-pulse ${isHovered ? 'pulse-expanded' : ''}`}>
                    <span className="pulse-ring"></span>
                    <span className="pulse-core">+</span>
                  </div>

                  {/* Tooltip Card */}
                  <div className={`hotspot-tooltip-card glass-card ${isHovered ? 'tooltip-visible' : ''}`}>
                    <span className="tooltip-tag">FEATURED PIECE</span>
                    <h5 className="tooltip-name">{spot.label}</h5>
                    {prod && (
                      <div className="tooltip-price-row">
                        <span className="tooltip-price">{formatPrice(prod.price)}</span>
                        <span className="tooltip-cta">
                          Quick View <ArrowRight size={12} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side Styled Items List */}
          <div className="lookbook-styled-pieces glass-card">
            <div className="styled-header">
              <span className="styled-eyebrow">{currentLook.season}</span>
              <h3 className="styled-title">{currentLook.title}</h3>
              <p className="styled-desc">{currentLook.description}</p>
            </div>

            <div className="styled-items-stack">
              <span className="stack-heading">STYLED IN THIS LOOK:</span>
              {currentLook.hotspots.map(spot => {
                const prod = getProductForHotspot(spot.productId);
                if (!prod) return null;

                return (
                  <div 
                    key={spot.id}
                    className="styled-piece-card"
                    onClick={() => openProductModal(prod)}
                  >
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="styled-piece-img"
                    />
                    <div className="styled-piece-info">
                      <span className="piece-category">{prod.category}</span>
                      <h4 className="piece-name">{prod.name}</h4>
                      <div className="piece-price-row">
                        <span className="piece-price">{formatPrice(prod.price)}</span>
                        <span className="piece-view-link">
                          <Eye size={13} /> View Piece
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
