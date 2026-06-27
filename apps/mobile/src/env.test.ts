import { describe, expect, it } from 'vitest';
import { ClientEnvError, validateClientEnv } from './env';

describe('validateClientEnv', () => {
  it('accepts a valid Clerk publishable test key', () => {
    const env = validateClientEnv({ EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_fixture_only' });
    expect(env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY).toBe('pk_test_fixture_only');
  });

  it('rejects a missing key', () => {
    expect(() => validateClientEnv({})).toThrow(ClientEnvError);
  });

  it('rejects a malformed key (wrong prefix)', () => {
    expect(() =>
      validateClientEnv({ EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: 'invalid_server_secret_fixture' }),
    ).toThrow(ClientEnvError);
  });

  it('never includes the offending value in the error message', () => {
    const secret = 'pk_wrong_should_not_leak';
    try {
      validateClientEnv({ EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: secret });
    } catch (error) {
      expect((error as ClientEnvError).message).not.toContain(secret);
    }
  });
});
