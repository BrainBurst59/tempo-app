import { describe, expect, it } from 'vitest';
import { isOnboardingComplete } from './onboarding-complete';

describe('isOnboardingComplete', () => {
  it('is true only when the flag is exactly true', () => {
    expect(isOnboardingComplete({ onboardingComplete: true })).toBe(true);
  });

  it('is false for missing/falsey/unknown shapes', () => {
    expect(isOnboardingComplete(undefined)).toBe(false);
    expect(isOnboardingComplete(null)).toBe(false);
    expect(isOnboardingComplete({})).toBe(false);
    expect(isOnboardingComplete({ onboardingComplete: 'true' })).toBe(false);
    expect(isOnboardingComplete('nope')).toBe(false);
  });
});
