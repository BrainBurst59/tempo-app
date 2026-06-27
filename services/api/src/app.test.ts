import type { FastifyInstance } from 'fastify';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from './app';
import { createFakeTokenVerifier } from './auth/fake-token-verifier';
import {
  InMemoryConsentRepository,
  InMemoryDataExportRepository,
  InMemoryUserRepository,
} from './persistence/in-memory';

const TOKENS = {
  'token-a': { clerkUserId: 'clerk_a', email: 'a@example.com' },
  'token-b': { clerkUserId: 'clerk_b', email: 'b@example.com' },
};

function auth(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}` };
}

describe('TEMPO API', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({
      verifier: createFakeTokenVerifier(TOKENS),
      users: new InMemoryUserRepository(),
      consents: new InMemoryConsentRepository(),
      dataExports: new InMemoryDataExportRepository(),
    });
  });

  it('exposes a public health check', async () => {
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });

  it('rejects protected routes without a token (401)', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/profile' });
    expect(res.statusCode).toBe(401);
  });

  it('rejects an invalid token (401)', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/profile', headers: auth('bogus') });
    expect(res.statusCode).toBe(401);
  });

  it('provisions a user on identity sync and returns their profile', async () => {
    const sync = await app.inject({
      method: 'POST',
      url: '/v1/identity/sync',
      headers: auth('token-a'),
      payload: { displayName: 'Aya' },
    });
    expect(sync.statusCode).toBe(200);

    const profile = await app.inject({
      method: 'GET',
      url: '/v1/profile',
      headers: auth('token-a'),
    });
    expect(profile.statusCode).toBe(200);
    expect(profile.json().displayName).toBe('Aya');
  });

  it('returns 404 for a verified token with no provisioned user', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/profile', headers: auth('token-b') });
    expect(res.statusCode).toBe(404);
  });

  it('isolates users — there is no id to tamper with (BOLA)', async () => {
    await app.inject({
      method: 'POST',
      url: '/v1/identity/sync',
      headers: auth('token-a'),
      payload: { displayName: 'Aya' },
    });
    await app.inject({
      method: 'POST',
      url: '/v1/identity/sync',
      headers: auth('token-b'),
      payload: { displayName: 'Bex' },
    });

    const a = await app.inject({ method: 'GET', url: '/v1/profile', headers: auth('token-a') });
    const b = await app.inject({ method: 'GET', url: '/v1/profile', headers: auth('token-b') });
    expect(a.json().displayName).toBe('Aya');
    expect(b.json().displayName).toBe('Bex');
  });

  it('blocks mass assignment on profile update (400)', async () => {
    await app.inject({
      method: 'POST',
      url: '/v1/identity/sync',
      headers: auth('token-a'),
      payload: {},
    });
    const res = await app.inject({
      method: 'PATCH',
      url: '/v1/profile',
      headers: auth('token-a'),
      payload: { userId: 'attacker' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('records consent as an append-only log (grant then revoke)', async () => {
    await app.inject({
      method: 'POST',
      url: '/v1/identity/sync',
      headers: auth('token-a'),
      payload: {},
    });
    const grant = await app.inject({
      method: 'POST',
      url: '/v1/consent',
      headers: auth('token-a'),
      payload: {
        purpose: 'health_personalization',
        decision: 'granted',
        policyVersion: '1.0.0',
        source: 'onboarding',
      },
    });
    expect(grant.statusCode).toBe(201);

    const revoke = await app.inject({
      method: 'POST',
      url: '/v1/consent',
      headers: auth('token-a'),
      payload: {
        purpose: 'health_personalization',
        decision: 'revoked',
        policyVersion: '1.0.0',
        source: 'settings',
      },
    });
    expect(revoke.statusCode).toBe(201);

    const list = await app.inject({ method: 'GET', url: '/v1/consent', headers: auth('token-a') });
    expect(list.json()).toHaveLength(2);
  });

  it('rate-limits an authenticated protected route (429 after the threshold)', async () => {
    // Drive the limit low so the threshold is reached deterministically.
    const limited = await buildApp({
      verifier: createFakeTokenVerifier(TOKENS),
      users: new InMemoryUserRepository(),
      consents: new InMemoryConsentRepository(),
      dataExports: new InMemoryDataExportRepository(),
      rateLimit: { max: 3, timeWindow: '1 minute' },
    });

    const statuses: number[] = [];
    for (let i = 0; i < 4; i++) {
      const res = await limited.inject({
        method: 'GET',
        url: '/v1/profile',
        // Verified token, no provisioned user -> the handler runs and returns
        // 404, proving the request passed auth and was NOT rate-limited yet.
        headers: auth('token-b'),
      });
      statuses.push(res.statusCode);
    }

    // Authorized requests reach the handler (404) up to the limit...
    expect(statuses.slice(0, 3)).toEqual([404, 404, 404]);
    // ...then @fastify/rate-limit rejects the next one with 429.
    expect(statuses[3]).toBe(429);
  });

  it('requires explicit confirmation for account deletion, then removes data', async () => {
    await app.inject({
      method: 'POST',
      url: '/v1/identity/sync',
      headers: auth('token-a'),
      payload: {},
    });

    const unconfirmed = await app.inject({
      method: 'DELETE',
      url: '/v1/account',
      headers: auth('token-a'),
      payload: { confirm: false },
    });
    expect(unconfirmed.statusCode).toBe(400);

    const deleted = await app.inject({
      method: 'DELETE',
      url: '/v1/account',
      headers: auth('token-a'),
      payload: { confirm: true },
    });
    expect(deleted.statusCode).toBe(204);

    const after = await app.inject({ method: 'GET', url: '/v1/profile', headers: auth('token-a') });
    expect(after.statusCode).toBe(404);
  });
});
