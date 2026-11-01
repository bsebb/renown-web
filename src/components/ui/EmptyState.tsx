import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        borderRadius: '12px',
        backgroundColor: 'var(--tier-0-recessed, rgba(0, 0, 0, 0.2))',
        border: '1px dashed var(--border-subtle, rgba(255, 255, 255, 0.12))',
        color: 'var(--text-secondary, #9CA3AF)',
        userSelect: 'none'
      }}
    >
      {icon && (
        <div style={{ marginBottom: '12px', color: 'var(--text-muted, #6B7280)', opacity: 0.75 }}>
          {icon}
        </div>
      )}
      <h3
        style={{
          margin: '0 0 6px',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-primary, #FFFFFF)'
        }}
      >
        {title}
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: '12.5px', maxWidth: '300px', lineHeight: 1.45 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-studio"
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
