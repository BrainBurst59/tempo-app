import { describe, expect, it } from 'vitest';
import { AccountDeletionRequestSchema, IdentitySyncInputSchema } from './identity';

describe('AccountDeletionRequestSchema', () => {
  it('requires explicit confirm: true', () => {
    expect(AccountDeletionRequestSchema.parse({ confirm: true }).confirm).toBe(true);
  });

  it('rejects an unconfirmed or empty request', () => {
    expect(() => AccountDeletionRequestSchema.parse({})).toThrow();
    expect(() => AccountDeletionRequestSchema.parse({ confirm: false })).toThrow();
  });
});

describe('IdentitySyncInputSchema', () => {
  it('treats body as display hints only and rejects identity spoofing fields', () => {
    expect(() => IdentitySyncInputSchema.parse({ clerkUserId: 'attacker' })).toThrow();
    expect(IdentitySyncInputSchema.parse({ displayName: 'Lannie' }).displayName).toBe('Lannie');
  });
});
