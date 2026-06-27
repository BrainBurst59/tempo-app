import { describe, expect, it } from 'vitest';
import { resolveAuthRoute } from './routing';

describe('resolveAuthRoute', () => {
  it('shows the splash until Clerk has loaded', () => {
    expect(
      resolveAuthRoute({ isLoaded: false, isSignedIn: false, onboardingComplete: false }),
    ).toBe('splash');
  });

  it('sends signed-out users to auth', () => {
    expect(resolveAuthRoute({ isLoaded: true, isSignedIn: false, onboardingComplete: false })).toBe(
      'auth',
    );
  });

  it('sends signed-in users without onboarding to onboarding', () => {
    expect(resolveAuthRoute({ isLoaded: true, isSignedIn: true, onboardingComplete: false })).toBe(
      'onboarding',
    );
  });

  it('sends fully onboarded users to the app', () => {
    expect(resolveAuthRoute({ isLoaded: true, isSignedIn: true, onboardingComplete: true })).toBe(
      'app',
    );
  });
});
