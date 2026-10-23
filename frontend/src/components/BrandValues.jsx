import React from 'react';
import { Cpu, ShieldCheck, Flame, RefreshCw, Award, Zap } from 'lucide-react';

export const BrandValues = () => {
  const pillars = [
    {
      icon: <Zap size={28} color="var(--anime-cyan)" />,
      code: 'SPEC-01 // THERMAL',
      title: 'CoolMax Anti-Sweat Fiber',
      description: 'GOTS-certified combed organic cotton paired with breathable moisture-wicking CoolMax weave to keep you cool under high-intensity ranked matches.'
    },
    {
      icon: <Award size={28} color="var(--anime-magenta)" />,
      code: 'SPEC-02 // CHASSIS',
      title: 'Heavyweight Armor Weave (520 GSM)',
      description: 'Up to 520 GSM French terry fleece, solid brass 24k gold-dipped hardware, and reinforced double-needle construction built to withstand thousands of hours of gaming.'
    },
    {
      icon: <RefreshCw size={28} color="var(--anime-gold)" />,
      code: 'SPEC-03 // LOOT-CRATE',
      title: 'Zero-Waste Cyber Loot Packaging',
      description: 'Every order arrives in bespoke biodegradable cyber loot crate pouches made from organic cassava starch and recyclable unbleached craft boxes.'
    },
    {
      icon: <ShieldCheck size={28} color="var(--anime-emerald)" />,
      code: 'SPEC-04 // WARRANTY',
      title: 'Lifetime Clan Armor Guarantee',
      description: 'We stand unconditionally behind our stitching. Complimentary hardware replacements and stitch repair coverage on all signature garments.'
    }
  ];

  return (
    <section id="sustainability" className="sustainability-section">
      <div className="container">
        <div className="section-header section-header--left">
          <span className="section-eyebrow">HARDWARE SPECIFICATIONS // ESPORTS ARCHITECTURE</span>
          <h2 className="section-title">TOURNAMENT GRADE STANDARDS</h2>
          <p className="section-description">
            240Hz battle-tested comfort, CoolMax thermal management, and indestructible Japanese ballistic stitching.
          </p>
        </div>

        <div className="pillars-grid">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="pillar-card glass-card">
              <div className="pillar-header-row">
                <div className="pillar-icon-box">
                  {pillar.icon}
                </div>
                {pillar.code && <span className="pillar-spec-chip">{pillar.code}</span>}
              </div>
              <h3 className="pillar-title">{pillar.title}</h3>
              <p className="pillar-desc">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
