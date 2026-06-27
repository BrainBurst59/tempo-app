import { z } from 'zod';

/**
 * Game Engine contracts — workout verification.
 *
 * Verification gates COMPETITIVE rewards only. Personal progress is always
 * earnable from honest activity (CLAUDE.md §26 Game Engine). Classification is
 * produced by deterministic rules in `@tempo/rules-engine`, never by AI.
 */

/** Confidence that a logged workout actually happened as claimed. */
export const WorkoutVerificationLevelSchema = z.enum([
  'unverified',
  'standard',
  'high_confidence',
  'suspicious',
]);
export type WorkoutVerificationLevel = z.infer<typeof WorkoutVerificationLevelSchema>;

/**
 * Corroborating evidence types. The engine uses signal PRESENCE and derived
 * plausibility, not raw sensitive streams; raw HR/GPS/motion data is never part
 * of this contract (CLAUDE.md §17 — no sensitive payloads in analytics/logs).
 */
export const VerificationSignalSchema = z.enum([
  'wearable_heart_rate',
  'wearable_workout_session',
  'motion_sensor',
  'gps_route',
  'location_dwell',
  'app_foreground_session',
]);
export type VerificationSignal = z.infer<typeof VerificationSignalSchema>;

/** The classified verification outcome for a single workout. */
export const VerificationConfidenceScoreSchema = z.object({
  level: WorkoutVerificationLevelSchema,
  score: z.number().int().min(0).max(100),
  corroboratingSignals: z.array(VerificationSignalSchema),
  reasonCodes: z.array(z.string()),
});
export type VerificationConfidenceScore = z.infer<typeof VerificationConfidenceScoreSchema>;
