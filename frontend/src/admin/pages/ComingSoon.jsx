import React from 'react';
import { Construction } from 'lucide-react';
import './ComingSoon.css';

const ICONS = {
  Products:  '📦',
  Orders:    '🛒',
  Customers: '👥',
  Settings:  '⚙️',
};

export default function ComingSoon({ title }) {
  return (
    <div className="coming-soon">
      <div className="coming-soon-icon">
        <Construction size={36} strokeWidth={1.2} />
      </div>
      <h2 className="coming-soon-title">{ICONS[title] ?? '🚧'} {title}</h2>
      <p className="coming-soon-text">This section is currently under construction.</p>
      <p className="coming-soon-sub">Check back soon — it will be available in a future update.</p>
      <div className="coming-soon-badge">Coming Soon</div>
    </div>
  );
}
