import { brand, TempoCard, tempoColors, tempoSpacing } from '@tempo/ui';
import { TempoButton } from '@tempo/ui';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useOnboarding } from '../../src/onboarding/context';

function titleCase(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function OnboardingReviewStep() {
  const { state, canComplete, submitting, error, submit } = useOnboarding();
  const grantedCount = Object.values(state.consents).filter(Boolean).length;

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <Text style={styles.eyebrow}>Step 3 of 3</Text>
      <Text style={styles.title}>You’re set</Text>

      <TempoCard variant="glow" style={styles.card}>
        <Row label="Name" value={state.displayName.trim() || '—'} />
        <Row label="Archetype" value={state.archetype ? titleCase(state.archetype) : '—'} />
        <Row label="Primary goal" value={state.primaryGoal ? titleCase(state.primaryGoal) : '—'} />
        <Row label="Consents granted" value={`${grantedCount} of 7`} />
      </TempoCard>

      <Text style={styles.note}>
        We’ll create your profile and record your consent choices. You can change or revoke any of
        them later in Settings.
      </Text>

      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <TempoButton
        label={`Enter ${brand.name}`}
        onPress={() => {
          void submit();
        }}
        loading={submitting}
        disabled={!canComplete}
        style={styles.cta}
      />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
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
  title: { color: tempoColors.white, fontSize: 32, fontWeight: '900' },
  card: { gap: tempoSpacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: {
    color: tempoColors.electricCyan,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rowValue: { color: tempoColors.white, fontSize: 16, fontWeight: '800' },
  note: { color: tempoColors.stone, fontSize: 13, lineHeight: 19 },
  error: { color: tempoColors.neonCoral, fontSize: 14, fontWeight: '700' },
  cta: { marginTop: tempoSpacing.sm },
});
