import React, { useId } from 'react';

interface PrecisionSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  defaultValue?: number;
  showSigned?: boolean;
  onChange: (val: number) => void;
}

export const PrecisionSlider: React.FC<PrecisionSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  defaultValue,
  showSigned,
  onChange
}) => {
  const sliderId = useId();
  const decimals = step >= 1 ? 0 : step >= 0.1 ? 1 : 2;
  const isSigned = showSigned ?? min < 0;
  const formatted = `${isSigned && value > 0 ? '+' : ''}${value.toFixed(decimals)}${unit}`;
  const resetTarget = defaultValue ?? (min < 0 && max > 0 ? 0 : min);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label
          htmlFor={sliderId}
          style={{
            fontFamily: 'var(--font-sans, sans-serif)',
            fontSize: '12.5px',
            fontWeight: 500,
            color: 'var(--text-secondary)'
          }}
        >
          {label}
        </label>
        <button
          type="button"
          onClick={() => onChange(resetTarget)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          title="Click to reset to default"
        >
          <span
            style={{
              fontSize: '12.5px',
              fontFamily: 'var(--font-sans, sans-serif)',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--text-primary)',
              fontWeight: 600
            }}
          >
            {formatted}
          </span>
        </button>
      </div>
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="custom-slider cinema-range"
      />
    </div>
  );
};
