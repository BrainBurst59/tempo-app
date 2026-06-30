import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Gauge, Sparkline } from './charts';
import { ProgressStrip, StatusChip, type SignalStatus } from './primitives';
import { biometricTheme as t } from './theme';

type CardVariant = 'card' | 'elevated' | 'glass';

/** Rounded graphite panel with a soft premium shadow — the base surface. */
export function BiometricCard({
  children,
  variant = 'card',
  accent,
  style,
}: {
  children: ReactNode;
  variant?: CardVariant;
  accent?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    variant === 'elevated'
      ? t.colors.cardElevated
      : variant === 'glass'
        ? t.colors.glass
        : t.colors.card;
  return (
    <View style={[styles.card, { backgroundColor: bg }, style]}>
      {accent ? <View style={[styles.accentBar, { backgroundColor: accent }]} /> : null}
      {children}
    </View>
  );
}

/** Larger wearable-signal card: title, big value, optional trace + status. */
export function SignalCard({
  title,
  value,
  unit,
  color = t.colors.strainBright,
  status,
  trace,
  footnote,
}: {
  title: string;
  value: string;
  unit?: string;
  color?: string;
  status?: SignalStatus;
  trace?: number[];
  footnote?: string;
}) {
  return (
    <BiometricCard>
      <View style={styles.signalHead}>
        <Text style={styles.tileLabel}>{title}</Text>
        {status ? <StatusChip status={status} /> : null}
      </View>
      <View style={styles.signalValueRow}>
        <Text style={styles.signalValue}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {trace ? <Sparkline data={trace} color={color} width={260} height={48} /> : null}
      {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}
    </BiometricCard>
  );
}

/** Radial gauge card for a point-in-time index (e.g. training load). */
export function GaugeCard({
  title,
  value,
  unit,
  current,
  min,
  max,
  color = t.colors.strainBright,
  caption,
}: {
  title: string;
  value: string;
  unit?: string;
  current: number;
  min: number;
  max: number;
  color?: string;
  caption?: string;
}) {
  return (
    <BiometricCard>
      <Text style={styles.tileLabel}>{title}</Text>
      <View style={styles.gaugeWrap}>
        <Gauge value={current} min={min} max={max} color={color} />
        <View style={styles.gaugeCenter} pointerEvents="none">
          <Text style={styles.gaugeValue}>
            {value}
            {unit ? <Text style={styles.gaugeUnit}>{unit}</Text> : null}
          </Text>
        </View>
      </View>
      <View style={styles.gaugeRange}>
        <Text style={styles.gaugeRangeText}>{min}</Text>
        {caption ? <Text style={styles.gaugeCaption}>{caption}</Text> : null}
        <Text style={styles.gaugeRangeText}>{max}</Text>
      </View>
    </BiometricCard>
  );
}

/** Compact wearable metric tile for the dense Health Monitor grid. */
export function HealthMetricTile({
  label,
  value,
  unit,
  status,
  accent = t.colors.strainBright,
}: {
  label: string;
  value: string;
  unit?: string;
  status: SignalStatus;
  accent?: string;
}) {
  return (
    <BiometricCard style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <View style={styles.tileValueRow}>
        <Text style={[styles.tileValue, { color: accent }]}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      <StatusChip status={status} />
    </BiometricCard>
  );
}

/** Beast progression card — cosmetic identity + earned progress toward stage. */
export function BeastStatusCard({
  beastName,
  stage,
  aura,
  progress,
  message,
}: {
  beastName: string;
  stage: string;
  aura: string;
  progress: number;
  message: string;
}) {
  return (
    <BiometricCard variant="elevated" accent={t.colors.cautionWarm}>
      <View style={styles.beastHead}>
        <View style={[styles.beastGlyph, { borderColor: t.colors.cautionWarm }]}>
          <Ionicons name="flame" size={22} color={t.colors.cautionWarm} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.beastName}>{beastName}</Text>
          <Text style={styles.beastMeta}>
            Stage · {stage}
            {'   '}Aura · {aura}
          </Text>
        </View>
      </View>
      <View style={styles.beastProgressRow}>
        <Text style={styles.tileLabel}>Next stage</Text>
        <Text style={[styles.beastPct, { color: t.colors.cautionWarm }]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
      <ProgressStrip progress={progress} color={t.colors.cautionWarm} />
      <Text style={styles.beastMessage}>{message}</Text>
    </BiometricCard>
  );
}

/** Today's recommended session with primary + secondary actions. */
export function RecommendationCard({
  title,
  durationLabel,
  estimatedStrain,
  intensity,
  onStart,
  onSwap,
}: {
  title: string;
  durationLabel: string;
  estimatedStrain: string;
  intensity: string;
  onStart?: () => void;
  onSwap?: () => void;
}) {
  return (
    <BiometricCard variant="elevated" accent={t.colors.strain}>
      <Text style={styles.tileLabel}>Today’s recommendation</Text>
      <Text style={styles.recoTitle}>{title}</Text>
      <View style={styles.recoStats}>
        <Stat icon="time-outline" label="Duration" value={durationLabel} />
        <Stat icon="pulse-outline" label="Est. strain" value={estimatedStrain} />
        <Stat icon="flash-outline" label="Intensity" value={intensity} />
      </View>
      <View style={styles.recoActions}>
        <PillButton label="Start Workout" tone="primary" icon="play" onPress={onStart} />
        <PillButton label="Swap" tone="ghost" icon="swap-horizontal" onPress={onSwap} />
      </View>
    </BiometricCard>
  );
}

/** Deterministic coach explanation ("Why this plan"). */
export function CoachInsightCard({
  title = 'Why this plan',
  text,
}: {
  title?: string;
  text: string;
}) {
  return (
    <BiometricCard accent={t.colors.health}>
      <View style={styles.coachHead}>
        <Ionicons name="sparkles-outline" size={15} color={t.colors.healthBright} />
        <Text style={[styles.tileLabel, { color: t.colors.healthBright }]}>{title}</Text>
      </View>
      <Text style={styles.coachText}>{text}</Text>
    </BiometricCard>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={14} color={t.colors.textSecondary} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function PillButton({
  label,
  tone,
  icon,
  onPress,
}: {
  label: string;
  tone: 'primary' | 'ghost';
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress?: (() => void) | undefined;
}) {
  const primary = tone === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        primary ? styles.pillPrimary : styles.pillGhost,
        pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
      ]}
    >
      <Ionicons name={icon} size={16} color={primary ? t.colors.background : t.colors.white} />
      <Text style={[styles.pillText, { color: primary ? t.colors.background : t.colors.white }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: t.radius.lg,
    padding: t.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: t.colors.line,
    overflow: 'hidden',
    // Soft premium shadow on iOS; elevation on Android (each platform ignores
    // the other's keys).
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  tileLabel: {
    color: t.colors.textSecondary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  unit: { color: t.colors.textMuted, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  signalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  signalValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginVertical: t.spacing.sm,
  },
  signalValue: { color: t.colors.white, fontSize: 30, fontWeight: '900' },
  footnote: { color: t.colors.textMuted, fontSize: 12, fontWeight: '600', marginTop: t.spacing.xs },
  tile: { flex: 1, minWidth: '30%', gap: t.spacing.sm },
  tileValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  tileValue: { fontSize: 24, fontWeight: '900' },
  gaugeWrap: { alignItems: 'center', marginTop: t.spacing.sm },
  gaugeCenter: { position: 'absolute', left: 0, right: 0, bottom: 6, alignItems: 'center' },
  gaugeValue: { color: t.colors.white, fontSize: 30, fontWeight: '900' },
  gaugeUnit: { color: t.colors.textMuted, fontSize: 14, fontWeight: '700' },
  gaugeRange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: t.spacing.sm,
  },
  gaugeRangeText: { color: t.colors.textMuted, fontSize: 11, fontWeight: '700' },
  gaugeCaption: { color: t.colors.textSecondary, fontSize: 12, fontWeight: '700' },
  beastHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    marginBottom: t.spacing.md,
  },
  beastGlyph: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(255,106,61,0.12)',
  },
  beastName: { color: t.colors.white, fontSize: 20, fontWeight: '900' },
  beastMeta: { color: t.colors.textSecondary, fontSize: 12, fontWeight: '700', marginTop: 2 },
  beastProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: t.spacing.sm,
  },
  beastPct: { fontSize: 13, fontWeight: '900' },
  beastMessage: {
    color: t.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: t.spacing.md,
  },
  recoTitle: {
    color: t.colors.white,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: t.spacing.md,
  },
  recoStats: { flexDirection: 'row', gap: t.spacing.md, marginBottom: t.spacing.lg },
  stat: { flex: 1, gap: 3 },
  statLabel: {
    color: t.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: { color: t.colors.white, fontSize: 15, fontWeight: '800' },
  recoActions: { flexDirection: 'row', gap: t.spacing.md },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
  },
  pillPrimary: { flex: 2, backgroundColor: t.colors.strainBright },
  pillGhost: {
    flex: 1,
    backgroundColor: t.colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: t.colors.lineStrong,
  },
  pillText: { fontSize: 15, fontWeight: '900' },
  coachHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: t.spacing.sm },
  coachText: { color: '#C9D0DA', fontSize: 14, lineHeight: 21 },
});
