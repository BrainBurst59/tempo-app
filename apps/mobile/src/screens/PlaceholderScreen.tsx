import { TempoCard, tempoColors, tempoSpacing } from '@tempo/ui';
import { StyleSheet, Text, View } from 'react-native';

type PlaceholderScreenProps = {
  title: string;
  eyebrow: string;
  description: string;
};

export function PlaceholderScreen({ title, eyebrow, description }: PlaceholderScreenProps) {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <TempoCard variant="glow" style={styles.card}>
        <Text style={styles.cardTitle}>Market-ready pillar</Text>
        <Text style={styles.body}>{description}</Text>
      </TempoCard>
      <Text style={styles.footer}>
        This screen is wired as a production navigation surface. Feature implementation must follow
        the repo governance files and launch-quality acceptance criteria.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: tempoSpacing.xl,
    backgroundColor: tempoColors.graphite950,
    justifyContent: 'center',
  },
  eyebrow: {
    color: tempoColors.electricCyan,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: tempoSpacing.sm,
  },
  title: {
    color: tempoColors.white,
    fontSize: 34,
    fontWeight: '900',
    marginBottom: tempoSpacing.xl,
  },
  card: {
    marginBottom: tempoSpacing.lg,
  },
  cardTitle: {
    color: tempoColors.white,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: tempoSpacing.sm,
  },
  body: {
    color: tempoColors.stone,
    fontSize: 16,
    lineHeight: 23,
  },
  footer: {
    color: tempoColors.stone,
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.75,
  },
});
