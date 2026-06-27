import type { Quest, WorkoutVerificationLevel } from '@tempo/contracts';

/**
 * Deterministic quest completion evaluation.
 *
 * A quest may complete for PERSONAL progress on honest activity, but competitive
 * credit is withheld unless the contributing workout meets the quest's
 * verification floor and is not suspicious (CLAUDE.md §26).
 */

const VERIFICATION_ORDER: Record<WorkoutVerificationLevel, number> = {
  suspicious: 0,
  unverified: 1,
  standard: 2,
  high_confidence: 3,
};

export interface QuestEvaluationInput {
  quest: Quest;
  currentProgress: number;
  increment: number;
  verificationLevel: WorkoutVerificationLevel;
}

export interface QuestEvaluationResult {
  current: number;
  target: number;
  completed: boolean;
  competitiveCreditEligible: boolean;
  reasonCodes: string[];
}

export function evaluateQuestCompletion(input: QuestEvaluationInput): QuestEvaluationResult {
  const reasonCodes: string[] = [];
  const increment = Math.max(0, Math.trunc(input.increment));
  const current = Math.max(0, Math.trunc(input.currentProgress)) + increment;
  const target = input.quest.objectiveTarget;
  const completed = current >= target;

  if (completed) reasonCodes.push('objective_met');

  let competitiveCreditEligible = false;
  const floor = input.quest.competitiveVerificationFloor;
  if (floor === null) {
    reasonCodes.push('personal_progress_only');
  } else if (input.verificationLevel === 'suspicious') {
    reasonCodes.push('suspicious_no_competitive_credit');
  } else if (VERIFICATION_ORDER[input.verificationLevel] >= VERIFICATION_ORDER[floor]) {
    competitiveCreditEligible = completed;
    if (competitiveCreditEligible) reasonCodes.push('competitive_credit_eligible');
  } else {
    reasonCodes.push('below_verification_floor');
  }

  return { current, target, completed, competitiveCreditEligible, reasonCodes };
}
