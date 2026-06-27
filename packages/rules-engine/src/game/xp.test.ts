import { describe, expect, it } from 'vitest';
import { calculateXpAward, type XpAwardInput } from './xp';

const base: XpAwardInput = {
  primaryStat: 'strength',
  activityType: 'strength',
  effort: 'moderate',
  durationMinutes: 40,
  verificationLevel: 'high_confidence',
  priorXpTodayForStat: 0,
  priorHardStrengthSessionsToday: 0,
  fuelStatus: 'on_target',
  recoveryStatus: 'steady',
  painFlag: false,
  stronglySupported: false,
};

describe('calculateXpAward', () => {
  it('manual workouts earn personal progress but only limited competitive XP', () => {
    const result = calculateXpAward({ ...base, verificationLevel: 'unverified' });
    expect(result.personalXp).toBeGreaterThan(0);
    expect(result.competitiveXp).toBeGreaterThan(0);
    expect(result.competitiveXp).toBeLessThan(result.personalXp);
    expect(result.reasonCodes).toContain('unverified_limited_competitive_xp');
  });

  it('suspicious workouts earn no competitive XP', () => {
    const result = calculateXpAward({ ...base, verificationLevel: 'suspicious' });
    expect(result.personalXp).toBeGreaterThan(0);
    expect(result.competitiveXp).toBe(0);
    expect(result.reasonCodes).toContain('suspicious_no_competitive_xp');
  });

  it('high-confidence workouts earn full competitive XP', () => {
    const result = calculateXpAward(base);
    expect(result.competitiveXp).toBe(result.personalXp);
  });

  it('applies daily load protection after two hard strength sessions', () => {
    const result = calculateXpAward({
      ...base,
      effort: 'hard',
      priorHardStrengthSessionsToday: 2,
    });
    expect(result.dailyLoadProtectionApplied).toBe(true);
    expect(result.safetyReviewFlagged).toBe(true);
    expect(result.competitiveXp).toBe(0);
    expect(result.personalXp).toBeGreaterThan(0);
    expect(result.reasonCodes).toContain('daily_load_protection');
  });

  it('allows extra hard sessions when strongly supported', () => {
    const result = calculateXpAward({
      ...base,
      effort: 'hard',
      priorHardStrengthSessionsToday: 2,
      stronglySupported: true,
    });
    expect(result.dailyLoadProtectionApplied).toBe(false);
    expect(result.competitiveXp).toBeGreaterThan(0);
  });

  it('does not reward unsafe escalation when under-fueled or poorly recovered', () => {
    const result = calculateXpAward({
      ...base,
      effort: 'max',
      fuelStatus: 'under_target',
      recoveryStatus: 'low',
    });
    expect(result.competitiveXp).toBe(0);
    expect(result.safetyReviewFlagged).toBe(true);
    expect(result.personalXp).toBeGreaterThan(0);
    expect(result.reasonCodes).toContain('unsafe_escalation_no_competitive_reward');
    expect(result.reasonCodes).toContain('competitive_xp_withheld');
  });

  it('still earns recovery XP for recovery activity even when fuel and recovery are poor', () => {
    const result = calculateXpAward({
      ...base,
      primaryStat: 'recovery',
      activityType: 'recovery',
      effort: 'easy',
      durationMinutes: 30,
      verificationLevel: 'standard',
      fuelStatus: 'under_target',
      recoveryStatus: 'low',
    });
    expect(result.personalXp).toBeGreaterThan(0);
    expect(result.competitiveXp).toBeGreaterThan(0);
    expect(result.safetyReviewFlagged).toBe(false);
    expect(result.reasonCodes).toContain('recovery_activity');
  });

  it('applies diminishing returns once a stat is heavily worked in a day', () => {
    const fresh = calculateXpAward(base);
    const tired = calculateXpAward({ ...base, priorXpTodayForStat: 700 });
    expect(tired.diminishingApplied).toBe(true);
    expect(tired.personalXp).toBeLessThan(fresh.personalXp);
  });
});
