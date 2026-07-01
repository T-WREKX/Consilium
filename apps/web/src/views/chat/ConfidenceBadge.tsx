import React from 'react';
import type { ConfidenceLevel } from '../../types';

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
  sourceCount?: number;
}

interface BadgeStyle {
  color: string;
  bg: string;
  borderColor: string;
  label: string;
  filled: number; // 0-3 segments filled
}

const BADGE_CONFIG: Record<ConfidenceLevel, BadgeStyle> = {
  high: {
    color: 'var(--success)',
    bg: 'rgba(63, 185, 80, 0.10)',
    borderColor: 'rgba(63, 185, 80, 0.22)',
    label: 'High',
    filled: 3,
  },
  medium: {
    color: 'var(--warning)',
    bg: 'rgba(210, 153, 34, 0.10)',
    borderColor: 'rgba(210, 153, 34, 0.22)',
    label: 'Medium',
    filled: 2,
  },
  low: {
    color: 'var(--danger)',
    bg: 'rgba(248, 81, 73, 0.10)',
    borderColor: 'rgba(248, 81, 73, 0.22)',
    label: 'Low',
    filled: 1,
  },
  refuse: {
    color: 'var(--text-muted)',
    bg: 'rgba(72, 79, 88, 0.12)',
    borderColor: 'rgba(72, 79, 88, 0.24)',
    label: 'Insufficient',
    filled: 0,
  },
};

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, sourceCount }) => {
  const config = BADGE_CONFIG[confidence];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 10px 4px 8px',
        borderRadius: '999px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.borderColor}`,
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: '0.01em',
      }}
      title={`Confidence: ${config.label}${sourceCount !== undefined ? ` · ${sourceCount} ${sourceCount === 1 ? 'source' : 'sources'}` : ''}`}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '2px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: i < config.filled ? config.color : 'currentColor',
              opacity: i < config.filled ? 1 : 0.25,
            }}
          />
        ))}
      </span>
      {config.label}
      {sourceCount !== undefined && (
        <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
          · {sourceCount} {sourceCount === 1 ? 'source' : 'sources'}
        </span>
      )}
    </span>
  );
};
