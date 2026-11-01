import React, { useState, useLayoutEffect, useRef } from "react";

export interface TabOption<T extends string | number> {
  id: T;
  label: React.ReactNode;
}

export function SlidingSegmented<T extends string | number>({
  options,
  value,
  onChange,
  className = ""
}: {
  options: TabOption<T>[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false
  });

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const activeBtn = containerRef.current.querySelector<HTMLButtonElement>(`[data-tab-id="${value}"]`);
    if (activeBtn) {
      setPillStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
        ready: true
      });
    }
  }, [value, options]);

  return (
    <div ref={containerRef} className={`renown-segmented-track ${className}`}>
      {pillStyle.ready && (
        <div
          className="renown-sliding-pill"
          style={{
            transform: `translateX(${pillStyle.left}px)`,
            width: `${pillStyle.width}px`
          }}
        />
      )}
      {options.map((opt) => (
        <button
          key={String(opt.id)}
          data-tab-id={String(opt.id)}
          type="button"
          className={`renown-slot-tab ${value === opt.id ? "active" : ""}`}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
