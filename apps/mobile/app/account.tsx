import { useAuth, useUser } from '@clerk/clerk-expo';
import { TempoButton, TempoCard, tempoColors, tempoSpacing } from '@tempo/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { createTempoApiClient } from '../src/api/client';
import { readClientEnv } from '../src/env';

export default function AccountScreen() {
  const { signOut, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [busy, setBusy] = useState<null | 'export' | 'delete'>(null);
  const [message, setMessage] = useState<string | null>(null);

  const email = user?.primaryEmailAddress?.emailAddress ?? '—';

  function client() {
    const env = readClientEnv();
    return createTempoApiClient({ baseUrl: env.EXPO_PUBLIC_API_BASE_URL, getToken });
  }

  async function onExport() {
    setBusy('export');
    setMessage(null);
    try {
      await client().requestDataExport();
      setMessage('Data export requested. We’ll notify you when it’s ready to download.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not request your data export.');
    } finally {
      setBusy(null);
    }
  }

  async function onDelete() {
    setBusy('delete');
    setMessage(null);
    try {
      await client().deleteAccount();
      await signOut();
      // The route gate sends the user to sign-in once the session clears.
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Could not delete your account. Please retry.',
      );
      setBusy(null);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your TEMPO account and all associated data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void onDelete();
          },
        },
      ],
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <Text style={styles.eyebrow}>Account</Text>
      <Text style={styles.title}>Your account & privacy</Text>

      <TempoCard variant="glow" style={styles.card}>
        <Text style={styles.cardLabel}>Signed in as</Text>
        <Text style={styles.cardValue}>{email}</Text>
      </TempoCard>

      {message ? (
        <Text accessibilityRole="alert" style={styles.message}>
          {message}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <TempoButton
          label="Request data export"
          variant="secondary"
          onPress={() => {
            void onExport();
          }}
          loading={busy === 'export'}
          disabled={busy !== null}
        />
        <TempoButton
          label="Sign out"
          variant="secondary"
          onPress={() => {
            void signOut();
          }}
          disabled={busy !== null}
        />
        <TempoButton
          label="Delete account"
          variant="primary"
          onPress={confirmDelete}
          loading={busy === 'delete'}
          disabled={busy !== null}
        />
      </View>

      <Text style={styles.legal}>
        Deleting your account removes your profile, consent records, and TEMPO data. Health data is
        never sold or used for advertising.
      </Text>

      <TempoButton label="Back" variant="ghost" onPress={() => router.back()} style={styles.back} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tempoColors.graphite950 },
  content: { padding: tempoSpacing.xl, paddingTop: 72, gap: tempoSpacing.lg },
  eyebrow: {
    color: tempoColors.electricCyan,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: { color: tempoColors.white, fontSize: 30, fontWeight: '900' },
  card: { gap: tempoSpacing.xs },
  cardLabel: {
    color: tempoColors.electricCyan,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardValue: { color: tempoColors.white, fontSize: 18, fontWeight: '800' },
  message: { color: tempoColors.amber, fontSize: 14, fontWeight: '700' },
  actions: { gap: tempoSpacing.md },
  legal: { color: tempoColors.stone, fontSize: 13, lineHeight: 19 },
  back: { marginTop: tempoSpacing.sm },
});
