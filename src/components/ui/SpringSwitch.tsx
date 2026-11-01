import React, { useId } from 'react';

interface SpringSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  accentColor?: string;
  id?: string;
  disabled?: boolean;
}

export const SpringSwitch: React.FC<SpringSwitchProps> = ({
  checked,
  onChange,
  label,
  accentColor = 'var(--accent-primary, #E5A93C)',
  id,
  disabled = false
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <label
      htmlFor={inputId}
      className="pro-toggle"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        opacity: disabled ? 0.45 : 1
      }}
    >
      <input
        type="checkbox"
        id={inputId}
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className="pro-toggle-input"
      />
      <span
        className="pro-toggle-track"
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '36px',
          height: '20px',
          borderRadius: '9999px',
          backgroundColor: checked
            ? `color-mix(in srgb, ${accentColor} 24%, var(--tier-0-recessed, #07080B))`
            : 'var(--tier-0-recessed, #07080B)',
          border: checked
            ? `1px solid color-mix(in srgb, ${accentColor} 55%, transparent)`
            : '1px solid var(--control-border, rgba(255, 255, 255, 0.12))',
          boxShadow: checked
            ? `inset 0 1px 2px rgba(0, 0, 0, 0.35), 0 0 10px color-mix(in srgb, ${accentColor} 28%, transparent)`
            : 'var(--shadow-recessed, inset 0 1px 3px rgba(0, 0, 0, 0.8))',
          transition: 'background-color 200ms cubic-bezier(0.16, 1, 0.3, 1), border-color 200ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <span
          className="pro-toggle-thumb"
          style={{
            position: 'absolute',
            top: '1px',
            left: '1px',
            height: '16px',
            borderRadius: '9999px',
            background: checked
              ? `linear-gradient(180deg, #FFFFFF 0%, ${accentColor} 100%)`
              : 'linear-gradient(180deg, #FFFFFF 0%, #D1D5DB 100%)',
            boxShadow: checked
              ? `0 1px 4px rgba(0, 0, 0, 0.65), 0 0 8px color-mix(in srgb, ${accentColor} 55%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.9)`
              : '0 1px 3px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
          }}
        />
      </span>
      {label && (
        <span
          style={{
            fontFamily: 'var(--font-sans, sans-serif)',
            fontSize: '13px',
            fontWeight: 500,
            color: checked ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
        >
          {label}
        </span>
      )}
    </label>
  );
};
