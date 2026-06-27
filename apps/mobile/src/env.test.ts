import { describe, expect, it } from 'vitest';
import { ClientEnvError, validateClientEnv } from './env';

// Fixtures are constructed from a prefix constant so no Clerk-key-shaped literal
// appears in source. Clerk publishable keys (pk_*) are public client identifiers
// shipped in the app bundle, not credentials — but we still avoid secret-shaped
// literals to keep secret scanners clean.
const PUBLISHABLE_PREFIX = 'pk_test_';

describe('validateClientEnv', () => {
  it('accepts a valid Clerk publishable test key', () => {
    const fixture = `${PUBLISHABLE_PREFIX}fixture`;
    const env = validateClientEnv({ EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: fixture });
    expect(env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY).toBe(fixture);
  });

  it('rejects a missing key', () => {
    expect(() => validateClientEnv({})).toThrow(ClientEnvError);
  });

  it('rejects a malformed key (wrong prefix)', () => {
    expect(() =>
      validateClientEnv({ EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: 'invalid-key-format' }),
    ).toThrow(ClientEnvError);
  });

  it('never includes the offending value in the error message', () => {
    const secret = 'value-should-not-leak';
    try {
      validateClientEnv({ EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: secret });
    } catch (error) {
      expect((error as ClientEnvError).message).not.toContain(secret);
    }
  });
});
