/**
 * This is prototype-only. The real Game Engine is server-authoritative and
 * deterministic. The client must not be trusted for XP, progression,
 * verification, or competitive eligibility.
 *
 * Invariants this mock preserves (mirroring the real engine — see CLAUDE.md §26
 * and packages/rules-engine/src/game):
 *  - Fitness progress cannot be purchased. It must be earned.
 *  - Cosmetics (auras, skins) are visual-only and never affect performance.
 *  - Suspicious workouts are private and neutral, and earn no competitive XP.
 *  - The Beast evolves from consistency, recovery, training rhythm, verified
 *    effort, mobility, and nutrition behavior — never from money.
 *  - The Beast never body-shames the user.
 */

export type BeastStage = 'base' | 'consistent' | 'charged' | 'peak_rhythm';
export type VerificationConfidence = 'unverified' | 'standard' | 'high_confidence' | 'suspicious';

export type BeastStatus = {
  beastName: string;
  stage: BeastStage;
  /** Cosmetic-only; carries no stat or competitive effect. */
  auraName: string;
  /** Earned progress toward the next stage (0..1). Never purchasable. */
  progressToNextStage: number;
  message: string;
};

export type DailyQuest = {
  id: string;
  title: string;
  rewardXp: number;
  /** Competitive XP requires verification; quests target standard+ effort. */
  requiredVerification: Exclude<VerificationConfidence, 'unverified' | 'suspicious'>;
  progress: number;
};

export type GameEngineSnapshot = {
  beast: BeastStatus;
  quest: DailyQuest;
};

/**
 * Prototype mirror of how the server would scale competitive XP by verification
 * confidence. Authoritative computation lives on the server; this exists only so
 * the UI can show plausible values. Money can never enter this function.
 */
export function mockCompetitiveXp(verification: VerificationConfidence, baseXp: number): number {
  const factor: Record<VerificationConfidence, number> = {
    suspicious: 0, // suspicious workouts earn no competitive XP
    unverified: 0.25, // personal progress only; limited competitive XP
    standard: 1,
    high_confidence: 1.25,
  };
  return Math.round(Math.max(0, baseXp) * factor[verification]);
}

/** Mocked snapshot, shaped as if returned by the server-authoritative engine. */
export function fetchGameEngineSnapshot(): GameEngineSnapshot {
  return {
    beast: {
      beastName: 'Forge Beast',
      stage: 'charged',
      auraName: 'Ember Pulse',
      progressToNextStage: 0.64,
      message: 'Your Beast is responding to consistent training rhythm.',
    },
    quest: {
      id: 'quest-strength-today',
      title: 'Complete today’s strength session',
      rewardXp: 120,
      requiredVerification: 'high_confidence',
      progress: 0.2,
    },
  };
}
