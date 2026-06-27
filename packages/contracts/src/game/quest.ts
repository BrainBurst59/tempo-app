import { z } from 'zod';
import { GameStatSchema } from './stats';
import { XpStatTargetSchema } from './xp';
import { WorkoutVerificationLevelSchema } from './verification';

/**
 * Game Engine contracts — quests, rewards, and the cosmetic catalog.
 *
 * Earn-not-buy invariant (CLAUDE.md §26): rewards grant XP earned through the
 * required activity and/or cosmetic items only. The catalog schema makes a
 * performance-affecting purchasable item UNREPRESENTABLE.
 */

export const QuestCategorySchema = z.enum(['daily', 'weekly', 'milestone', 'event', 'seasonal']);
export type QuestCategory = z.infer<typeof QuestCategorySchema>;

export const QuestObjectiveTypeSchema = z.enum([
  'complete_sessions',
  'accumulate_minutes',
  'accumulate_xp',
  'log_recovery',
  'hit_consistency_streak',
]);
export type QuestObjectiveType = z.infer<typeof QuestObjectiveTypeSchema>;

export const QuestStatusSchema = z.enum(['locked', 'available', 'active', 'completed', 'expired']);
export type QuestStatus = z.infer<typeof QuestStatusSchema>;

/** Cosmetic, non-performance reward item types. */
export const RewardCatalogItemTypeSchema = z.enum([
  'skin',
  'aura_effect',
  'arena_theme',
  'companion_animation',
  'ring_unlock',
  'avatar_accessory',
]);
export type RewardCatalogItemType = z.infer<typeof RewardCatalogItemTypeSchema>;

/** How a cosmetic is obtained. Both paths yield identical visual-only effects. */
export const RewardAcquisitionSchema = z.enum(['earned', 'purchasable']);
export type RewardAcquisition = z.infer<typeof RewardAcquisitionSchema>;

/**
 * A catalog item. `isCosmeticOnly` and `affectsPerformance` are LITERALS so the
 * type system forbids a purchasable item that grants stats, XP-as-progress, or
 * competitive advantage (CLAUDE.md §26 — fitness progress cannot be purchased).
 */
export const RewardCatalogItemSchema = z
  .object({
    id: z.string().min(1),
    type: RewardCatalogItemTypeSchema,
    name: z.string().min(1).max(80),
    isCosmeticOnly: z.literal(true),
    affectsPerformance: z.literal(false),
    acquisition: RewardAcquisitionSchema,
  })
  .strict();
export type RewardCatalogItem = z.infer<typeof RewardCatalogItemSchema>;

/**
 * A quest reward: XP earned via the quest's required activity and/or a single
 * cosmetic item. Rewards never grant raw stat boosts or competitive advantage.
 */
export const QuestRewardSchema = z
  .object({
    xp: z.number().int().min(0).default(0),
    xpTarget: XpStatTargetSchema.default('overall'),
    cosmeticItemId: z.string().min(1).nullable().default(null),
  })
  .strict();
export type QuestReward = z.infer<typeof QuestRewardSchema>;

export const QuestSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  category: QuestCategorySchema,
  targetStat: GameStatSchema.nullable(),
  objectiveType: QuestObjectiveTypeSchema,
  objectiveTarget: z.number().int().positive(),
  /** Minimum verification level for this quest to grant COMPETITIVE credit.
   * `null` means the quest is personal-progress only. */
  competitiveVerificationFloor: WorkoutVerificationLevelSchema.nullable(),
  reward: QuestRewardSchema,
});
export type Quest = z.infer<typeof QuestSchema>;

export const QuestProgressSchema = z.object({
  userId: z.string().min(1),
  questId: z.string().min(1),
  status: QuestStatusSchema,
  current: z.number().int().min(0),
  target: z.number().int().positive(),
  completedAt: z.string().datetime().nullable(),
});
export type QuestProgress = z.infer<typeof QuestProgressSchema>;
