import { describe, expect, it } from 'vitest';
import { fetchGameEngineSnapshot, mockCompetitiveXp } from './gameEngineClient';

describe('gameEngineClient (prototype mock)', () => {
  it('returns a coherent Beast + quest snapshot', () => {
    const snap = fetchGameEngineSnapshot();
    expect(snap.beast.beastName).toBeTruthy();
    expect(snap.beast.progressToNextStage).toBeGreaterThanOrEqual(0);
    expect(snap.beast.progressToNextStage).toBeLessThanOrEqual(1);
    expect(snap.quest.rewardXp).toBeGreaterThan(0);
    expect(snap.quest.progress).toBeGreaterThanOrEqual(0);
    expect(snap.quest.progress).toBeLessThanOrEqual(1);
  });

  it('quests require verifiable effort (never unverified/suspicious)', () => {
    const { requiredVerification } = fetchGameEngineSnapshot().quest;
    expect(['standard', 'high_confidence']).toContain(requiredVerification);
  });

  it('earn-not-buy: suspicious workouts earn no competitive XP', () => {
    expect(mockCompetitiveXp('suspicious', 1000)).toBe(0);
  });

  it('scales competitive XP by verification confidence; never negative', () => {
    expect(mockCompetitiveXp('unverified', 100)).toBeLessThan(mockCompetitiveXp('standard', 100));
    expect(mockCompetitiveXp('high_confidence', 100)).toBeGreaterThanOrEqual(
      mockCompetitiveXp('standard', 100),
    );
    expect(mockCompetitiveXp('standard', -50)).toBe(0);
  });
});
