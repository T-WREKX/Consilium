// apps/web/src/components/GraphZoomControl.tsx
import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import './graph-zoom-control.css';

interface GraphZoomControlProps {
  /** Current zoom expressed as a percentage of "fit-all" zoom (100% = all nodes visible). */
  zoomPercent: number;
  /** Range 50–500. */
  onChange: (pct: number) => void;
  /** Reset to 100% — re-centers the view on the graph. */
  onReset?: () => void;
}

const MIN = 50;
const MAX = 500;
const STEP = 10;

export const GraphZoomControl: React.FC<GraphZoomControlProps> = ({
  zoomPercent,
  onChange,
  onReset,
}) => {
  const clamped = Math.max(MIN, Math.min(MAX, Math.round(zoomPercent)));
  const fillPct = ((clamped - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="graph-zoom-control" role="group" aria-label="Graph zoom">
      {onReset && (
        <button
          type="button"
          className="graph-zoom-fullview"
          onClick={onReset}
          aria-label="Fit to view (100%)"
          title="Fit to view"
        >
          <Maximize2 size={13} aria-hidden />
          <span>Full view</span>
        </button>
      )}

      <button
        type="button"
        className="graph-zoom-btn"
        onClick={() => onChange(Math.max(MIN, clamped - STEP))}
        aria-label="Zoom out"
      >
        <ZoomOut size={14} aria-hidden />
      </button>

      <div className="graph-zoom-slider-wrap">
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={1}
          value={clamped}
          onChange={(e) => onChange(Number(e.target.value))}
          className="graph-zoom-slider"
          aria-label="Zoom level"
          style={{ ['--fill' as string]: `${fillPct}%` }}
        />
      </div>

      <button
        type="button"
        className="graph-zoom-btn"
        onClick={() => onChange(Math.min(MAX, clamped + STEP))}
        aria-label="Zoom in"
      >
        <ZoomIn size={14} aria-hidden />
      </button>

      <span className="graph-zoom-value" aria-live="polite">{clamped}%</span>
    </div>
  );
};
