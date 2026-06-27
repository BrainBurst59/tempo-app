import { describe, expect, it } from 'vitest';
import {
  canCompleteOnboarding,
  initialOnboardingState,
  onboardingReducer,
  type OnboardingState,
} from './state';

describe('onboardingReducer', () => {
  it('records selections immutably', () => {
    const next = onboardingReducer(initialOnboardingState, {
      type: 'set_archetype',
      value: 'androgynous',
    });
    expect(next.archetype).toBe('androgynous');
    expect(initialOnboardingState.archetype).toBeNull();
  });

  it('toggles a single consent without affecting others', () => {
    const next = onboardingReducer(initialOnboardingState, {
      type: 'set_consent',
      purpose: 'health_personalization',
      granted: true,
    });
    expect(next.consents.health_personalization).toBe(true);
    expect(next.consents.account).toBe(false);
  });
});

describe('canCompleteOnboarding', () => {
  const ready: OnboardingState = {
    displayName: 'Lannie',
    archetype: 'androgynous',
    primaryGoal: 'recomposition',
    consents: { ...initialOnboardingState.consents, account: true },
  };

  it('requires name, archetype, goal, and account consent', () => {
    expect(canCompleteOnboarding(ready)).toBe(true);
  });

  it('blocks completion without the mandatory account consent', () => {
    expect(
      canCompleteOnboarding({ ...ready, consents: { ...ready.consents, account: false } }),
    ).toBe(false);
  });

  it('blocks completion with a blank name', () => {
    expect(canCompleteOnboarding({ ...ready, displayName: '   ' })).toBe(false);
  });

  it('does not pre-grant any sensitive consent by default', () => {
    expect(initialOnboardingState.consents.health_personalization).toBe(false);
    expect(initialOnboardingState.consents.location_activity).toBe(false);
  });
});
