import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '380px',
      width: 'calc(100% - 3rem)',
      pointerEvents: 'none'
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.9rem 1.15rem',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border-hover)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.3s ease forwards',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          {toast.type === 'success' && (
            <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
          )}
          {toast.type === 'error' && (
            <AlertCircle size={18} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
          )}
          {toast.type === 'info' && (
            <Info size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
          )}

          <span style={{ flex: 1 }}>{toast.message}</span>

          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '0.2rem'
            }}
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};
