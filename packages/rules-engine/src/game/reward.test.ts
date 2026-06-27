import { describe, expect, it } from 'vitest';
import type { RewardCatalogItem } from '@tempo/contracts';
import { evaluateRewardEligibility, isPurchasableRewardAllowed } from './reward';

describe('evaluateRewardEligibility', () => {
  it('grants competitive reward only for verified, safe, competitive-earning activity', () => {
    const result = evaluateRewardEligibility({
      verificationLevel: 'high_confidence',
      safetyReviewFlagged: false,
      competitiveXp: 80,
    });
    expect(result.competitiveRewardEligible).toBe(true);
    expect(result.personalRewardEligible).toBe(true);
  });

  it('blocks competitive reward when a safety review is flagged', () => {
    const result = evaluateRewardEligibility({
      verificationLevel: 'high_confidence',
      safetyReviewFlagged: true,
      competitiveXp: 0,
    });
    expect(result.competitiveRewardEligible).toBe(false);
    expect(result.reasonCodes).toContain('safety_review_blocks_competitive_reward');
  });

  it('blocks all rewards for suspicious activity', () => {
    const result = evaluateRewardEligibility({
      verificationLevel: 'suspicious',
      safetyReviewFlagged: false,
      competitiveXp: 0,
    });
    expect(result.competitiveRewardEligible).toBe(false);
    expect(result.personalRewardEligible).toBe(false);
  });
});

describe('isPurchasableRewardAllowed (earn-not-buy)', () => {
  it('allows a cosmetic-only, non-performance item', () => {
    const cosmetic: RewardCatalogItem = {
      id: 'skin_nebula',
      type: 'skin',
      name: 'Nebula Skin',
      isCosmeticOnly: true,
      affectsPerformance: false,
      acquisition: 'purchasable',
    };
    expect(isPurchasableRewardAllowed(cosmetic)).toBe(true);
  });

  it('rejects a performance-affecting item crossing a trust boundary', () => {
    // The contract type forbids this; the cast simulates untrusted/malformed
    // data and proves the runtime guard still refuses pay-to-win.
    const tainted = {
      id: 'boost_strength',
      type: 'skin',
      name: 'Strength Boost',
      isCosmeticOnly: false,
      affectsPerformance: true,
      acquisition: 'purchasable',
    } as unknown as RewardCatalogItem;
    expect(isPurchasableRewardAllowed(tainted)).toBe(false);
  });
});
