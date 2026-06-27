import type { AvatarState, TodaySignalInput } from '@tempo/contracts';

export const sampleTodaySignals: TodaySignalInput = {
  userId: 'local-preview-user',
  localDate: '2026-06-27',
  goal: 'recomposition',
  plannedTrainingMinutes: 46,
  availableMinutes: 60,
  fuelStatus: 'under_target',
  calorieDeltaFromTarget: -420,
  recoveryStatus: 'steady',
  sorenessStatus: 'mild',
  sleepQualityScore: 58,
  recentTrainingLoadScore: 52,
  weatherOpportunity: 'good_outdoor',
  wearableHeartRateTrend: 'normal',
};

export const sampleAvatarState: AvatarState = {
  archetype: 'androgynous',
  evolutionStage: 'base',
  tempoState: 'build',
  auraIntensity: 58,
  equippedUnlocks: ['starter-ring'],
};
