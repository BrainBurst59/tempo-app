import { describe, expect, it } from 'vitest';
import {
  AvatarProgressionStateSchema,
  CompetitionEntrySchema,
  CompetitionSchema,
  GAME_STATS,
  GameStatSchema,
  GhostRivalSchema,
  QuestRewardSchema,
  RewardCatalogItemSchema,
  VerificationConfidenceScoreSchema,
  WorkoutVerificationLevelSchema,
  XpLedgerEntrySchema,
} from './index';

describe('GameStat', () => {
  it('exposes exactly the seven TEMPO stats', () => {
    expect(GAME_STATS).toEqual([
      'strength',
      'endurance',
      'mobility',
      'fuel',
      'recovery',
      'technique',
      'rhythm',
    ]);
  });

  it('rejects unknown stats', () => {
    expect(() => GameStatSchema.parse('agility')).toThrow();
  });
});

describe('AvatarProgressionStateSchema', () => {
  const stats = GAME_STATS.map((stat) => ({ stat, level: 1, xp: 0 }));
  const base = {
    userId: 'u1',
    archetype: 'androgynous',
    evolutionStage: 'base',
    overallLevel: 1,
    totalXp: 0,
    stats,
    updatedAt: '2026-06-27T00:00:00.000Z',
  };

  it('accepts one entry per stat', () => {
    expect(AvatarProgressionStateSchema.parse(base).stats).toHaveLength(7);
  });

  it('rejects duplicate stats', () => {
    const duplicated = [...stats.slice(0, 6), { stat: 'strength', level: 1, xp: 0 }];
    expect(() => AvatarProgressionStateSchema.parse({ ...base, stats: duplicated })).toThrow();
  });
});

describe('RewardCatalogItemSchema (earn-not-buy invariant)', () => {
  const cosmetic = {
    id: 'aura_ember',
    type: 'aura_effect',
    name: 'Ember Aura',
    isCosmeticOnly: true,
    affectsPerformance: false,
    acquisition: 'purchasable',
  };

  it('accepts a cosmetic-only purchasable item', () => {
    expect(RewardCatalogItemSchema.parse(cosmetic).acquisition).toBe('purchasable');
  });

  it('rejects a performance-affecting item', () => {
    expect(() =>
      RewardCatalogItemSchema.parse({ ...cosmetic, affectsPerformance: true }),
    ).toThrow();
  });

  it('rejects a non-cosmetic item', () => {
    expect(() => RewardCatalogItemSchema.parse({ ...cosmetic, isCosmeticOnly: false })).toThrow();
  });

  it('rejects unknown fields (no smuggled stat boosts)', () => {
    expect(() => RewardCatalogItemSchema.parse({ ...cosmetic, strengthBoost: 5 })).toThrow();
  });
});

describe('QuestRewardSchema', () => {
  it('defaults to overall XP and no cosmetic', () => {
    const reward = QuestRewardSchema.parse({});
    expect(reward).toEqual({ xp: 0, xpTarget: 'overall', cosmeticItemId: null });
  });

  it('rejects unknown reward fields', () => {
    expect(() => QuestRewardSchema.parse({ statBoost: 3 })).toThrow();
  });
});

describe('VerificationConfidenceScoreSchema', () => {
  it('round-trips a high-confidence score', () => {
    const score = VerificationConfidenceScoreSchema.parse({
      level: 'high_confidence',
      score: 88,
      corroboratingSignals: ['wearable_heart_rate', 'wearable_workout_session'],
      reasonCodes: ['multi_signal'],
    });
    expect(score.level).toBe('high_confidence');
  });

  it('enumerates the four verification levels', () => {
    expect(WorkoutVerificationLevelSchema.options).toEqual([
      'unverified',
      'standard',
      'high_confidence',
      'suspicious',
    ]);
  });
});

describe('XpLedgerEntrySchema', () => {
  it('rejects negative XP (XP is never deducted as punishment)', () => {
    expect(() =>
      XpLedgerEntrySchema.parse({
        id: 'x1',
        userId: 'u1',
        occurredAt: '2026-06-27T00:00:00.000Z',
        target: 'strength',
        amount: -10,
        kind: 'personal',
        source: 'xp_awarded',
        verificationLevel: 'standard',
        questId: null,
        reasonCodes: [],
      }),
    ).toThrow();
  });
});

describe('Competition privacy defaults', () => {
  it('requires opt-in and defaults visibility to private', () => {
    const competition = CompetitionSchema.parse({
      id: 'c1',
      title: 'June Strength Season',
      type: 'leaderboard_season',
      metricStat: 'strength',
      startsAt: '2026-06-01T00:00:00.000Z',
      endsAt: '2026-06-30T00:00:00.000Z',
      optInRequired: true,
    });
    expect(competition.optInRequired).toBe(true);
    expect(competition.visibilityDefault).toBe('private');
  });

  it('rejects a competition entry without explicit opt-in', () => {
    expect(() =>
      CompetitionEntrySchema.parse({
        competitionId: 'c1',
        userId: 'u1',
        optedIn: false,
        visibility: 'private',
        competitiveXp: 0,
        verificationLevel: 'standard',
        joinedAt: '2026-06-01T00:00:00.000Z',
      }),
    ).toThrow();
  });
});

describe('GhostRivalSchema', () => {
  it('must be privacy-preserving', () => {
    expect(() =>
      GhostRivalSchema.parse({
        id: 'g1',
        ownerUserId: 'u1',
        source: 'self_past',
        label: 'Past You',
        metricStat: 'endurance',
        pace: [{ atMinute: 0, score: 0 }],
        privacyPreserving: false,
      }),
    ).toThrow();
  });
});
