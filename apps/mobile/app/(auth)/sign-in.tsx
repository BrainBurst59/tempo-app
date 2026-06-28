import { useSignIn } from '@clerk/clerk-expo';
import { brand, TempoButton, TempoTextField, tempoColors, tempoSpacing } from '@tempo/ui';
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { clerkErrorMessage } from '../../src/auth/clerk-error';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!isLoaded || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const attempt = await signIn.create({ identifier: email.trim(), password });
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        // The root navigation gate routes onward once the session is active.
      } else {
        setError('Additional verification is required. Please continue in your email.');
      }
    } catch (err) {
      setError(clerkErrorMessage(err, 'We could not sign you in. Check your details and retry.'));
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = email.trim().length > 0 && password.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
        <Text style={styles.eyebrow}>Welcome back</Text>
        <Text style={styles.title}>Sign in to {brand.name}</Text>

        <View style={styles.form}>
          <TempoTextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TempoTextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
            autoComplete="current-password"
          />
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <TempoButton
            label="Sign in"
            onPress={onSubmit}
            loading={submitting}
            disabled={!canSubmit || !isLoaded}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to {brand.name}?</Text>
          <Link href="/(auth)/sign-up" style={styles.link}>
            Create an account
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: tempoColors.graphite950 },
  screen: { flex: 1, backgroundColor: tempoColors.graphite950 },
  content: { flexGrow: 1, justifyContent: 'center', padding: tempoSpacing.xl },
  eyebrow: {
    color: tempoColors.electricCyan,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: tempoSpacing.sm,
  },
  title: {
    color: tempoColors.white,
    fontSize: 34,
    fontWeight: '900',
    marginBottom: tempoSpacing.xl,
  },
  form: { gap: tempoSpacing.lg },
  error: { color: tempoColors.neonCoral, fontSize: 14, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    gap: tempoSpacing.sm,
    marginTop: tempoSpacing.xl,
    alignItems: 'center',
  },
  footerText: { color: tempoColors.stone, fontSize: 14 },
  link: { color: tempoColors.hotCoral, fontSize: 14, fontWeight: '900' },
});
