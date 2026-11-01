import React, { useEffect } from 'react';

interface SlideOverDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: string;
  children: React.ReactNode;
}

export const SlideOverDrawer: React.FC<SlideOverDrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  width = '400px',
  children
}) => {
  const [isRendered, setIsRendered] = React.useState(open);
  const [isExiting, setIsExiting] = React.useState(false);

  useEffect(() => {
    if (open) {
      setIsRendered(true);
      setIsExiting(false);
    } else if (isRendered) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsExiting(false);
      }, 230);
      return () => clearTimeout(timer);
    }
  }, [open, isRendered]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!isRendered) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(10, 12, 16, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: isExiting ? 'backdrop-fade-out 220ms ease forwards' : 'backdrop-fade-in 240ms ease forwards'
      }}
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          width: `min(100vw, ${width})`,
          height: '100%',
          backgroundColor: 'var(--tier-3-floating, #FFFFFF)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-hud, -16px 0 40px rgba(0, 0, 0, 0.25))',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: isExiting
            ? 'drawer-slide-out 220ms cubic-bezier(0.2, 0, 0, 1) forwards'
            : 'drawer-slide-in 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        <header
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-divider)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</h2>
            {subtitle && (
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="btn-studio"
            style={{ padding: '6px 10px' }}
          >
            Close
          </button>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {children}
        </div>
      </aside>
    </div>
  );
};
