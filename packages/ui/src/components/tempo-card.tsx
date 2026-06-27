import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { tempoColors, tempoRadius, tempoSpacing } from '../tokens';

type TempoCardProps = PropsWithChildren<{
  variant?: 'dark' | 'light' | 'glow';
  style?: ViewStyle;
}>;

export function TempoCard({ children, variant = 'dark', style }: TempoCardProps) {
  return <View style={[styles.base, styles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: tempoRadius.lg,
    padding: tempoSpacing.lg,
    overflow: 'hidden',
  },
  dark: {
    backgroundColor: tempoColors.graphite900,
    borderColor: 'rgba(56, 230, 255, 0.18)',
    borderWidth: StyleSheet.hairlineWidth,
  },
  light: {
    backgroundColor: tempoColors.cream,
    borderColor: 'rgba(7, 30, 34, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
  },
  glow: {
    backgroundColor: tempoColors.deepTeal,
    borderColor: 'rgba(255, 79, 79, 0.45)',
    borderWidth: 1,
    shadowColor: tempoColors.hotCoral,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
  },
});
