import { describe, expect, it } from 'vitest';
import { FitnessGoalSchema, UserProfileSchema, UserProfileUpdateSchema } from './profile';

const validProfile = {
  userId: 'usr_123',
  displayName: 'Lannie',
  biologicalSex: null,
  birthDate: null,
  heightCm: null,
  weightKg: null,
  primaryGoal: 'recomposition' as const,
  measurementSystem: 'metric' as const,
  avatarArchetype: null,
  onboardingCompletedAt: null,
  createdAt: '2026-06-27T00:00:00.000Z',
  updatedAt: '2026-06-27T00:00:00.000Z',
};

describe('UserProfileSchema', () => {
  it('accepts a minimal valid profile', () => {
    expect(UserProfileSchema.parse(validProfile).primaryGoal).toBe('recomposition');
  });

  it('rejects out-of-range body metrics', () => {
    expect(() => UserProfileSchema.parse({ ...validProfile, weightKg: 5 })).toThrow();
  });
});

describe('UserProfileUpdateSchema', () => {
  it('allows a partial update', () => {
    expect(UserProfileUpdateSchema.parse({ displayName: 'New Name' })).toEqual({
      displayName: 'New Name',
    });
  });

  it('blocks mass assignment of server-owned fields', () => {
    // userId / createdAt are not mutable via the update schema (.strict()).
    expect(() => UserProfileUpdateSchema.parse({ userId: 'attacker' })).toThrow();
    expect(() =>
      UserProfileUpdateSchema.parse({ createdAt: '2020-01-01T00:00:00.000Z' }),
    ).toThrow();
  });
});

describe('FitnessGoalSchema', () => {
  it('is the shared goal vocabulary', () => {
    expect(FitnessGoalSchema.options).toContain('recomposition');
    expect(FitnessGoalSchema.options).toContain('general_fitness');
  });
});
