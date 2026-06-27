/**
 * Pure auth-routing decision. Kept free of React/Clerk/Expo so the gating logic
 * is deterministic and unit-testable. The route group layouts call this to
 * decide where to send the user.
 */
export type AuthRouteState = {
  /** Clerk has finished loading the session from secure storage. */
  isLoaded: boolean;
  /** There is an authenticated Clerk session. */
  isSignedIn: boolean;
  /** The user's TEMPO profile has completed onboarding. */
  onboardingComplete: boolean;
};

export type AuthRouteTarget = 'splash' | 'auth' | 'onboarding' | 'app';

export function resolveAuthRoute(state: AuthRouteState): AuthRouteTarget {
  if (!state.isLoaded) return 'splash';
  if (!state.isSignedIn) return 'auth';
  if (!state.onboardingComplete) return 'onboarding';
  return 'app';
}
