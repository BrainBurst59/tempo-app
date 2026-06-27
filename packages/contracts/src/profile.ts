import { z } from 'zod';
import { AvatarArchetypeSchema } from './avatar';

/**
 * Shared fitness goal vocabulary. Single source of truth re-used by the Today
 * Engine signal input and the user profile so they cannot drift apart.
 */
export const FitnessGoalSchema = z.enum([
  'build_muscle',
  'lose_fat',
  'gain_strength',
  'recomposition',
  'endurance',
  'general_fitness',
]);
export type FitnessGoal = z.infer<typeof FitnessGoalSchema>;

export const BiologicalSexSchema = z.enum(['female', 'male', 'intersex', 'prefer_not_to_say']);
export type BiologicalSex = z.infer<typeof BiologicalSexSchema>;

export const MeasurementSystemSchema = z.enum(['metric', 'imperial']);
export type MeasurementSystem = z.infer<typeof MeasurementSystemSchema>;

/**
 * TEMPO user profile.
 *
 * Data classification: Sensitive Personal Data (CLAUDE.md §9) — body metrics,
 * sex, and birth date are optional/nullable, minimized, and only collected with
 * consent. `userId` is the internal TEMPO id (server-generated), never the raw
 * Clerk id. Timestamps are ISO-8601 UTC strings.
 */
export const UserProfileSchema = z.object({
  userId: z.string().min(1),
  displayName: z.string().min(1).max(80),
  biologicalSex: BiologicalSexSchema.nullable(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  heightCm: z.number().min(50).max(272).nullable(),
  weightKg: z.number().min(20).max(400).nullable(),
  primaryGoal: FitnessGoalSchema,
  measurementSystem: MeasurementSystemSchema,
  avatarArchetype: AvatarArchetypeSchema.nullable(),
  onboardingCompletedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Mutable subset of the profile a client may update. `.strict()` blocks mass
 * assignment of server-owned fields (ids, timestamps) per CLAUDE.md §14.
 */
export const UserProfileUpdateSchema = z
  .object({
    displayName: z.string().min(1).max(80),
    biologicalSex: BiologicalSexSchema.nullable(),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
    heightCm: z.number().min(50).max(272).nullable(),
    weightKg: z.number().min(20).max(400).nullable(),
    primaryGoal: FitnessGoalSchema,
    measurementSystem: MeasurementSystemSchema,
    avatarArchetype: AvatarArchetypeSchema.nullable(),
  })
  .partial()
  .strict();
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;
