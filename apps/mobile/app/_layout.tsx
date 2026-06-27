import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { isOnboardingComplete } from '../src/auth/onboarding-complete';
import { secureStoreTokenCache } from '../src/auth/token-cache';
import { ClientEnvError, readClientEnv } from '../src/env';
import { ConfigErrorScreen } from '../src/screens/ConfigErrorScreen';
import { SplashScreen } from '../src/screens/SplashScreen';

function readPublishableKey(): { key: string } | { error: string } {
  try {
    return { key: readClientEnv().EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY };
  } catch (error) {
    return {
      error: error instanceof ClientEnvError ? error.message : 'Unknown configuration error',
    };
  }
}

/**
 * Enforces signed-in / signed-out / onboarding gating for every route. Until
 * Clerk has loaded the session we show the splash, so protected screens never
 * flash before auth is known.
 */
function RootNavigationGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const onboarded = isOnboardingComplete(user?.unsafeMetadata);

  useEffect(() => {
    if (!isLoaded) return;
    const group = segments[0];
    const inAuth = group === '(auth)';
    const inOnboarding = group === 'onboarding';

    if (!isSignedIn) {
      if (!inAuth) router.replace('/(auth)/sign-in');
    } else if (!onboarded) {
      if (!inOnboarding) router.replace('/onboarding');
    } else if (inAuth || inOnboarding) {
      router.replace('/(tabs)/today');
    }
  }, [isLoaded, isSignedIn, onboarded, segments, router]);

  if (!isLoaded) return <SplashScreen />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const env = readPublishableKey();
  if ('error' in env) {
    return <ConfigErrorScreen message={env.error} />;
  }

  return (
    <ClerkProvider publishableKey={env.key} tokenCache={secureStoreTokenCache}>
      <StatusBar style="light" />
      <RootNavigationGate />
    </ClerkProvider>
  );
}
