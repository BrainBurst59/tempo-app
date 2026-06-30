import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { mockHealthProvider } from '../features/health/MockHealthProvider';
import type { WearableSignal } from '../features/health/types';
import {
  ActivityRow,
  BiometricCard,
  DarkScreen,
  GaugeCard,
  HealthMetricTile,
  MiniBars,
  SectionHeader,
  SignalCard,
  biometricTheme as t,
} from '../ui';

const health = mockHealthProvider.getSnapshot();

function accentFor(accent: WearableSignal['accent']): string {
  switch (accent) {
    case 'recovery':
      return t.colors.recovery;
    case 'caution':
      return t.colors.caution;
    case 'health':
      return t.colors.healthBright;
    default:
      return t.colors.strainBright;
  }
}

function Header() {
  const router = useRouter();
  return (
    <View style={s.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={() => router.back()}
        hitSlop={10}
      >
        <Ionicons name="chevron-down" size={22} color={t.colors.textSecondary} />
      </Pressable>
      <Text style={s.title}>Health Monitor</Text>
      <Ionicons name="pulse-outline" size={20} color={t.colors.healthBright} />
    </View>
  );
}

export function HealthMonitorScreen() {
  return (
    <DarkScreen header={<Header />}>
      <BiometricCard variant="glass">
        <View style={s.disclaimerRow}>
          <Ionicons name="information-circle-outline" size={16} color={t.colors.textSecondary} />
          <Text style={s.disclaimer}>
            Signals are for training guidance, not medical diagnosis. Mock wearable data shown for
            prototype.
          </Text>
        </View>
      </BiometricCard>

      <SignalCard
        title="Heart Rate"
        value="64"
        unit="bpm"
        color={t.colors.strainBright}
        status="within_range"
        trace={[58, 61, 60, 66, 74, 71, 65, 62, 64, 63]}
        footnote="Resting trend over the last hour"
      />

      <GaugeCard
        title="Training Load"
        value="1.5"
        current={1.5}
        min={0}
        max={3}
        color={t.colors.caution}
        caption="Medium"
      />

      <SectionHeader title="Wearable signals" accent={t.colors.health} />
      <View style={s.grid}>
        {health.signals.map((sig) => (
          <HealthMetricTile
            key={sig.key}
            label={sig.label}
            value={sig.value}
            status={sig.status}
            accent={accentFor(sig.accent)}
            {...(sig.unit ? { unit: sig.unit } : {})}
          />
        ))}
      </View>

      <SectionHeader title="Heart-rate zones" accent={t.colors.strain} />
      <BiometricCard>
        <Text style={s.cardLabel}>Minutes in zone · today (mock)</Text>
        <View style={{ marginTop: t.spacing.md }}>
          <MiniBars
            data={[8, 14, 22, 18, 6]}
            color={t.colors.strainBright}
            width={300}
            height={70}
          />
        </View>
      </BiometricCard>

      <SectionHeader title="Recent activity" accent={t.colors.recovery} />
      <BiometricCard>
        <ActivityRow
          icon="barbell-outline"
          name="Lower Body Strength"
          time="11:58 – 12:43"
          metric="17.4"
          accent={t.colors.strain}
        />
        <ActivityRow
          icon="walk-outline"
          name="Zone 2 Walk"
          time="4:28 – 5:10"
          metric="6.1"
          accent={t.colors.recovery}
        />
        <ActivityRow
          icon="body-outline"
          name="Mobility Flow"
          time="8:05 – 8:22"
          metric="3.2"
          accent={t.colors.healthBright}
        />
      </BiometricCard>

      <Text style={s.footer}>
        Health signals help TempoBEAST adjust training load and recovery suggestions.
      </Text>
    </DarkScreen>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: t.colors.white, fontSize: 18, fontWeight: '900', letterSpacing: 0.3 },
  disclaimerRow: { flexDirection: 'row', gap: t.spacing.sm, alignItems: 'flex-start' },
  disclaimer: {
    color: t.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    flex: 1,
  },
  cardLabel: {
    color: t.colors.textSecondary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.md },
  footer: {
    color: t.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: t.spacing.sm,
  },
});
