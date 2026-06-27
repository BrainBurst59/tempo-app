import { describe, expect, it } from 'vitest';
import type { AvatarProgressionState } from '@tempo/contracts';
import { GAME_STATS } from '@tempo/contracts';
import { applyStatXp, applyXpAward } from './progression';

function freshState(): AvatarProgressionState {
  return {
    userId: 'u1',
    archetype: 'androgynous',
    evolutionStage: 'base',
    overallLevel: 1,
    totalXp: 0,
    stats: GAME_STATS.map((stat) => ({ stat, level: 1, xp: 0 })),
    updatedAt: '2026-06-27T00:00:00.000Z',
  };
}

describe('applyStatXp', () => {
  it('adds earned XP and derives the level', () => {
    const updated = applyStatXp({ stat: 'strength', level: 1, xp: 0 }, 400);
    expect(updated.xp).toBe(400);
    expect(updated.level).toBe(2);
  });

  it('never reduces XP or level (no punishment for rest)', () => {
    const current = { stat: 'strength' as const, level: 2, xp: 400 };
    const updated = applyStatXp(current, -999);
    expect(updated.xp).toBe(400);
    expect(updated.level).toBe(2);
  });
});

describe('applyXpAward', () => {
  it('updates only the target stat, total XP, and overall level', () => {
    const state = freshState();
    const next = applyXpAward(state, 'strength', 400);
    expect(next.totalXp).toBe(400);
    expect(next.overallLevel).toBe(2);
    expect(next.stats.find((s) => s.stat === 'strength')?.level).toBe(2);
    expect(next.stats.find((s) => s.stat === 'endurance')?.level).toBe(1);
  });

  it('does not mutate the input state', () => {
    const state = freshState();
    applyXpAward(state, 'strength', 400);
    expect(state.totalXp).toBe(0);
    expect(state.stats.find((s) => s.stat === 'strength')?.xp).toBe(0);
  });

  it('treats a missed day (no award) as no change, never a penalty', () => {
    const state = applyXpAward(freshState(), 'strength', 500);
    const afterMissedDay = applyXpAward(state, 'strength', 0);
    expect(afterMissedDay.totalXp).toBe(state.totalXp);
    expect(afterMissedDay.overallLevel).toBe(state.overallLevel);
  });

  it('keeps overall level monotonic across repeated awards', () => {
    let state = freshState();
    let lastLevel = state.overallLevel;
    for (let i = 0; i < 20; i += 1) {
      state = applyXpAward(state, 'rhythm', 200);
      expect(state.overallLevel).toBeGreaterThanOrEqual(lastLevel);
      lastLevel = state.overallLevel;
    }
  });
});
