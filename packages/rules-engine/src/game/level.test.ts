import { describe, expect, it } from 'vitest';
import { MAX_LEVEL, cumulativeXpForLevel, levelForXp, xpToAdvanceFromLevel } from './level';

describe('level curve', () => {
  it('starts at level 1 with zero cumulative XP', () => {
    expect(cumulativeXpForLevel(1)).toBe(0);
    expect(levelForXp(0)).toBe(1);
  });

  it('is integer and increasing per level', () => {
    expect(xpToAdvanceFromLevel(1)).toBe(300);
    expect(xpToAdvanceFromLevel(2)).toBeGreaterThan(xpToAdvanceFromLevel(1));
    expect(cumulativeXpForLevel(2)).toBe(300);
    expect(cumulativeXpForLevel(3)).toBe(720);
  });

  it('maps XP to the correct level at thresholds', () => {
    expect(levelForXp(299)).toBe(1);
    expect(levelForXp(300)).toBe(2);
    expect(levelForXp(719)).toBe(2);
    expect(levelForXp(720)).toBe(3);
  });

  it('clamps to MAX_LEVEL and never below 1', () => {
    expect(levelForXp(Number.MAX_SAFE_INTEGER)).toBe(MAX_LEVEL);
    expect(levelForXp(-100)).toBe(1);
  });

  it('is monotonic: more XP never lowers the level', () => {
    let last = 1;
    for (let xp = 0; xp <= 10000; xp += 137) {
      const level = levelForXp(xp);
      expect(level).toBeGreaterThanOrEqual(last);
      last = level;
    }
  });
});
