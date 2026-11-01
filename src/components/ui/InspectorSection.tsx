import React, { useState } from 'react';

interface InspectorSectionProps {
  title: string;
  rightSlot?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const InspectorSection: React.FC<InspectorSectionProps> = ({
  title,
  rightSlot,
  defaultOpen = true,
  children
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="inspector-section" style={{ padding: 0, gap: 0 }}>
      <div
        style={{
          height: '38px',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none'
        }}
      >
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            height: '100%',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              color: 'var(--text-muted)',
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 160ms var(--ease-apple-pro)'
            }}
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span style={{ fontFamily: 'var(--font-sans, sans-serif)', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {title}
          </span>
        </button>
        {rightSlot && <div>{rightSlot}</div>}
      </div>
      {open && (
        <div style={{ padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {children}
        </div>
      )}
    </section>
  );
};
