import type { AvatarProgressionState, GameStat, GameStatValue } from '@tempo/contracts';
import { levelForXp } from './level';

/**
 * Deterministic avatar stat/progression updates.
 *
 * Progression only ever ADDS earned XP. It never decays and never reduces a
 * level, so missed days, injury, disability, recovery, and under-fueling are
 * never punished (CLAUDE.md §26 Avatar Engine / Game Engine).
 */

/** Apply earned personal XP to a single stat. Level is re-derived from XP. */
export function applyStatXp(current: GameStatValue, personalXp: number): GameStatValue {
  const xp = current.xp + Math.max(0, Math.trunc(personalXp));
  return { stat: current.stat, xp, level: levelForXp(xp) };
}

/**
 * Apply an earned personal XP award to the full progression state, updating the
 * target stat, total XP, and overall level. Returns a new state; never mutates.
 */
export function applyXpAward(
  state: AvatarProgressionState,
  stat: GameStat,
  personalXp: number,
): AvatarProgressionState {
  const add = Math.max(0, Math.trunc(personalXp));
  const stats = state.stats.map((value) => (value.stat === stat ? applyStatXp(value, add) : value));
  const totalXp = state.totalXp + add;
  return {
    ...state,
    stats,
    totalXp,
    overallLevel: levelForXp(totalXp),
  };
}
