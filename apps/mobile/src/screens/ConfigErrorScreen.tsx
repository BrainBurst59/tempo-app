import { brand, TempoCard, tempoColors, tempoSpacing } from '@tempo/ui';
import { ScrollView, StyleSheet, Text } from 'react-native';

/**
 * Shown when required public configuration is missing/invalid, instead of
 * crashing the bundler. The message lists offending keys + reasons only (never
 * values), so it is safe to display.
 */
export function ConfigErrorScreen({ message }: { message: string }) {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <Text style={styles.eyebrow}>Configuration</Text>
      <Text style={styles.title}>{brand.name} can’t start</Text>
      <TempoCard variant="light" style={styles.card}>
        <Text style={styles.body}>{message}</Text>
      </TempoCard>
      <Text style={styles.help}>
        Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in apps/mobile/.env (see .env.example), then restart
        the dev server.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tempoColors.graphite950,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: tempoSpacing.xl,
  },
  eyebrow: {
    color: tempoColors.amber,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: tempoSpacing.sm,
  },
  title: {
    color: tempoColors.white,
    fontSize: 30,
    fontWeight: '900',
    marginBottom: tempoSpacing.lg,
  },
  card: {
    marginBottom: tempoSpacing.lg,
  },
  body: {
    color: tempoColors.graphite950,
    fontSize: 15,
    lineHeight: 21,
  },
  help: {
    color: tempoColors.stone,
    fontSize: 13,
    lineHeight: 19,
  },
});
