import React from 'react';

export interface StepItem {
  id: string;
  label: string;
  number: number;
}

interface ConfiguratorStepperProps {
  steps: StepItem[];
  currentStepId: string;
  onSelectStep: (stepId: string) => void;
  canNavigateForward?: boolean;
}

export const ConfiguratorStepper: React.FC<ConfiguratorStepperProps> = ({
  steps,
  currentStepId,
  onSelectStep,
  canNavigateForward = true
}) => {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);
  const activeStep = steps[currentIndex] || steps[0];

  return (
    <nav
      aria-label="Configuration progress"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '12px 14px',
        backgroundColor: 'var(--tier-0-recessed, rgba(0, 0, 0, 0.35))',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        boxShadow: 'var(--shadow-recessed, inset 0 1px 3px rgba(0, 0, 0, 0.6))',
        userSelect: 'none',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Tier 1: Micro-Tracked Step Status Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '0 2px'
        }}
      >
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted, rgba(255, 255, 255, 0.45))'
          }}
        >
          Step {activeStep ? activeStep.number : currentIndex + 1} of {steps.length}
        </span>
        <span
          style={{
            fontSize: '12.5px',
            fontWeight: 600,
            color: 'var(--accent-primary, #D4AF37)',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {activeStep ? activeStep.label : ''}
        </span>
      </div>

      {/* Tier 2: Adaptive Progress Detent Track */}
      <div
        role="tablist"
        aria-label="Configuration step detents"
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          gap: '4px'
        }}
      >
        {steps.map((step, idx) => {
          const isActive = step.id === currentStepId;
          const isCompleted = idx < currentIndex;
          const isClickable = idx <= currentIndex || canNavigateForward;

          return (
            <React.Fragment key={step.id}>
              {/* Connector line between steps */}
              {idx > 0 && (
                <div
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    height: '2px',
                    borderRadius: '1px',
                    backgroundColor: isCompleted
                      ? 'var(--accent-primary, #D4AF37)'
                      : 'var(--border-subtle, rgba(255, 255, 255, 0.12))',
                    opacity: isCompleted ? 0.85 : 0.4,
                    transition: 'background-color 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease'
                  }}
                />
              )}

              {/* Step Node Button */}
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Step ${step.number}: ${step.label}${isCompleted ? ' (Completed)' : isActive ? ' (Current)' : ''}`}
                title={`Step ${step.number}: ${step.label}`}
                disabled={!isClickable}
                onClick={() => isClickable && onSelectStep(step.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isActive
                    ? 'color-mix(in srgb, var(--accent-primary, #D4AF37) 14%, transparent)'
                    : isCompleted
                    ? 'color-mix(in srgb, var(--accent-primary, #D4AF37) 8%, rgba(255, 255, 255, 0.04))'
                    : 'transparent',
                  border: isActive
                    ? '1px solid var(--accent-primary, #D4AF37)'
                    : isCompleted
                    ? '1px solid color-mix(in srgb, var(--accent-primary, #D4AF37) 40%, transparent)'
                    : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
                  borderRadius: '999px',
                  padding: isActive ? '3px 10px 3px 4px' : '3px 4px',
                  cursor: isClickable ? 'pointer' : 'not-allowed',
                  opacity: isClickable ? 1 : 0.45,
                  transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                  flexShrink: 0,
                  outline: 'none'
                }}
              >
                {/* Disc Indicator */}
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    backgroundColor: isActive
                      ? 'var(--accent-primary, #D4AF37)'
                      : isCompleted
                      ? 'color-mix(in srgb, var(--accent-primary, #D4AF37) 25%, transparent)'
                      : 'var(--tier-1-stage, rgba(255, 255, 255, 0.06))',
                    color: isActive
                      ? 'var(--accent-foreground, #0A0C10)'
                      : isCompleted
                      ? 'var(--accent-primary, #D4AF37)'
                      : 'var(--text-muted, rgba(255, 255, 255, 0.5))',
                    transition: 'all 200ms ease'
                  }}
                >
                  {isCompleted ? (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </span>

                {/* Active Step Label - Only expanded on active step to guarantee zero screen overflow */}
                {isActive && (
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: 'var(--text-primary, #FFFFFF)',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.01em'
                    }}
                  >
                    {step.label}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
