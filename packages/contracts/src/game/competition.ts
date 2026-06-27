import { z } from 'zod';
import { GameStatSchema } from './stats';
import { WorkoutVerificationLevelSchema } from './verification';

/**
 * Game Engine contracts — competitions, leaderboards, and ghost rivals.
 *
 * Privacy by default (CLAUDE.md §10, §26): participation is opt-in, default
 * visibility is private, leaderboards expose pseudonymous handles and opaque
 * references only, and ghost rivals are privacy-preserving. Only competitive XP
 * from verified activity contributes, so standings cannot be bought or faked.
 */

export const CompetitionTypeSchema = z.enum([
  'asynchronous_challenge',
  'ghost_rival',
  'leaderboard_season',
]);
export type CompetitionType = z.infer<typeof CompetitionTypeSchema>;

/** Who can see a participant's standing. Default is the most private. */
export const CompetitionVisibilitySchema = z.enum([
  'private',
  'friends_opt_in',
  'public_pseudonymous',
]);
export type CompetitionVisibility = z.infer<typeof CompetitionVisibilitySchema>;

export const CompetitionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  type: CompetitionTypeSchema,
  metricStat: GameStatSchema,
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  visibilityDefault: CompetitionVisibilitySchema.default('private'),
  /** Participation is always explicit opt-in. */
  optInRequired: z.literal(true),
});
export type Competition = z.infer<typeof CompetitionSchema>;

export const CompetitionEntrySchema = z.object({
  competitionId: z.string().min(1),
  userId: z.string().min(1),
  /** Recorded explicit opt-in; an entry cannot exist without it. */
  optedIn: z.literal(true),
  visibility: CompetitionVisibilitySchema,
  competitiveXp: z.number().int().min(0),
  verificationLevel: WorkoutVerificationLevelSchema,
  joinedAt: z.string().datetime(),
});
export type CompetitionEntry = z.infer<typeof CompetitionEntrySchema>;

/**
 * A leaderboard row. Exposes a pseudonymous handle and an opaque participant
 * reference — never a raw user id or real name (unless the user has explicitly
 * opted to reveal it elsewhere). `isSelf` lets the client highlight the viewer.
 */
export const LeaderboardEntrySchema = z.object({
  competitionId: z.string().min(1),
  rank: z.number().int().positive(),
  participantRef: z.string().min(1),
  displayHandle: z.string().min(1).max(40),
  score: z.number().int().min(0),
  isSelf: z.boolean(),
});
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

/** Source of a ghost-rival pace line. A friend's pace requires their opt-in;
 * synthetic pacers carry no personal data. */
export const GhostRivalSourceSchema = z.enum(['self_past', 'opted_in_friend', 'synthetic_pacer']);
export type GhostRivalSource = z.infer<typeof GhostRivalSourceSchema>;

export const GhostRivalPacePointSchema = z.object({
  atMinute: z.number().int().min(0),
  score: z.number().int().min(0),
});
export type GhostRivalPacePoint = z.infer<typeof GhostRivalPacePointSchema>;

export const GhostRivalSchema = z.object({
  id: z.string().min(1),
  ownerUserId: z.string().min(1),
  source: GhostRivalSourceSchema,
  label: z.string().min(1).max(40),
  metricStat: GameStatSchema,
  pace: z.array(GhostRivalPacePointSchema),
  /** Ghost rivals never expose identifying data about another user. */
  privacyPreserving: z.literal(true),
});
export type GhostRival = z.infer<typeof GhostRivalSchema>;
