import { z } from 'zod';
import { SensitiveDataCategorySchema } from './privacy';

/** Semantic version of the privacy/consent policy the user acted on. */
export const ConsentPolicyVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);
export type ConsentPolicyVersion = z.infer<typeof ConsentPolicyVersionSchema>;

/** What the user is consenting to. Each purpose maps to a real, visible feature. */
export const ConsentPurposeSchema = z.enum([
  'account',
  'health_personalization',
  'food_photo_ai',
  'location_activity',
  'form_check_media',
  'progress_media',
  'analytics_product',
]);
export type ConsentPurpose = z.infer<typeof ConsentPurposeSchema>;

/** A recorded consent decision. Distinct from privacy.ConsentStatus, which also
 * models the `not_requested` lifecycle state that is never persisted as an event. */
export const ConsentDecisionSchema = z.enum(['granted', 'denied', 'revoked']);
export type ConsentDecision = z.infer<typeof ConsentDecisionSchema>;

export const ConsentSourceSchema = z.enum(['onboarding', 'settings', 'permission_prompt']);
export type ConsentSource = z.infer<typeof ConsentSourceSchema>;

/**
 * An immutable, append-only consent event (CLAUDE.md §10). Consent is explicit,
 * timestamped, versioned, and revocable: a revocation is a NEW record with
 * `decision: 'revoked'`, never a mutation or deletion of prior history.
 */
export const ConsentRecordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  purpose: ConsentPurposeSchema,
  decision: ConsentDecisionSchema,
  dataCategories: z.array(SensitiveDataCategorySchema),
  policyVersion: ConsentPolicyVersionSchema,
  source: ConsentSourceSchema,
  decidedAt: z.string().datetime(),
});
export type ConsentRecord = z.infer<typeof ConsentRecordSchema>;

/** Client input to record a consent decision; server stamps `id`/`decidedAt`. */
export const ConsentDecisionInputSchema = z
  .object({
    purpose: ConsentPurposeSchema,
    decision: ConsentDecisionSchema,
    dataCategories: z.array(SensitiveDataCategorySchema).default([]),
    policyVersion: ConsentPolicyVersionSchema,
    source: ConsentSourceSchema,
  })
  .strict();
export type ConsentDecisionInput = z.infer<typeof ConsentDecisionInputSchema>;

/** Effective consent = the latest decision per purpose, derived from the log. */
export const EffectiveConsentSchema = z.object({
  purpose: ConsentPurposeSchema,
  decision: ConsentDecisionSchema,
  policyVersion: ConsentPolicyVersionSchema,
  decidedAt: z.string().datetime(),
});
export type EffectiveConsent = z.infer<typeof EffectiveConsentSchema>;
