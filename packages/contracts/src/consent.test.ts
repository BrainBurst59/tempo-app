import { describe, expect, it } from 'vitest';
import { ConsentDecisionInputSchema, ConsentRecordSchema } from './consent';

const grantedRecord = {
  id: 'cns_1',
  userId: 'usr_123',
  purpose: 'health_personalization' as const,
  decision: 'granted' as const,
  dataCategories: ['health', 'fitness'] as const,
  policyVersion: '1.0.0',
  source: 'onboarding' as const,
  decidedAt: '2026-06-27T00:00:00.000Z',
};

describe('ConsentRecordSchema', () => {
  it('accepts a granted consent event', () => {
    expect(ConsentRecordSchema.parse(grantedRecord).decision).toBe('granted');
  });

  it('models revocation as a new event, not a mutation', () => {
    const revocation = {
      ...grantedRecord,
      id: 'cns_2',
      decision: 'revoked' as const,
      decidedAt: '2026-06-28T00:00:00.000Z',
    };
    expect(ConsentRecordSchema.parse(revocation).decision).toBe('revoked');
  });

  it('enforces a semver policy version', () => {
    expect(() => ConsentRecordSchema.parse({ ...grantedRecord, policyVersion: 'v1' })).toThrow();
  });
});

describe('ConsentDecisionInputSchema', () => {
  it('rejects unknown fields (no mass assignment)', () => {
    expect(() =>
      ConsentDecisionInputSchema.parse({
        purpose: 'account',
        decision: 'granted',
        policyVersion: '1.0.0',
        source: 'onboarding',
        userId: 'spoofed',
      }),
    ).toThrow();
  });

  it('defaults dataCategories to an empty array', () => {
    const parsed = ConsentDecisionInputSchema.parse({
      purpose: 'account',
      decision: 'granted',
      policyVersion: '1.0.0',
      source: 'onboarding',
    });
    expect(parsed.dataCategories).toEqual([]);
  });
});
