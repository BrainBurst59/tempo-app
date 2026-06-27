import { describe, expect, it } from 'vitest';
import { clerkErrorMessage } from './clerk-error';

describe('clerkErrorMessage', () => {
  it('returns the first Clerk error message', () => {
    expect(clerkErrorMessage({ errors: [{ message: 'Incorrect password.' }] })).toBe(
      'Incorrect password.',
    );
  });

  it('falls back for unknown error shapes', () => {
    expect(clerkErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
    expect(clerkErrorMessage(undefined, 'fallback')).toBe('fallback');
    expect(clerkErrorMessage({ errors: [] }, 'fallback')).toBe('fallback');
  });
});
