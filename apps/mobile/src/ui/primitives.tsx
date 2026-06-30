import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { biometricTheme as t } from './theme';
import { clamp } from './ringMath';

/** Small all-caps section header with an optional accent dot and right action. */
export function SectionHeader({
  title,
  accent = t.colors.strainBright,
  action,
}: {
  title: string;
  accent?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionLeft}>
        <View style={[styles.sectionDot, { backgroundColor: accent }]} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action ?? null}
    </View>
  );
}

export type SignalStatus =
  'within_range' | 'elevated' | 'low' | 'recalibrating' | 'syncing' | 'mock';

const STATUS_META: Record<SignalStatus, { label: string; color: string }> = {
  within_range: { label: 'Within range', color: t.colors.recovery },
  elevated: { label: 'Elevated', color: t.colors.caution },
  low: { label: 'Low', color: t.colors.strainBright },
  recalibrating: { label: 'Recalibrating', color: t.colors.health },
  syncing: { label: 'Syncing', color: t.colors.textSecondary },
  mock: { label: 'Mock data', color: t.colors.textMuted },
};

/** Rounded status pill used across wearable-signal tiles. */
export function StatusChip({ status, label }: { status: SignalStatus; label?: string }) {
  const meta = STATUS_META[status];
  return (
    <View style={[styles.chip, { borderColor: meta.color }]}>
      <View style={[styles.chipDot, { backgroundColor: meta.color }]} />
      <Text style={[styles.chipText, { color: meta.color }]}>{label ?? meta.label}</Text>
    </View>
  );
}

/** Thin rounded progress bar. */
export function ProgressStrip({
  progress,
  color = t.colors.strainBright,
  height = 8,
}: {
  progress: number;
  color?: string;
  height?: number;
}) {
  return (
    <View style={[styles.track, { height, borderRadius: height }]}>
      <View
        style={{
          width: `${clamp(progress, 0, 1) * 100}%`,
          height,
          borderRadius: height,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export type VerificationLevel = 'unverified' | 'standard' | 'high_confidence' | 'suspicious';

const VERIFY_META: Record<
  VerificationLevel,
  { label: string; color: string; icon: ComponentProps<typeof Ionicons>['name'] }
> = {
  unverified: { label: 'Unverified', color: t.colors.textMuted, icon: 'ellipse-outline' },
  standard: { label: 'Standard', color: t.colors.strainBright, icon: 'shield-half-outline' },
  high_confidence: {
    label: 'High confidence',
    color: t.colors.recovery,
    icon: 'shield-checkmark-outline',
  },
  suspicious: { label: 'Needs review', color: t.colors.caution, icon: 'alert-circle-outline' },
};

/** Verification-confidence chip. Mirrors the server-authoritative classes. */
export function VerificationBadge({ level }: { level: VerificationLevel }) {
  const meta = VERIFY_META[level];
  return (
    <View style={[styles.chip, { borderColor: meta.color }]}>
      <Ionicons name={meta.icon} size={12} color={meta.color} />
      <Text style={[styles.chipText, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

/** Compact activity row: icon, name, time window, and a trailing metric. */
export function ActivityRow({
  icon,
  name,
  time,
  metric,
  accent = t.colors.strainBright,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  name: string;
  time: string;
  metric: string;
  accent?: string;
}) {
  return (
    <View style={styles.activityRow}>
      <View
        style={[
          styles.activityIcon,
          { backgroundColor: `${accent}22`, borderColor: `${accent}55` },
        ]}
      >
        <Ionicons name={icon} size={16} color={accent} />
      </View>
      <View style={styles.activityBody}>
        <Text style={styles.activityName}>{name}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
      <Text style={[styles.activityMetric, { color: accent }]}>{metric}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: t.spacing.xs,
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: {
    color: t.colors.textSecondary,
    fontSize: t.typography.label,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  track: { width: '100%', backgroundColor: t.colors.line, overflow: 'hidden' },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    paddingVertical: t.spacing.xs,
  },
  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  activityBody: { flex: 1 },
  activityName: { color: t.colors.white, fontSize: 14, fontWeight: '800' },
  activityTime: { color: t.colors.textMuted, fontSize: 12, fontWeight: '600', marginTop: 1 },
  activityMetric: { fontSize: 15, fontWeight: '900' },
});
