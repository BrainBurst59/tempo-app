import { z } from 'zod';
import { TempoStateSchema } from './tempo-state';

export const AvatarArchetypeSchema = z.enum(['masculine', 'feminine', 'androgynous']);
export type AvatarArchetype = z.infer<typeof AvatarArchetypeSchema>;

export const AvatarEvolutionStageSchema = z.enum(['base', 'consistent', 'charged', 'peak_rhythm']);
export type AvatarEvolutionStage = z.infer<typeof AvatarEvolutionStageSchema>;

export const AvatarStateSchema = z.object({
  archetype: AvatarArchetypeSchema,
  evolutionStage: AvatarEvolutionStageSchema,
  tempoState: TempoStateSchema,
  auraIntensity: z.number().min(0).max(100),
  equippedUnlocks: z.array(z.string()).default([]),
});
export type AvatarState = z.infer<typeof AvatarStateSchema>;
