import type { AvatarArchetype, ConsentPurpose, FitnessGoal } from '@tempo/contracts';

/** Local, in-flight onboarding selections before they are persisted. */
export type OnboardingState = {
  displayName: string;
  archetype: AvatarArchetype | null;
  primaryGoal: FitnessGoal | null;
  consents: Record<ConsentPurpose, boolean>;
};

export type OnboardingAction =
  | { type: 'set_display_name'; value: string }
  | { type: 'set_archetype'; value: AvatarArchetype }
  | { type: 'set_goal'; value: FitnessGoal }
  | { type: 'set_consent'; purpose: ConsentPurpose; granted: boolean };

/** Account consent is mandatory to use TEMPO; all others are optional and
 * default to NOT granted (no pre-checked sensitive permissions). */
export const REQUIRED_CONSENT: ConsentPurpose = 'account';

export const initialOnboardingState: OnboardingState = {
  displayName: '',
  archetype: null,
  primaryGoal: null,
  consents: {
    account: false,
    health_personalization: false,
    food_photo_ai: false,
    location_activity: false,
    form_check_media: false,
    progress_media: false,
    analytics_product: false,
  },
};

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case 'set_display_name':
      return { ...state, displayName: action.value };
    case 'set_archetype':
      return { ...state, archetype: action.value };
    case 'set_goal':
      return { ...state, primaryGoal: action.value };
    case 'set_consent':
      return {
        ...state,
        consents: { ...state.consents, [action.purpose]: action.granted },
      };
  }
}

/** Onboarding can only complete with a name, archetype, goal, and the mandatory
 * account consent explicitly granted. */
export function canCompleteOnboarding(state: OnboardingState): boolean {
  return (
    state.displayName.trim().length > 0 &&
    state.archetype !== null &&
    state.primaryGoal !== null &&
    state.consents[REQUIRED_CONSENT]
  );
}
