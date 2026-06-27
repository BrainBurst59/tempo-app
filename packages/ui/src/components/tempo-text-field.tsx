import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';
import { tempoColors, tempoRadius, tempoSpacing } from '../tokens';

type TempoTextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
  /** Error message; rendered as text (never color-only) for accessibility. */
  errorText?: string;
};

export function TempoTextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = 'none',
  autoComplete,
  keyboardType,
  editable = true,
  errorText,
}: TempoTextFieldProps) {
  const hasError = Boolean(errorText);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(233,223,210,0.4)"
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        editable={editable}
        style={[styles.input, hasError ? styles.inputError : null]}
      />
      {hasError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errorText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: tempoSpacing.xs,
  },
  label: {
    color: tempoColors.electricCyan,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 52,
    borderRadius: tempoRadius.md,
    paddingHorizontal: tempoSpacing.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(56,230,255,0.2)',
    color: tempoColors.white,
    fontSize: 16,
  },
  inputError: {
    borderColor: tempoColors.hotCoral,
    borderWidth: 1,
  },
  error: {
    color: tempoColors.neonCoral,
    fontSize: 13,
    fontWeight: '700',
  },
});
