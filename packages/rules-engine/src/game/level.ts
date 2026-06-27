/**
 * Deterministic level curve for the Game Engine.
 *
 * The curve is integer-only and monotonic: more XP never lowers a level. Levels
 * are derived purely from cumulative XP, so progression cannot be punished by
 * inactivity, injury, or recovery (CLAUDE.md §26 Game Engine).
 */

export const MAX_LEVEL = 99;
const BASE_XP = 300;
const STEP_XP = 120;

/** XP required to advance FROM `level` to `level + 1`. Grows linearly, which
 * makes the cumulative curve quadratic. */
export function xpToAdvanceFromLevel(level: number): number {
  const safeLevel = Math.max(1, Math.trunc(level));
  return BASE_XP + STEP_XP * (safeLevel - 1);
}

/** Total cumulative XP required to REACH `level` (level 1 requires 0). */
export function cumulativeXpForLevel(level: number): number {
  const target = Math.min(MAX_LEVEL, Math.max(1, Math.trunc(level)));
  let total = 0;
  for (let l = 1; l < target; l += 1) {
    total += xpToAdvanceFromLevel(l);
  }
  return total;
}

/** The level corresponding to a total XP amount, clamped to [1, MAX_LEVEL]. */
export function levelForXp(totalXp: number): number {
  const xp = Math.max(0, Math.trunc(totalXp));
  let level = 1;
  while (level < MAX_LEVEL && cumulativeXpForLevel(level + 1) <= xp) {
    level += 1;
  }
  return level;
}
