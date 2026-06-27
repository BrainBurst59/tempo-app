import type { TodayRecommendation, TodaySignalInput } from '@tempo/contracts';
import { TodaySignalInputSchema, TodayRecommendationSchema } from '@tempo/contracts';

type ScoreBand = 'high' | 'normal' | 'caution' | 'low';

function readinessBand(score: number): ScoreBand {
  if (score >= 75) return 'high';
  if (score >= 50) return 'normal';
  if (score >= 30) return 'caution';
  return 'low';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function generateTodayRecommendation(rawInput: TodaySignalInput): TodayRecommendation {
  const input = TodaySignalInputSchema.parse(rawInput);
  const reasonCodes: string[] = [];
  const safetyWarnings: string[] = [];

  let score = 60;

  if (input.recoveryStatus === 'high') {
    score += 15;
    reasonCodes.push('recovery_high');
  }

  if (input.recoveryStatus === 'low') {
    score -= 25;
    reasonCodes.push('recovery_low');
  }

  if (input.sleepQualityScore !== null) {
    if (input.sleepQualityScore < 45) {
      score -= 18;
      reasonCodes.push('sleep_light');
    }
    if (input.sleepQualityScore >= 80) {
      score += 8;
      reasonCodes.push('sleep_strong');
    }
  }

  if (input.fuelStatus === 'under_target') {
    score -= 12;
    reasonCodes.push('fuel_under_target');
  }

  if (input.calorieDeltaFromTarget !== null && input.calorieDeltaFromTarget < -500) {
    score -= 10;
    reasonCodes.push('large_energy_deficit');
    safetyWarnings.push('Energy is lower than planned. Avoid forcing a max-effort session today.');
  }

  if (input.sorenessStatus === 'heavy') {
    score -= 20;
    reasonCodes.push('heavy_soreness');
  }

  if (input.sorenessStatus === 'pain_flag') {
    score -= 35;
    reasonCodes.push('pain_flag');
    safetyWarnings.push('Pain was reported. TEMPO will avoid escalation and suggest lower-risk movement.');
  }

  if (input.recentTrainingLoadScore > 80) {
    score -= 12;
    reasonCodes.push('recent_load_high');
  }

  if (input.wearableHeartRateTrend === 'elevated') {
    score -= 10;
    reasonCodes.push('heart_rate_elevated');
  }

  if (input.weatherOpportunity === 'good_outdoor') {
    score += 5;
    reasonCodes.push('weather_good_outdoor');
  }

  const finalScore = clamp(score, 0, 100);
  const band = readinessBand(finalScore);
  const limitedByTime = input.availableMinutes < input.plannedTrainingMinutes;
  if (limitedByTime) reasonCodes.push('time_limited');

  const baseTrainingMinutes = Math.min(input.availableMinutes, input.plannedTrainingMinutes);

  let recommendation: TodayRecommendation;

  if (input.sorenessStatus === 'pain_flag' || band === 'low') {
    recommendation = {
      tempoState: 'recover',
      title: 'Recovery + easy movement',
      primaryActionLabel: 'Start recovery plan',
      secondaryActionLabel: 'Adjust today',
      trainingMinutes: 0,
      movementMinutes: input.weatherOpportunity === 'good_outdoor' ? Math.min(30, input.availableMinutes) : 15,
      reasonCodes,
      coachExplanation:
        'Your signals point toward recovery. TEMPO is keeping today useful without pushing intensity.',
      safetyWarnings,
    };
  } else if (band === 'caution') {
    recommendation = {
      tempoState: 'hold',
      title: 'Controlled strength + optional walk',
      primaryActionLabel: 'Start controlled session',
      secondaryActionLabel: 'Adjust today',
      trainingMinutes: Math.max(20, Math.round(baseTrainingMinutes * 0.75)),
      movementMinutes: input.weatherOpportunity === 'good_outdoor' ? 20 : 0,
      reasonCodes,
      coachExplanation:
        'Today stays productive, not maximal. TEMPO reduced volume because recovery, fuel, or soreness signals need respect.',
      safetyWarnings,
    };
  } else if (band === 'high' && input.fuelStatus !== 'under_target') {
    recommendation = {
      tempoState: 'push',
      title: 'Push session + movement finish',
      primaryActionLabel: 'Start push session',
      secondaryActionLabel: 'Adjust today',
      trainingMinutes: baseTrainingMinutes,
      movementMinutes: input.weatherOpportunity === 'good_outdoor' ? 20 : 0,
      reasonCodes,
      coachExplanation:
        'You are recovered and fueled well enough for a higher-output day. TEMPO is green-lighting a push session.',
      safetyWarnings,
    };
  } else {
    recommendation = {
      tempoState: 'build',
      title: 'Upper strength + easy walk',
      primaryActionLabel: 'Start strength',
      secondaryActionLabel: 'Adjust today',
      trainingMinutes: baseTrainingMinutes,
      movementMinutes: input.weatherOpportunity === 'good_outdoor' ? 28 : 0,
      reasonCodes,
      coachExplanation:
        'Your signals support a productive day. TEMPO is building momentum without forcing unnecessary intensity.',
      safetyWarnings,
    };
  }

  return TodayRecommendationSchema.parse(recommendation);
}
