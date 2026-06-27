import type { RewardCatalogItem, WorkoutVerificationLevel } from '@tempo/contracts';

/**
 * Deterministic reward eligibility and the earn-not-buy guard.
 *
 * Competitive rewards require verified, safe activity. Cosmetic items may be
 * purchased, but purchases can NEVER grant fitness progress or competitive
 * advantage (CLAUDE.md §26 — fitness progress cannot be purchased).
 */

export interface RewardEligibilityInput {
  verificationLevel: WorkoutVerificationLevel;
  safetyReviewFlagged: boolean;
  competitiveXp: number;
}

export interface RewardEligibilityResult {
  /** May this activity grant rewards toward competitions/leaderboards? */
  competitiveRewardEligible: boolean;
  /** May this activity grant the user's own (non-competitive) rewards? */
  personalRewardEligible: boolean;
  reasonCodes: string[];
}

export function evaluateRewardEligibility(input: RewardEligibilityInput): RewardEligibilityResult {
  const reasonCodes: string[] = [];

  const personalRewardEligible = input.verificationLevel !== 'suspicious';
  if (!personalRewardEligible) reasonCodes.push('suspicious_no_personal_reward');

  const competitiveRewardEligible =
    input.verificationLevel !== 'suspicious' &&
    !input.safetyReviewFlagged &&
    input.competitiveXp > 0;

  if (input.safetyReviewFlagged) reasonCodes.push('safety_review_blocks_competitive_reward');
  if (input.verificationLevel === 'suspicious')
    reasonCodes.push('suspicious_no_competitive_reward');
  if (competitiveRewardEligible) reasonCodes.push('competitive_reward_eligible');

  return { competitiveRewardEligible, personalRewardEligible, reasonCodes };
}

/**
 * Earn-not-buy guard. A reward item may be offered on the purchasable path ONLY
 * if it is cosmetic-only and does not affect performance. The contract types
 * already make a performance-affecting purchasable item unrepresentable; this is
 * the runtime defense for data crossing a trust boundary.
 */
export function isPurchasableRewardAllowed(item: RewardCatalogItem): boolean {
  return item.isCosmeticOnly === true && item.affectsPerformance === false;
}
