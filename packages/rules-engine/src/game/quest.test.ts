import { describe, expect, it } from 'vitest';
import type { Quest } from '@tempo/contracts';
import { evaluateQuestCompletion } from './quest';

const competitiveQuest: Quest = {
  id: 'q1',
  title: 'Three verified strength sessions',
  description: 'Complete three verified strength sessions this week.',
  category: 'weekly',
  targetStat: 'strength',
  objectiveType: 'complete_sessions',
  objectiveTarget: 3,
  competitiveVerificationFloor: 'standard',
  reward: { xp: 200, xpTarget: 'strength', cosmeticItemId: null },
};

const personalQuest: Quest = {
  ...competitiveQuest,
  id: 'q2',
  competitiveVerificationFloor: null,
};

describe('evaluateQuestCompletion', () => {
  it('completes and grants competitive credit when the verification floor is met', () => {
    const result = evaluateQuestCompletion({
      quest: competitiveQuest,
      currentProgress: 2,
      increment: 1,
      verificationLevel: 'high_confidence',
    });
    expect(result.completed).toBe(true);
    expect(result.competitiveCreditEligible).toBe(true);
  });

  it('completes for personal progress but withholds competitive credit below the floor', () => {
    const result = evaluateQuestCompletion({
      quest: competitiveQuest,
      currentProgress: 2,
      increment: 1,
      verificationLevel: 'unverified',
    });
    expect(result.completed).toBe(true);
    expect(result.competitiveCreditEligible).toBe(false);
    expect(result.reasonCodes).toContain('below_verification_floor');
  });

  it('never grants competitive credit for suspicious activity', () => {
    const result = evaluateQuestCompletion({
      quest: competitiveQuest,
      currentProgress: 2,
      increment: 5,
      verificationLevel: 'suspicious',
    });
    expect(result.competitiveCreditEligible).toBe(false);
    expect(result.reasonCodes).toContain('suspicious_no_competitive_credit');
  });

  it('treats personal-only quests as never competitive', () => {
    const result = evaluateQuestCompletion({
      quest: personalQuest,
      currentProgress: 3,
      increment: 0,
      verificationLevel: 'high_confidence',
    });
    expect(result.completed).toBe(true);
    expect(result.competitiveCreditEligible).toBe(false);
    expect(result.reasonCodes).toContain('personal_progress_only');
  });

  it('does not complete before the objective target is reached', () => {
    const result = evaluateQuestCompletion({
      quest: competitiveQuest,
      currentProgress: 0,
      increment: 1,
      verificationLevel: 'standard',
    });
    expect(result.completed).toBe(false);
    expect(result.competitiveCreditEligible).toBe(false);
  });
});
