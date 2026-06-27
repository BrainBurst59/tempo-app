import type { AvatarState } from '@tempo/contracts';
import { StyleSheet, Text, View } from 'react-native';
import { tempoColors } from '../tokens';

type TempoAvatarProps = {
  state: AvatarState;
  size?: number;
};

const archetypeLabel: Record<AvatarState['archetype'], string> = {
  masculine: 'M',
  feminine: 'F',
  androgynous: 'A',
};

export function TempoAvatar({ state, size = 112 }: TempoAvatarProps) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Tempo avatar, ${state.evolutionStage} stage, ${state.tempoState} state`}
      style={[
        styles.outer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View style={[styles.inner, { borderRadius: size / 2 - 10 }]}>
        <Text style={styles.mark}>{archetypeLabel[state.archetype]}</Text>
        <Text style={styles.state}>{state.tempoState.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56, 230, 255, 0.12)',
    borderWidth: 2,
    borderColor: tempoColors.hotCoral,
    shadowColor: tempoColors.hotCoral,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '82%',
    height: '82%',
    backgroundColor: tempoColors.tempoBlue,
  },
  mark: {
    color: tempoColors.white,
    fontSize: 32,
    fontWeight: '900',
  },
  state: {
    color: tempoColors.graphite950,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
});
