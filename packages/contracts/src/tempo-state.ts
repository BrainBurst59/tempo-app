import { z } from 'zod';

export const TempoStateSchema = z.enum(['push', 'build', 'hold', 'recover', 'reset']);
export type TempoState = z.infer<typeof TempoStateSchema>;

export const TempoPillarSchema = z.enum(['today', 'train', 'fuel', 'move', 'progress']);
export type TempoPillar = z.infer<typeof TempoPillarSchema>;
