import { z } from 'zod';

/**
 * Body sent by the mobile app right after Clerk sign-in to provision/sync the
 * TEMPO user. The server derives identity (Clerk user id, email) from the
 * VERIFIED JWT, never from this body — these are display hints only.
 */
export const IdentitySyncInputSchema = z
  .object({
    displayName: z.string().min(1).max(80).optional(),
  })
  .strict();
export type IdentitySyncInput = z.infer<typeof IdentitySyncInputSchema>;

/** The authenticated principal resolved from a verified Clerk session token. */
export const AuthenticatedUserSchema = z.object({
  userId: z.string().min(1),
  clerkUserId: z.string().min(1),
  email: z.string().email().nullable(),
  createdAt: z.string().datetime(),
});
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;

/**
 * Explicit account-deletion request. `confirm` must be literal `true` so a
 * deletion can never be triggered by an empty/default body (CLAUDE.md §10/§20).
 */
export const AccountDeletionRequestSchema = z
  .object({
    confirm: z.literal(true),
    reason: z.string().max(500).optional(),
  })
  .strict();
export type AccountDeletionRequest = z.infer<typeof AccountDeletionRequestSchema>;

/** Request to export the user's own data. Processing is a later service
 * milestone; this fixes the request/record contract now. */
export const DataExportRequestSchema = z
  .object({
    categories: z.array(z.string()).default([]),
  })
  .strict();
export type DataExportRequest = z.infer<typeof DataExportRequestSchema>;

export const DataExportStatusSchema = z.enum([
  'requested',
  'processing',
  'ready',
  'failed',
  'expired',
]);
export type DataExportStatus = z.infer<typeof DataExportStatusSchema>;

export const DataExportRecordSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  status: DataExportStatusSchema,
  requestedAt: z.string().datetime(),
  readyAt: z.string().datetime().nullable(),
});
export type DataExportRecord = z.infer<typeof DataExportRecordSchema>;
