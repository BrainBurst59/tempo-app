import { describe, expect, it } from 'vitest';
import { EnvValidationError, loadEnv, parseAuthorizedParties } from './env';

describe('loadEnv', () => {
  it('accepts a minimal valid env and applies defaults', () => {
    const env = loadEnv({ CLERK_SECRET_KEY: 'test-clerk-secret' });
    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(3000);
  });

  it('requires CLERK_SECRET_KEY', () => {
    expect(() => loadEnv({})).toThrow(EnvValidationError);
  });

  it('coerces PORT from a string', () => {
    expect(loadEnv({ CLERK_SECRET_KEY: 'x', PORT: '8080' }).PORT).toBe(8080);
  });

  it('never includes the offending value in the error message', () => {
    const secret = 'this-should-not-leak';
    try {
      loadEnv({ CLERK_SECRET_KEY: 'x', DATABASE_URL: secret });
    } catch (error) {
      expect((error as EnvValidationError).message).not.toContain(secret);
    }
  });
});

describe('parseAuthorizedParties', () => {
  it('splits and trims, or returns undefined when empty', () => {
    expect(parseAuthorizedParties('a, b')).toEqual(['a', 'b']);
    expect(parseAuthorizedParties(undefined)).toBeUndefined();
    expect(parseAuthorizedParties('   ')).toBeUndefined();
  });
});
