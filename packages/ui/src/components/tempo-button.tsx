import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { tempoColors, tempoRadius, tempoSpacing } from '../tokens';

export type TempoButtonVariant = 'primary' | 'secondary' | 'ghost';

type TempoButtonProps = {
  label: string;
  onPress: () => void;
  variant?: TempoButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

/** Brand button with primary/secondary/ghost variants, loading + disabled
 * states, and accessibility wiring (role/state). */
export function TempoButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: TempoButtonProps) {
  const isDisabled = disabled || loading;
  const darkLabel = variant !== 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={darkLabel ? tempoColors.hotCoral : tempoColors.white} />
      ) : (
        <Text style={[styles.label, darkLabel ? styles.labelDark : null]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: tempoRadius.full,
    paddingHorizontal: tempoSpacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: tempoColors.hotCoral,
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: tempoColors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  labelDark: {
    color: tempoColors.cream,
  },
});
