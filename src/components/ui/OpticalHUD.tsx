import React from 'react';

interface OpticalCellData {
  label: string;
  value: string | number;
  subValue?: string;
  accent?: boolean;
}

interface OpticalHUDProps {
  cells: OpticalCellData[];
}

export const OpticalHUD: React.FC<OpticalHUDProps> = ({ cells }) => {
  const lastRowStart = cells.length - (cells.length % 2 || 2);

  return (
    <div className="optical-housing" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
      {cells.map((cell, idx) => (
        <div
          key={cell.label}
          className={`optical-cell ${idx % 2 === 0 ? 'optical-groove' : ''}`}
          style={{ borderBottom: idx < lastRowStart ? '1px solid var(--groove-border, rgba(0, 0, 0, 0.75))' : 'none' }}
        >
          <span className="optical-label">{cell.label}</span>
          <span className="optical-value" style={{ color: cell.accent ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
            {cell.value} {cell.subValue && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cell.subValue}</span>}
          </span>
        </div>
      ))}
    </div>
  );
};
