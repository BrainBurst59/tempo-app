import type { ConsentPurpose } from '@tempo/contracts';
import { TempoButton, tempoColors, tempoRadius, tempoSpacing } from '@tempo/ui';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useOnboarding } from '../../src/onboarding/context';
import { REQUIRED_CONSENT } from '../../src/onboarding/state';

const CONSENT_COPY: Record<ConsentPurpose, { title: string; description: string }> = {
  account: {
    title: 'Account & core features',
    description: 'Required to create your TEMPO account and deliver core coaching.',
  },
  health_personalization: {
    title: 'Health personalization',
    description:
      'Use recovery, sleep, and activity signals to tailor your day. Estimates, not diagnoses.',
  },
  food_photo_ai: {
    title: 'Food photo estimates',
    description:
      'Let AI estimate meals from photos. Estimates only — you always confirm before logging.',
  },
  location_activity: {
    title: 'Location & outdoor activity',
    description:
      'Track outdoor routes and suggest local movement, only while you use those features.',
  },
  form_check_media: {
    title: 'Form-check media',
    description:
      'Capture form videos for training cues. Stored privately and deletable at any time.',
  },
  progress_media: {
    title: 'Progress media',
    description: 'Save progress photos to visualize change over time. Private to your account.',
  },
  analytics_product: {
    title: 'Product analytics',
    description:
      'Share privacy-filtered usage to improve TEMPO. Never your health data, photos, or routes.',
  },
};

const PURPOSE_ORDER: ConsentPurpose[] = [
  'account',
  'health_personalization',
  'food_photo_ai',
  'location_activity',
  'form_check_media',
  'progress_media',
  'analytics_product',
];

export default function OnboardingConsentStep() {
  const { state, dispatch } = useOnboarding();
  const router = useRouter();
  const accountGranted = state.consents[REQUIRED_CONSENT];

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <Text style={styles.eyebrow}>Step 2 of 3</Text>
      <Text style={styles.title}>Your data, your choices</Text>
      <Text style={styles.intro}>
        Nothing sensitive is collected without your explicit consent. You can change any of these
        later in Settings, and revoke at any time.
      </Text>

      {PURPOSE_ORDER.map((purpose) => {
        const copy = CONSENT_COPY[purpose];
        const required = purpose === REQUIRED_CONSENT;
        return (
          <View key={purpose} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>
                {copy.title}
                {required ? <Text style={styles.required}> · required</Text> : null}
              </Text>
              <Text style={styles.rowDesc}>{copy.description}</Text>
            </View>
            <Switch
              value={state.consents[purpose]}
              onValueChange={(granted) => dispatch({ type: 'set_consent', purpose, granted })}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: tempoColors.hotCoral }}
              thumbColor={tempoColors.white}
              accessibilityLabel={`${copy.title}${required ? ', required' : ''}`}
            />
          </View>
        );
      })}

      {!accountGranted ? (
        <Text accessibilityRole="alert" style={styles.notice}>
          Account consent is required to continue.
        </Text>
      ) : null}

      <TempoButton
        label="Review & finish"
        onPress={() => router.push('/onboarding/review')}
        disabled={!accountGranted}
        style={styles.cta}
      />
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
  intro: { color: tempoColors.stone, fontSize: 14, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tempoSpacing.lg,
    padding: tempoSpacing.lg,
    borderRadius: tempoRadius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(56,230,255,0.15)',
  },
  rowText: { flex: 1, gap: 4 },
  rowTitle: { color: tempoColors.white, fontSize: 16, fontWeight: '800' },
  required: { color: tempoColors.amber, fontSize: 12, fontWeight: '800' },
  rowDesc: { color: tempoColors.stone, fontSize: 13, lineHeight: 18 },
  notice: { color: tempoColors.amber, fontSize: 13, fontWeight: '700' },
  cta: { marginTop: tempoSpacing.sm },
});
