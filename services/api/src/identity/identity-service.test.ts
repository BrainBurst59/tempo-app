import { describe, expect, it } from 'vitest';
import {
  InMemoryConsentRepository,
  InMemoryDataExportRepository,
  InMemoryUserRepository,
} from '../persistence/in-memory';
import { IdentityService, UserNotFoundError } from './identity-service';

function makeService(): IdentityService {
  return new IdentityService({
    users: new InMemoryUserRepository(),
    consents: new InMemoryConsentRepository(),
    dataExports: new InMemoryDataExportRepository(),
  });
}

const idA = { clerkUserId: 'clerk_a', email: null };
const idB = { clerkUserId: 'clerk_b', email: null };

describe('IdentityService authorization', () => {
  it('throws UserNotFoundError before the user is provisioned', async () => {
    await expect(makeService().getProfile(idA)).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('only ever returns the caller’s own profile', async () => {
    const service = makeService();
    await service.syncIdentity(idA, { displayName: 'Aya' });
    await service.syncIdentity(idB, { displayName: 'Bex' });
    expect((await service.getProfile(idA)).displayName).toBe('Aya');
    expect((await service.getProfile(idB)).displayName).toBe('Bex');
  });

  it('deleteAccount removes only the caller’s data, never another user’s', async () => {
    const service = makeService();
    await service.syncIdentity(idA, { displayName: 'Aya' });
    await service.syncIdentity(idB, { displayName: 'Bex' });
    await service.recordConsent(idB, {
      purpose: 'account',
      decision: 'granted',
      dataCategories: [],
      policyVersion: '1.0.0',
      source: 'onboarding',
    });

    await service.deleteAccount(idA);

    await expect(service.getProfile(idA)).rejects.toBeInstanceOf(UserNotFoundError);
    expect((await service.getProfile(idB)).displayName).toBe('Bex');
    expect(await service.listConsents(idB)).toHaveLength(1);
  });
});
