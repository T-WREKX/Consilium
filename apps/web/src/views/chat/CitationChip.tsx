import React from 'react';
import { motion } from 'motion/react';

interface CitationChipProps {
  indices: number[];
  onClick: (index: number) => void;
}

/**
 * Inline citation chip: [1], [2,3] format.
 * Monospace, accent-tinted background, clickable.
 * Per design guidelines §9.6.
 */
export const CitationChip: React.FC<CitationChipProps> = ({ indices, onClick }) => {
  return (
    <motion.span
      role="button"
      tabIndex={0}
      onClick={() => onClick(indices[0])}
      onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(indices[0]);
        }
      }}
      whileHover={{ scale: 1.06, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        lineHeight: 1.3,
        backgroundColor: 'var(--accent-primary-bg)',
        color: 'var(--accent-primary)',
        border: '1px solid var(--accent-primary-muted)',
        padding: '0 5px',
        borderRadius: '4px',
        cursor: 'pointer',
        verticalAlign: 'super',
        userSelect: 'none',
        transformOrigin: 'center',
      }}
      aria-label={`Citation ${indices.join(', ')}`}
    >
      [{indices.join(',')}]
    </motion.span>
  );
};
