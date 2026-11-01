import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning';
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({
  toast,
  onDismiss,
  durationMs = 3200
}) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [toast, onDismiss, durationMs]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 18px',
        backgroundColor: 'var(--tier-3-floating, #161922)',
        color: 'var(--text-primary, #FFFFFF)',
        borderRadius: '9999px',
        border: '1px solid var(--border-glass, rgba(255, 255, 255, 0.14))',
        boxShadow: 'var(--shadow-hud, 0 16px 36px rgba(0, 0, 0, 0.45))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        fontSize: '13px',
        fontWeight: 500,
        letterSpacing: '-0.01em',
        animation: 'toast-enter 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        pointerEvents: 'auto'
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor:
            toast.type === 'warning'
              ? '#F59E0B'
              : toast.type === 'info'
              ? '#38BDF8'
              : 'var(--accent-primary, #10B981)'
        }}
      />
      <span>{toast.title}</span>
      {toast.description && (
        <span style={{ color: 'var(--text-muted, rgba(255, 255, 255, 0.6))', fontSize: '12px' }}>
          • {toast.description}
        </span>
      )}
    </div>
  );
};
