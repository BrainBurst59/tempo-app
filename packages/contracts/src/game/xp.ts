import { z } from 'zod';
import { GameStatSchema } from './stats';
import { WorkoutVerificationLevelSchema } from './verification';

/**
 * Game Engine contracts — XP economy and economy audit events.
 *
 * XP is split into non-fungible kinds: `personal` (the user's own progress,
 * always earnable from honest activity) and `competitive` (gated by verification
 * and safety). Ledger entries and economy events are append-only and auditable
 * (CLAUDE.md §18 — no silent mutation; reverse only via compensating entries).
 */

/** XP targets either a specific stat or the avatar's overall progression. */
export const XpStatTargetSchema = z.union([GameStatSchema, z.literal('overall')]);
export type XpStatTarget = z.infer<typeof XpStatTargetSchema>;

/** Whether XP counts only for the user's own progress or for competition. */
export const XpKindSchema = z.enum(['personal', 'competitive']);
export type XpKind = z.infer<typeof XpKindSchema>;

/** Types of auditable economy state changes. */
export const GameEconomyEventTypeSchema = z.enum([
  'xp_awarded',
  'level_up',
  'stat_level_up',
  'quest_completed',
  'reward_granted',
  'cosmetic_unlocked',
  'diminishing_returns_applied',
  'daily_load_protection_applied',
  'safety_review_flagged',
  'competitive_xp_withheld',
]);
export type GameEconomyEventType = z.infer<typeof GameEconomyEventTypeSchema>;

/**
 * One append-only XP award. `id`/`occurredAt` are server-generated. `amount` is
 * non-negative; XP is never deducted as a punishment.
 */
export const XpLedgerEntrySchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  occurredAt: z.string().datetime(),
  target: XpStatTargetSchema,
  amount: z.number().int().min(0),
  kind: XpKindSchema,
  source: GameEconomyEventTypeSchema,
  verificationLevel: WorkoutVerificationLevelSchema,
  questId: z.string().min(1).nullable(),
  reasonCodes: z.array(z.string()),
});
export type XpLedgerEntry = z.infer<typeof XpLedgerEntrySchema>;

/**
 * An append-only economy audit event. `detail` carries only non-sensitive,
 * derived metadata (CLAUDE.md §17) — never raw health/location payloads.
 */
export const GameEconomyEventSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  type: GameEconomyEventTypeSchema,
  occurredAt: z.string().datetime(),
  detail: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
});
export type GameEconomyEvent = z.infer<typeof GameEconomyEventSchema>;
