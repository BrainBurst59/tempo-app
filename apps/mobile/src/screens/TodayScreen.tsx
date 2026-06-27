import { generateTodayRecommendation } from '@tempo/rules-engine';
import { TempoAvatar, TempoCard, TempoRing, tempoColors, tempoSpacing } from '@tempo/ui';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { sampleAvatarState, sampleTodaySignals } from '../domain/sample-today';

const recommendation = generateTodayRecommendation(sampleTodaySignals);
const avatarState = { ...sampleAvatarState, tempoState: recommendation.tempoState } as const;

export function TodayScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Today Command Center</Text>
          <Text style={styles.title}>Train with rhythm, not chaos.</Text>
        </View>
        <Link href="/account" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="Account and settings">
            <TempoAvatar state={avatarState} size={96} />
          </Pressable>
        </Link>
      </View>

      <TempoCard variant="glow" style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Today’s Tempo</Text>
            <Text style={styles.heroTitle}>{recommendation.tempoState.toUpperCase()}</Text>
            <Text style={styles.heroSubtitle}>{recommendation.title}</Text>
          </View>
          <TempoRing value={72} label="Score" />
        </View>

        <Text style={styles.coachNote}>{recommendation.coachExplanation}</Text>

        <View style={styles.actionRow}>
          <View style={styles.primaryButton} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>{recommendation.primaryActionLabel}</Text>
          </View>
          <View style={styles.secondaryButton} accessibilityRole="button">
            <Text style={styles.secondaryButtonText}>{recommendation.secondaryActionLabel}</Text>
          </View>
        </View>
      </TempoCard>

      <View style={styles.metricGrid}>
        <Metric label="Fuel" value="420 kcal under" />
        <Metric label="Recovery" value="Steady" />
        <Metric label="Weather" value="Walk-friendly" />
        <Metric label="Watch" value="HR normal" />
      </View>

      {recommendation.safetyWarnings.length > 0 ? (
        <TempoCard variant="light" style={styles.warningCard}>
          <Text style={styles.warningTitle}>Safety check</Text>
          {recommendation.safetyWarnings.map((warning) => (
            <Text key={warning} style={styles.warningText}>
              {warning}
            </Text>
          ))}
        </TempoCard>
      ) : null}
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tempoColors.graphite950,
  },
  content: {
    padding: tempoSpacing.xl,
    paddingTop: 72,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: tempoSpacing.lg,
    alignItems: 'center',
    marginBottom: tempoSpacing.xl,
  },
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
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '900',
    maxWidth: 230,
  },
  heroCard: {
    marginBottom: tempoSpacing.xl,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: tempoSpacing.lg,
    alignItems: 'center',
    marginBottom: tempoSpacing.lg,
  },
  heroCopy: {
    flex: 1,
  },
  heroEyebrow: {
    color: tempoColors.hotCoral,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: tempoColors.white,
    fontSize: 42,
    fontWeight: '900',
    marginTop: 2,
  },
  heroSubtitle: {
    color: tempoColors.stone,
    fontSize: 18,
    fontWeight: '700',
    marginTop: tempoSpacing.xs,
  },
  coachNote: {
    color: tempoColors.cream,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: tempoSpacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: tempoSpacing.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: tempoColors.hotCoral,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: tempoColors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  secondaryButtonText: {
    color: tempoColors.cream,
    fontSize: 15,
    fontWeight: '900',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tempoSpacing.md,
  },
  metricCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    padding: tempoSpacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(56,230,255,0.15)',
  },
  metricLabel: {
    color: tempoColors.electricCyan,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: tempoSpacing.xs,
  },
  metricValue: {
    color: tempoColors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  warningCard: {
    marginTop: tempoSpacing.xl,
  },
  warningTitle: {
    color: tempoColors.graphite950,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: tempoSpacing.sm,
  },
  warningText: {
    color: tempoColors.graphite950,
    fontSize: 15,
    lineHeight: 21,
  },
});
