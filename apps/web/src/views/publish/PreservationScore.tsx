// apps/web/src/views/publish/PreservationScore.tsx
import React from 'react';
import './publish.css';

interface PreservationScoreProps {
  score: number; // 0-100
}

export function PreservationScore({ score }: PreservationScoreProps) {
  const filledDots = Math.round((score / 100) * 5);
  const tier = score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low';

  return (
    <div className="score-bar">
      <span className="score-label">Insight preservation</span>
      <div className="score-dots" aria-label={`${score}% preservation score`}>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`score-dot${i < filledDots ? ` filled ${tier}` : ''}`}
          />
        ))}
      </div>
      <span className="score-pct">{score}%</span>
    </div>
  );
}
