import { StyleSheet, Text, View } from 'react-native';
import { tempoColors, tempoRadius } from '../tokens';

type TempoRingProps = {
  value: number;
  label: string;
};

export function TempoRing({ value, label }: TempoRingProps) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <View accessibilityLabel={`${label}: ${safeValue} percent`} style={styles.ring}>
      <Text style={styles.value}>{safeValue}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 86,
    height: 86,
    borderRadius: tempoRadius.full,
    borderWidth: 3,
    borderColor: tempoColors.electricCyan,
    backgroundColor: 'rgba(21, 166, 255, 0.1)',
  },
  value: {
    color: tempoColors.white,
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    color: tempoColors.stone,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
});
