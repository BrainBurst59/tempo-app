import { ClerkProvider } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { secureStoreTokenCache } from '../src/auth/token-cache';
import { ClientEnvError, readClientEnv } from '../src/env';
import { ConfigErrorScreen } from '../src/screens/ConfigErrorScreen';

function readPublishableKey(): { key: string } | { error: string } {
  try {
    return { key: readClientEnv().EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY };
  } catch (error) {
    return {
      error: error instanceof ClientEnvError ? error.message : 'Unknown configuration error',
    };
  }
}

export default function RootLayout() {
  const env = readPublishableKey();
  if ('error' in env) {
    return <ConfigErrorScreen message={env.error} />;
  }

  return (
    <ClerkProvider publishableKey={env.key} tokenCache={secureStoreTokenCache}>
      <StatusBar style="light" />
      <Slot />
    </ClerkProvider>
  );
}
