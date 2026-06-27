import { z } from 'zod';

export const ConsentStatusSchema = z.enum(['not_requested', 'granted', 'denied', 'revoked']);
export type ConsentStatus = z.infer<typeof ConsentStatusSchema>;

export const SensitiveDataCategorySchema = z.enum([
  'health',
  'fitness',
  'nutrition',
  'location',
  'gps_route',
  'camera',
  'photo',
  'video',
  'body_metric',
  'ai_inference',
]);
export type SensitiveDataCategory = z.infer<typeof SensitiveDataCategorySchema>;
