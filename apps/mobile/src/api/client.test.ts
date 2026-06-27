import type {
  AuthenticatedUser,
  ConsentDecisionInput,
  ConsentRecord,
  DataExportRecord,
  UserProfile,
} from '@tempo/contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import { createTempoApiClient, TempoApiError, type TempoApiClient } from './client';

const BASE_URL = 'https://api.test.tempo';
const TOKEN = 'clerk_session_token_123';

// Valid fixtures, typed against the merged backend contract so a schema drift
// breaks this file at compile time, not just at runtime.
const authenticatedUser: AuthenticatedUser = {
  userId: 'usr_1',
  clerkUserId: 'clerk_1',
  email: 'aya@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
};
const userProfile: UserProfile = {
  userId: 'usr_1',
  displayName: 'Aya',
  biologicalSex: null,
  birthDate: null,
  heightCm: null,
  weightKg: null,
  primaryGoal: 'general_fitness',
  measurementSystem: 'metric',
  avatarArchetype: null,
  onboardingCompletedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};
const consentRecord: ConsentRecord = {
  id: 'cns_1',
  userId: 'usr_1',
  purpose: 'health_personalization',
  decision: 'granted',
  dataCategories: [],
  policyVersion: '1.0.0',
  source: 'onboarding',
  decidedAt: '2026-01-01T00:00:00.000Z',
};
const dataExportRecord: DataExportRecord = {
  id: 'exp_1',
  userId: 'usr_1',
  status: 'requested',
  requestedAt: '2026-01-01T00:00:00.000Z',
  readyAt: null,
};

type FetchResult = { status: number; ok: boolean; json: () => Promise<unknown> };
type CapturedInit = { method: string; headers: Record<string, string>; body?: string };

function jsonResponse(status: number, body?: unknown): FetchResult {
  return { status, ok: status >= 200 && status < 300, json: () => Promise.resolve(body) };
}

const fetchMock = vi.fn<(url: string, init: CapturedInit) => Promise<FetchResult>>();

function makeClient(getToken: () => Promise<string | null> = async () => TOKEN): TempoApiClient {
  return createTempoApiClient({ baseUrl: BASE_URL, getToken });
}

function lastCall(): [string, CapturedInit] {
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const call = fetchMock.mock.calls[0];
  if (!call) throw new Error('fetch was not called');
  return call;
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createTempoApiClient — request construction', () => {
  it('adds an Authorization: Bearer header from getToken()', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, userProfile));
    await makeClient().getProfile();
    const [url, init] = lastCall();
    expect(url).toBe(`${BASE_URL}/v1/profile`);
    expect(init.headers.authorization).toBe(`Bearer ${TOKEN}`);
  });

  it('sets Content-Type: application/json when sending a JSON body', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, userProfile));
    await makeClient().updateProfile({ displayName: 'Aya' });
    const [, init] = lastCall();
    expect(init.headers['content-type']).toBe('application/json');
  });

  it('omits Content-Type on a body-less GET', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, userProfile));
    await makeClient().getProfile();
    const [, init] = lastCall();
    expect(init.headers['content-type']).toBeUndefined();
  });

  it('throws TempoApiError(401) without calling fetch when getToken() returns null', async () => {
    const error = await makeClient(async () => null)
      .getProfile()
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TempoApiError);
    expect(error).toMatchObject({ status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('createTempoApiClient — response handling', () => {
  it('handles 204 No Content for account deletion (resolves without parsing a body)', async () => {
    fetchMock.mockResolvedValue(jsonResponse(204));
    await expect(makeClient().deleteAccount()).resolves.toBeUndefined();
  });

  it('maps a backend error response into TempoApiError(status, message)', async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { message: 'User not found' }));
    const error = await makeClient()
      .getProfile()
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TempoApiError);
    expect(error).toMatchObject({ status: 404, message: 'User not found' });
  });

  it('falls back to a generic message when the error body has none', async () => {
    fetchMock.mockResolvedValue(jsonResponse(500, {}));
    const error = await makeClient()
      .getProfile()
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TempoApiError);
    expect(error).toMatchObject({ status: 500, message: 'Request failed (500)' });
  });

  it('rejects a malformed success response through schema validation', async () => {
    // 200 OK but missing required UserProfile fields -> schema parse must throw.
    fetchMock.mockResolvedValue(jsonResponse(200, { userId: 'usr_1' }));
    await expect(makeClient().getProfile()).rejects.toBeInstanceOf(ZodError);
  });
});

describe('createTempoApiClient — method, path, and body per endpoint', () => {
  function expectCall(method: string, path: string, body: unknown): void {
    const [url, init] = lastCall();
    expect(url).toBe(`${BASE_URL}${path}`);
    expect(init.method).toBe(method);
    if (body === undefined) {
      expect(init.body).toBeUndefined();
    } else {
      expect(init.body).toBeTypeOf('string');
      expect(JSON.parse(init.body as string)).toEqual(body);
    }
  }

  it('POST /v1/identity/sync', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, authenticatedUser));
    await makeClient().syncIdentity({ displayName: 'Aya' });
    expectCall('POST', '/v1/identity/sync', { displayName: 'Aya' });
  });

  it('GET /v1/profile', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, userProfile));
    await makeClient().getProfile();
    expectCall('GET', '/v1/profile', undefined);
  });

  it('PATCH /v1/profile', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, userProfile));
    await makeClient().updateProfile({ displayName: 'Aya', primaryGoal: 'endurance' });
    expectCall('PATCH', '/v1/profile', { displayName: 'Aya', primaryGoal: 'endurance' });
  });

  it('POST /v1/consent', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, consentRecord));
    const input: ConsentDecisionInput = {
      purpose: 'health_personalization',
      decision: 'granted',
      dataCategories: [],
      policyVersion: '1.0.0',
      source: 'onboarding',
    };
    await makeClient().recordConsent(input);
    expectCall('POST', '/v1/consent', input);
  });

  it('POST /v1/data-export', async () => {
    fetchMock.mockResolvedValue(jsonResponse(202, dataExportRecord));
    await makeClient().requestDataExport();
    expectCall('POST', '/v1/data-export', { categories: [] });
  });

  it('DELETE /v1/account', async () => {
    fetchMock.mockResolvedValue(jsonResponse(204));
    await makeClient().deleteAccount();
    expectCall('DELETE', '/v1/account', { confirm: true });
  });
});
