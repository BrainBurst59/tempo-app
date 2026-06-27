import { describe, expect, it } from 'vitest';
import { generateTodayRecommendation } from './today-engine';
import type { TodaySignalInput } from '@tempo/contracts';

const baseInput: TodaySignalInput = {
  userId: 'test-user',
  localDate: '2026-06-27',
  goal: 'recomposition',
  plannedTrainingMinutes: 46,
  availableMinutes: 60,
  fuelStatus: 'on_target',
  calorieDeltaFromTarget: 0,
  recoveryStatus: 'steady',
  sorenessStatus: 'mild',
  sleepQualityScore: 72,
  recentTrainingLoadScore: 54,
  weatherOpportunity: 'good_outdoor',
  wearableHeartRateTrend: 'normal',
};

describe('generateTodayRecommendation', () => {
  it('produces a build recommendation for normal signals', () => {
    const result = generateTodayRecommendation(baseInput);
    expect(result.tempoState).toBe('build');
    expect(result.trainingMinutes).toBe(46);
    expect(result.movementMinutes).toBe(28);
    expect(result.safetyWarnings).toEqual([]);
  });

  it('de-escalates when pain is reported', () => {
    const result = generateTodayRecommendation({ ...baseInput, sorenessStatus: 'pain_flag' });
    expect(result.tempoState).toBe('recover');
    expect(result.reasonCodes).toContain('pain_flag');
    expect(result.safetyWarnings.length).toBeGreaterThan(0);
  });

  it('does not recommend push when under-fueled', () => {
    const result = generateTodayRecommendation({
      ...baseInput,
      fuelStatus: 'under_target',
      calorieDeltaFromTarget: -700,
      recoveryStatus: 'high',
      sleepQualityScore: 90,
    });
    expect(result.tempoState).not.toBe('push');
    expect(result.reasonCodes).toContain('large_energy_deficit');
  });
});
