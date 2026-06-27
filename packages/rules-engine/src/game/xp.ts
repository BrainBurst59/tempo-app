import type {
  FuelStatus,
  GameStat,
  RecoveryStatus,
  WorkoutVerificationLevel,
} from '@tempo/contracts';

/**
 * Deterministic XP award calculation.
 *
 * Two non-fungible outputs: `personalXp` (the user's own progress, always
 * earnable from honest activity) and `competitiveXp` (gated by verification and
 * safety). The engine NEVER rewards unsafe escalation and NEVER lets money or
 * lack of recovery punish personal progress (CLAUDE.md §26).
 */

export type GameActivityType = 'strength' | 'endurance' | 'mobility' | 'recovery' | 'mixed';
export type EffortLevel = 'easy' | 'moderate' | 'hard' | 'max';

export interface XpAwardInput {
  primaryStat: GameStat;
  activityType: GameActivityType;
  effort: EffortLevel;
  durationMinutes: number;
  verificationLevel: WorkoutVerificationLevel;
  /** XP already earned for this stat today (drives diminishing returns). */
  priorXpTodayForStat: number;
  /** Hard/max strength sessions already completed today (load protection). */
  priorHardStrengthSessionsToday: number;
  fuelStatus: FuelStatus;
  recoveryStatus: RecoveryStatus;
  painFlag: boolean;
  /** Corroborating evidence strong enough to justify additional hard work. */
  stronglySupported: boolean;
}

export interface XpAwardResult {
  stat: GameStat;
  personalXp: number;
  competitiveXp: number;
  diminishingApplied: boolean;
  dailyLoadProtectionApplied: boolean;
  safetyReviewFlagged: boolean;
  reasonCodes: string[];
}

const EFFORT_MULTIPLIER: Record<EffortLevel, number> = {
  easy: 1,
  moderate: 2,
  hard: 3,
  max: 4,
};

const VERIFICATION_COMPETITIVE_MULTIPLIER: Record<WorkoutVerificationLevel, number> = {
  suspicious: 0,
  unverified: 0.25,
  standard: 0.6,
  high_confidence: 1,
};

/** Absolute cap on competitive XP from unverified (manual-only) workouts. */
const UNVERIFIED_COMPETITIVE_CAP = 40;
const MAX_HARD_STRENGTH_SESSIONS_PER_DAY = 2;
const SAFETY_PERSONAL_FACTOR = 0.5;

function diminishingFactor(priorXpTodayForStat: number): number {
  if (priorXpTodayForStat >= 600) return 0.25;
  if (priorXpTodayForStat >= 300) return 0.5;
  return 1;
}

export function calculateXpAward(input: XpAwardInput): XpAwardResult {
  const reasonCodes: string[] = [];
  const isHardEffort = input.effort === 'hard' || input.effort === 'max';
  const isRecovery = input.activityType === 'recovery';

  // 1) Base personal XP from effort and duration.
  const base = Math.max(0, Math.trunc(input.durationMinutes)) * EFFORT_MULTIPLIER[input.effort];

  // 2) Diminishing returns on repeated same-stat work in one day.
  const dim = diminishingFactor(input.priorXpTodayForStat);
  const diminishingApplied = dim < 1;
  if (diminishingApplied) reasonCodes.push('diminishing_returns');

  // 3) Safety governors. Recovery activity is always protected and never
  //    treated as unsafe escalation.
  const overLoaded =
    !isRecovery &&
    input.activityType === 'strength' &&
    isHardEffort &&
    input.priorHardStrengthSessionsToday >= MAX_HARD_STRENGTH_SESSIONS_PER_DAY &&
    !input.stronglySupported;

  const unsafeContext =
    !isRecovery &&
    isHardEffort &&
    (input.fuelStatus === 'under_target' || input.recoveryStatus === 'low' || input.painFlag);

  const dailyLoadProtectionApplied = overLoaded;
  const safetyReviewFlagged = overLoaded || unsafeContext;

  if (overLoaded) reasonCodes.push('daily_load_protection');
  if (unsafeContext) reasonCodes.push('unsafe_escalation_no_competitive_reward');
  if (isRecovery) reasonCodes.push('recovery_activity');

  // Personal progress is reduced (not erased) when safety governors fire, so
  // recovery and honest effort are never punished to zero.
  const personalSafetyFactor = overLoaded || unsafeContext ? SAFETY_PERSONAL_FACTOR : 1;
  const personalXp = Math.round(base * dim * personalSafetyFactor);

  // 4) Competitive XP: gated by verification, then zeroed by safety governors.
  let competitiveXp = 0;
  const verificationMultiplier = VERIFICATION_COMPETITIVE_MULTIPLIER[input.verificationLevel];
  if (input.verificationLevel === 'suspicious') {
    reasonCodes.push('suspicious_no_competitive_xp');
  } else if (input.verificationLevel === 'unverified') {
    competitiveXp = Math.min(
      Math.round(personalXp * verificationMultiplier),
      UNVERIFIED_COMPETITIVE_CAP,
    );
    reasonCodes.push('unverified_limited_competitive_xp');
  } else {
    competitiveXp = Math.round(personalXp * verificationMultiplier);
  }

  if (overLoaded || unsafeContext) {
    competitiveXp = 0;
    reasonCodes.push('competitive_xp_withheld');
  }

  return {
    stat: input.primaryStat,
    personalXp,
    competitiveXp,
    diminishingApplied,
    dailyLoadProtectionApplied,
    safetyReviewFlagged,
    reasonCodes,
  };
}
