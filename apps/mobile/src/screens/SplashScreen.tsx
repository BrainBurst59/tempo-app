import { brand, tempoColors, tempoSpacing } from '@tempo/ui';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/** Shown while Clerk restores the session from secure storage. */
export function SplashScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.wordmark}>{brand.name}</Text>
      <Text style={styles.tagline}>Train with rhythm, not chaos.</Text>
      <ActivityIndicator color={tempoColors.electricCyan} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tempoColors.graphite950,
    gap: tempoSpacing.sm,
  },
  wordmark: {
    color: tempoColors.white,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tagline: {
    color: tempoColors.stone,
    fontSize: 14,
    fontWeight: '700',
  },
  spinner: {
    marginTop: tempoSpacing.xl,
  },
});
