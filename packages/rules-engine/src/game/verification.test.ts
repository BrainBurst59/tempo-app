import { describe, expect, it } from 'vitest';
import { classifyWorkoutVerification, type VerificationInput } from './verification';

const base: VerificationInput = {
  manualEntryOnly: false,
  hasWearableHeartRate: false,
  hasWearableWorkoutSession: false,
  hasMotionData: false,
  hasGpsRoute: false,
  hasLocationDwell: false,
  appForegroundSessionSeconds: 0,
  claimedDurationMinutes: 40,
  duplicateOfRecent: false,
  impossiblePace: false,
};

describe('classifyWorkoutVerification', () => {
  it('classifies a manual-only workout as unverified, not suspicious', () => {
    const result = classifyWorkoutVerification({ ...base, manualEntryOnly: true });
    expect(result.level).toBe('unverified');
    expect(result.reasonCodes).toContain('manual_entry_only');
  });

  it('requires multiple corroborating signals for high_confidence', () => {
    const oneSignal = classifyWorkoutVerification({
      ...base,
      hasWearableHeartRate: true,
      appForegroundSessionSeconds: 40 * 60,
    });
    expect(oneSignal.level).toBe('standard');

    const twoSignals = classifyWorkoutVerification({
      ...base,
      hasWearableHeartRate: true,
      hasWearableWorkoutSession: true,
      appForegroundSessionSeconds: 40 * 60,
    });
    expect(twoSignals.level).toBe('high_confidence');
    expect(twoSignals.corroboratingSignals).toContain('wearable_heart_rate');
    expect(twoSignals.corroboratingSignals).toContain('wearable_workout_session');
  });

  it('marks duplicate submissions suspicious with no score', () => {
    const result = classifyWorkoutVerification({ ...base, duplicateOfRecent: true });
    expect(result.level).toBe('suspicious');
    expect(result.score).toBe(0);
    expect(result.reasonCodes).toContain('duplicate_of_recent');
  });

  it('marks impossible pace suspicious', () => {
    expect(classifyWorkoutVerification({ ...base, impossiblePace: true }).level).toBe('suspicious');
  });

  it('marks a live-tracked claim with no app time and no wearable suspicious', () => {
    const result = classifyWorkoutVerification({
      ...base,
      claimedDurationMinutes: 60,
      appForegroundSessionSeconds: 60,
    });
    expect(result.level).toBe('suspicious');
    expect(result.reasonCodes).toContain('foreground_inconsistent');
  });
});
