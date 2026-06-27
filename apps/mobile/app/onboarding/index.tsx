import { AvatarArchetypeSchema, FitnessGoalSchema } from '@tempo/contracts';
import type { AvatarArchetype, FitnessGoal } from '@tempo/contracts';
import { TempoButton, TempoTextField, tempoColors, tempoRadius, tempoSpacing } from '@tempo/ui';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useOnboarding } from '../../src/onboarding/context';

const ARCHETYPE_LABELS: Record<AvatarArchetype, string> = {
  masculine: 'Masculine',
  feminine: 'Feminine',
  androgynous: 'Androgynous',
};

const GOAL_LABELS: Record<FitnessGoal, string> = {
  build_muscle: 'Build muscle',
  lose_fat: 'Lose fat',
  gain_strength: 'Gain strength',
  recomposition: 'Recomposition',
  endurance: 'Endurance',
  general_fitness: 'General fitness',
};

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipSelected : null]}
    >
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

export default function OnboardingArchetypeStep() {
  const { state, dispatch } = useOnboarding();
  const router = useRouter();

  const canContinue =
    state.displayName.trim().length > 0 && state.archetype !== null && state.primaryGoal !== null;

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <Text style={styles.eyebrow}>Step 1 of 3</Text>
      <Text style={styles.title}>Build your performance identity</Text>

      <View style={styles.section}>
        <TempoTextField
          label="What should we call you?"
          value={state.displayName}
          onChangeText={(value) => dispatch({ type: 'set_display_name', value })}
          placeholder="Display name"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Avatar archetype</Text>
        <View style={styles.chipRow}>
          {AvatarArchetypeSchema.options.map((archetype) => (
            <Chip
              key={archetype}
              label={ARCHETYPE_LABELS[archetype]}
              selected={state.archetype === archetype}
              onPress={() => dispatch({ type: 'set_archetype', value: archetype })}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Primary goal</Text>
        <View style={styles.chipRow}>
          {FitnessGoalSchema.options.map((goal) => (
            <Chip
              key={goal}
              label={GOAL_LABELS[goal]}
              selected={state.primaryGoal === goal}
              onPress={() => dispatch({ type: 'set_goal', value: goal })}
            />
          ))}
        </View>
      </View>

      <TempoButton
        label="Continue"
        onPress={() => router.push('/onboarding/consent')}
        disabled={!canContinue}
        style={styles.cta}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tempoColors.graphite950 },
  content: { padding: tempoSpacing.xl, paddingTop: 72, gap: tempoSpacing.xl },
  eyebrow: {
    color: tempoColors.electricCyan,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: { color: tempoColors.white, fontSize: 30, fontWeight: '900' },
  section: { gap: tempoSpacing.md },
  sectionLabel: {
    color: tempoColors.electricCyan,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tempoSpacing.sm },
  chip: {
    paddingVertical: tempoSpacing.sm,
    paddingHorizontal: tempoSpacing.lg,
    borderRadius: tempoRadius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(56,230,255,0.2)',
  },
  chipSelected: {
    backgroundColor: tempoColors.hotCoral,
    borderColor: tempoColors.hotCoral,
  },
  chipText: { color: tempoColors.cream, fontSize: 14, fontWeight: '800' },
  chipTextSelected: { color: tempoColors.white },
  cta: { marginTop: tempoSpacing.md },
});
