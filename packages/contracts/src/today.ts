import { z } from 'zod';
import { TempoStateSchema } from './tempo-state';
import { FitnessGoalSchema } from './profile';

export const FuelStatusSchema = z.enum(['under_target', 'on_target', 'over_target', 'unknown']);
export type FuelStatus = z.infer<typeof FuelStatusSchema>;
export const RecoveryStatusSchema = z.enum(['low', 'steady', 'high', 'unknown']);
export type RecoveryStatus = z.infer<typeof RecoveryStatusSchema>;
export const SorenessStatusSchema = z.enum(['none', 'mild', 'heavy', 'pain_flag']);
export type SorenessStatus = z.infer<typeof SorenessStatusSchema>;
export const WeatherOpportunitySchema = z.enum([
  'good_outdoor',
  'neutral',
  'poor_outdoor',
  'unknown',
]);

export const TodaySignalInputSchema = z.object({
  userId: z.string().min(1),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  goal: FitnessGoalSchema,
  plannedTrainingMinutes: z.number().int().min(0).max(180),
  availableMinutes: z.number().int().min(0).max(240),
  fuelStatus: FuelStatusSchema,
  calorieDeltaFromTarget: z.number().int().min(-5000).max(5000).nullable(),
  recoveryStatus: RecoveryStatusSchema,
  sorenessStatus: SorenessStatusSchema,
  sleepQualityScore: z.number().min(0).max(100).nullable(),
  recentTrainingLoadScore: z.number().min(0).max(100),
  weatherOpportunity: WeatherOpportunitySchema,
  wearableHeartRateTrend: z.enum(['normal', 'elevated', 'low_confidence', 'unknown']),
});
export type TodaySignalInput = z.infer<typeof TodaySignalInputSchema>;

export const TodayRecommendationSchema = z.object({
  tempoState: TempoStateSchema,
  title: z.string().min(1),
  primaryActionLabel: z.string().min(1),
  secondaryActionLabel: z.string().min(1),
  trainingMinutes: z.number().int().min(0).max(180),
  movementMinutes: z.number().int().min(0).max(240),
  reasonCodes: z.array(z.string()).min(1),
  coachExplanation: z.string().min(1),
  safetyWarnings: z.array(z.string()),
});
export type TodayRecommendation = z.infer<typeof TodayRecommendationSchema>;
