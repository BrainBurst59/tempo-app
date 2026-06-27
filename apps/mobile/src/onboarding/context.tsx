import { useAuth, useUser } from '@clerk/clerk-expo';
import type { ConsentPurpose, UserProfileUpdate } from '@tempo/contracts';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import { createTempoApiClient } from '../api/client';
import { ONBOARDING_METADATA_KEY } from '../auth/onboarding-complete';
import { readClientEnv } from '../env';
import {
  canCompleteOnboarding,
  initialOnboardingState,
  onboardingReducer,
  type OnboardingAction,
  type OnboardingState,
} from './state';

/** The privacy/consent policy version users are agreeing to in this build. */
export const ONBOARDING_POLICY_VERSION = '1.0.0';

type OnboardingContextValue = {
  state: OnboardingState;
  dispatch: (action: OnboardingAction) => void;
  canComplete: boolean;
  submitting: boolean;
  error: string | null;
  submit: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialOnboardingState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { user } = useUser();

  const submit = useCallback(async () => {
    if (submitting) return;
    if (!canCompleteOnboarding(state) || !user) {
      setError('Please complete every required step before continuing.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const env = readClientEnv();
      const api = createTempoApiClient({ baseUrl: env.EXPO_PUBLIC_API_BASE_URL, getToken });

      // 1. Provision the TEMPO user from the verified identity (server derives
      //    the real id/email from the JWT; the body is a display hint only).
      await api.syncIdentity({ displayName: state.displayName.trim() });

      // 2. Persist the profile. services/api is the durable source of truth.
      const update: UserProfileUpdate = {
        displayName: state.displayName.trim(),
        avatarArchetype: state.archetype,
      };
      if (state.primaryGoal) update.primaryGoal = state.primaryGoal;
      await api.updateProfile(update);

      // 3. Record every explicit consent decision — grants AND denials — so the
      //    consent log is complete and auditable (CLAUDE.md §10).
      for (const purpose of Object.keys(state.consents) as ConsentPurpose[]) {
        await api.recordConsent({
          purpose,
          decision: state.consents[purpose] ? 'granted' : 'denied',
          dataCategories: [],
          policyVersion: ONBOARDING_POLICY_VERSION,
          source: 'onboarding',
        });
      }

      // 4. Flag onboarding complete so the route gate advances to the app.
      await user.update({
        unsafeMetadata: { ...user.unsafeMetadata, [ONBOARDING_METADATA_KEY]: true },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not finish setting up your account.');
    } finally {
      setSubmitting(false);
    }
  }, [state, submitting, getToken, user]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      state,
      dispatch,
      canComplete: canCompleteOnboarding(state),
      submitting,
      error,
      submit,
    }),
    [state, submitting, error, submit],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within an OnboardingProvider');
  return ctx;
}
