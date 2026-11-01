import React, { useRef } from 'react';

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface SlidingSegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  variant?: 'default' | 'floating';
  ariaLabel?: string;
}

export function SlidingSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  variant = 'default',
  ariaLabel = 'View mode'
}: SlidingSegmentedControlProps<T>) {
  const activeIndex = options.findIndex((opt) => opt.id === value);
  const totalItems = Math.max(options.length, 1);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isFloating = variant === 'floating';

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let nextIdx = -1;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % totalItems;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + totalItems) % totalItems;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = totalItems - 1;

    if (nextIdx !== -1) {
      e.preventDefault();
      onChange(options[nextIdx].id);
      tabRefs.current[nextIdx]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`pro-segmented ${isFloating ? 'pro-segmented-floating' : ''}`}
      style={{
        position: 'relative',
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${totalItems}, 1fr)`,
        padding: '3px',
        backgroundColor: isFloating ? 'rgba(255, 255, 255, 0.90)' : 'var(--tier-0-recessed, #07080B)',
        backdropFilter: isFloating ? 'blur(12px)' : undefined,
        WebkitBackdropFilter: isFloating ? 'blur(12px)' : undefined,
        borderRadius: '8px',
        border: isFloating ? '1px solid rgba(0, 0, 0, 0.10)' : '1px solid var(--control-border, rgba(255, 255, 255, 0.10))',
        boxShadow: isFloating ? 'var(--shadow-card, 0 4px 12px rgba(0, 0, 0, 0.08))' : 'var(--shadow-recessed, inset 0 1px 3px rgba(0, 0, 0, 0.8))',
        userSelect: 'none'
      }}
    >
      {activeIndex >= 0 && (
        <div
          className="pro-segmented-pill"
          style={{
            position: 'absolute',
            top: '3px',
            bottom: '3px',
            left: '3px',
            width: `calc((100% - 6px) / ${totalItems})`,
            background: isFloating ? 'var(--text-primary, #1F2421)' : 'var(--control-pill-bg, linear-gradient(180deg, #242936 0%, #171A22 100%))',
            borderRadius: '5px',
            border: 'none',
            boxShadow: isFloating ? '0 2px 6px rgba(0, 0, 0, 0.20)' : '0 1px 3px rgba(0, 0, 0, 0.35)',
            transform: `translateX(calc(${activeIndex} * 100%))`,
            transition: 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
            pointerEvents: 'none'
          }}
        />
      )}
      {options.map((opt, idx) => {
        const isSelected = opt.id === value;
        return (
          <button
            key={opt.id}
            ref={(el) => { tabRefs.current[idx] = el; }}
            type="button"
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(opt.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`pro-segmented-item ${isSelected ? 'pro-active' : ''}`}
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: size === 'sm' ? '4px 10px' : '6px 14px',
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: size === 'sm' ? '12px' : '13px',
              fontWeight: isSelected ? 600 : 500,
              letterSpacing: '-0.01em',
              color: isSelected
                ? (isFloating ? '#FFFFFF' : 'var(--text-primary, #FFFFFF)')
                : (isFloating ? 'var(--text-secondary, rgba(0, 0, 0, 0.65))' : 'var(--text-muted)'),
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 160ms ease'
            }}
          >
            {opt.icon && <span>{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
