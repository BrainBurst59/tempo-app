import { z } from 'zod';
import { AvatarArchetypeSchema, AvatarEvolutionStageSchema } from '../avatar';

/**
 * Game Engine contracts — stats and avatar progression.
 *
 * Data classification: Sensitive Personal Data (CLAUDE.md §9) — progression is
 * derived from health/fitness activity. Progression is monotonic in earned XP:
 * it never decays and never punishes missed days, injury, disability, recovery,
 * or under-fueling (CLAUDE.md §26 Game Engine / Avatar Engine).
 */

/** The seven TEMPO game stats. Progression is expressed across all of them. */
export const GameStatSchema = z.enum([
  'strength',
  'endurance',
  'mobility',
  'fuel',
  'recovery',
  'technique',
  'rhythm',
]);
export type GameStat = z.infer<typeof GameStatSchema>;

/** All game stats, in canonical order. */
export const GAME_STATS = GameStatSchema.options;

/** A single stat's earned standing. `level` is derived from `xp`; both are
 * non-negative and never decrease as a punishment. */
export const GameStatValueSchema = z.object({
  stat: GameStatSchema,
  level: z.number().int().min(1).max(99),
  xp: z.number().int().min(0),
});
export type GameStatValue = z.infer<typeof GameStatValueSchema>;

/**
 * The avatar's full game progression state. Archetype and evolution stage are
 * reused from the Avatar contracts (not duplicated). `stats` holds exactly one
 * entry per `GameStat`, with no duplicates.
 */
export const AvatarProgressionStateSchema = z.object({
  userId: z.string().min(1),
  archetype: AvatarArchetypeSchema,
  evolutionStage: AvatarEvolutionStageSchema,
  overallLevel: z.number().int().min(1).max(99),
  totalXp: z.number().int().min(0),
  stats: z
    .array(GameStatValueSchema)
    .length(GAME_STATS.length)
    .refine((values) => new Set(values.map((v) => v.stat)).size === values.length, {
      message: 'stats must contain each GameStat at most once',
    }),
  updatedAt: z.string().datetime(),
});
export type AvatarProgressionState = z.infer<typeof AvatarProgressionStateSchema>;
