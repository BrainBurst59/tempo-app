import { describe, expect, it } from 'vitest';
import { mockHealthProvider } from './MockHealthProvider';

describe('MockHealthProvider', () => {
  it('reports itself as the mock source', () => {
    expect(mockHealthProvider.name).toBe('MockHealthProvider');
    expect(mockHealthProvider.getSnapshot().source).toBe('MockHealthProvider');
  });

  it('returns the prototype wearable snapshot', () => {
    const s = mockHealthProvider.getSnapshot();
    expect(s.sleepHours).toBe(7.2);
    expect(s.steps).toBe(6850);
    expect(s.restingHr).toBe(62);
    expect(s.hrv).toBe(48);
    expect(s.activeMinutes).toBe(38);
    expect(s.recovery.score).toBe(85);
  });

  it('exposes the dense Health Monitor signal set with valid statuses', () => {
    const valid = new Set(['within_range', 'elevated', 'low', 'recalibrating', 'syncing', 'mock']);
    const s = mockHealthProvider.getSnapshot();
    expect(s.signals.length).toBeGreaterThanOrEqual(12);
    for (const sig of s.signals) {
      expect(valid.has(sig.status)).toBe(true);
      expect(sig.label).toBeTruthy();
    }
  });
});
