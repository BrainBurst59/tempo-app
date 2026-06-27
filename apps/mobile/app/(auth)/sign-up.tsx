import { useSignUp } from '@clerk/clerk-expo';
import { TempoButton, TempoTextField, tempoColors, tempoSpacing } from '@tempo/ui';
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { clerkErrorMessage } from '../../src/auth/clerk-error';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onCreate() {
    if (!isLoaded || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await signUp.create({ emailAddress: email.trim(), password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      setError(clerkErrorMessage(err, 'We could not start sign-up. Check your details and retry.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function onVerify() {
    if (!isLoaded || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        // Gate routes to onboarding next.
      } else {
        setError('That code did not complete verification. Please try again.');
      }
    } catch (err) {
      setError(clerkErrorMessage(err, 'That verification code was not accepted.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
        <Text style={styles.eyebrow}>{pendingVerification ? 'Verify email' : 'Get started'}</Text>
        <Text style={styles.title}>
          {pendingVerification ? 'Enter your code' : 'Create your TEMPO account'}
        </Text>

        {pendingVerification ? (
          <View style={styles.form}>
            <Text style={styles.help}>We sent a 6-digit code to {email.trim()}.</Text>
            <TempoTextField
              label="Verification code"
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              keyboardType="number-pad"
              autoComplete="one-time-code"
            />
            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            ) : null}
            <TempoButton
              label="Verify & continue"
              onPress={onVerify}
              loading={submitting}
              disabled={code.trim().length === 0 || !isLoaded}
            />
          </View>
        ) : (
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
              placeholder="At least 8 characters"
              secureTextEntry
              autoComplete="new-password"
            />
            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            ) : null}
            <TempoButton
              label="Create account"
              onPress={onCreate}
              loading={submitting}
              disabled={email.trim().length === 0 || password.length < 8 || !isLoaded}
            />
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/sign-in" style={styles.link}>
            Sign in
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
    fontSize: 32,
    fontWeight: '900',
    marginBottom: tempoSpacing.xl,
  },
  form: { gap: tempoSpacing.lg },
  help: { color: tempoColors.stone, fontSize: 14, lineHeight: 20 },
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
