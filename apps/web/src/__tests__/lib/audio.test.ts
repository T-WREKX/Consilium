import { describe, it, expect } from 'vitest';
import { formatDuration, MAX_RECORDING_DURATION } from '../../lib/audio';

describe('formatDuration', () => {
  it('formats 0 as 00:00', () => {
    expect(formatDuration(0)).toBe('00:00');
  });

  it('formats 65 as 01:05', () => {
    expect(formatDuration(65)).toBe('01:05');
  });

  it('formats 300 as 05:00', () => {
    expect(formatDuration(300)).toBe('05:00');
  });

  it('pads single-digit minutes and seconds', () => {
    expect(formatDuration(9)).toBe('00:09');
    expect(formatDuration(60)).toBe('01:00');
  });
});

describe('MAX_RECORDING_DURATION', () => {
  it('is 300 seconds (5 minutes)', () => {
    expect(MAX_RECORDING_DURATION).toBe(300);
  });
});
