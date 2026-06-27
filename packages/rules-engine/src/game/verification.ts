import type { VerificationConfidenceScore, VerificationSignal } from '@tempo/contracts';

/**
 * Deterministic workout verification classifier.
 *
 * Verification gates COMPETITIVE rewards only (CLAUDE.md §26). This is business
 * logic, not AI: identical inputs always produce an identical classification.
 * It consumes signal PRESENCE and derived plausibility, never raw sensitive
 * streams (CLAUDE.md §17).
 */
export interface VerificationInput {
  /** The workout was entered by hand with no sensor/wearable backing. */
  manualEntryOnly: boolean;
  hasWearableHeartRate: boolean;
  hasWearableWorkoutSession: boolean;
  hasMotionData: boolean;
  hasGpsRoute: boolean;
  hasLocationDwell: boolean;
  appForegroundSessionSeconds: number;
  claimedDurationMinutes: number;
  /** Anti-cheat hints provided by upstream checks. */
  duplicateOfRecent: boolean;
  impossiblePace: boolean;
}

/** Sensor/wearable signals that count as strong corroboration. */
const STRONG_SIGNAL_SCORE: Record<VerificationSignal, number> = {
  wearable_heart_rate: 30,
  wearable_workout_session: 30,
  gps_route: 20,
  motion_sensor: 15,
  location_dwell: 10,
  app_foreground_session: 10,
};

const STRONG_SIGNALS: ReadonlySet<VerificationSignal> = new Set([
  'wearable_heart_rate',
  'wearable_workout_session',
  'gps_route',
  'motion_sensor',
]);

export function classifyWorkoutVerification(input: VerificationInput): VerificationConfidenceScore {
  const reasonCodes: string[] = [];
  const signals: VerificationSignal[] = [];

  if (input.hasWearableHeartRate) signals.push('wearable_heart_rate');
  if (input.hasWearableWorkoutSession) signals.push('wearable_workout_session');
  if (input.hasGpsRoute) signals.push('gps_route');
  if (input.hasMotionData) signals.push('motion_sensor');
  if (input.hasLocationDwell) signals.push('location_dwell');

  const foregroundMinutes = input.appForegroundSessionSeconds / 60;
  const substantialForeground =
    input.claimedDurationMinutes > 0 && foregroundMinutes >= input.claimedDurationMinutes * 0.5;
  if (substantialForeground) signals.push('app_foreground_session');

  const strongSignalCount = signals.filter((s) => STRONG_SIGNALS.has(s)).length;

  // --- Suspicious / anti-cheat short-circuits -------------------------------
  // A LIVE-tracked claim (not a manual entry) that lasted far longer than the
  // app was open and has no wearable backing is implausible. Manual entries are
  // honestly "done elsewhere" and are merely unverified, never suspicious.
  const foregroundInconsistent =
    !input.manualEntryOnly &&
    input.claimedDurationMinutes > 10 &&
    !input.hasWearableWorkoutSession &&
    !input.hasWearableHeartRate &&
    foregroundMinutes < input.claimedDurationMinutes * 0.25;

  if (input.duplicateOfRecent || input.impossiblePace || foregroundInconsistent) {
    if (input.duplicateOfRecent) reasonCodes.push('duplicate_of_recent');
    if (input.impossiblePace) reasonCodes.push('impossible_pace');
    if (foregroundInconsistent) reasonCodes.push('foreground_inconsistent');
    return {
      level: 'suspicious',
      score: 0,
      corroboratingSignals: signals,
      reasonCodes,
    };
  }

  const score = Math.min(
    100,
    signals.reduce((sum, s) => sum + STRONG_SIGNAL_SCORE[s], 0),
  );

  // --- Level classification -------------------------------------------------
  if (input.manualEntryOnly && strongSignalCount === 0) {
    reasonCodes.push('manual_entry_only');
    return { level: 'unverified', score, corroboratingSignals: signals, reasonCodes };
  }

  if (strongSignalCount === 0) {
    reasonCodes.push('no_sensor_corroboration');
    return { level: 'unverified', score, corroboratingSignals: signals, reasonCodes };
  }

  if (strongSignalCount >= 2 && score >= 70) {
    reasonCodes.push('multi_signal_corroboration');
    return { level: 'high_confidence', score, corroboratingSignals: signals, reasonCodes };
  }

  reasonCodes.push('single_signal_corroboration');
  return { level: 'standard', score, corroboratingSignals: signals, reasonCodes };
}
