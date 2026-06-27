import {
  AuthenticatedUserSchema,
  ConsentRecordSchema,
  DataExportRecordSchema,
  UserProfileSchema,
} from '@tempo/contracts';
import type {
  AuthenticatedUser,
  ConsentDecisionInput,
  ConsentRecord,
  DataExportRecord,
  IdentitySyncInput,
  UserProfile,
  UserProfileUpdate,
} from '@tempo/contracts';

/** Error carrying the HTTP status so callers can branch (401 → re-auth, etc.). */
export class TempoApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'TempoApiError';
  }
}

export type TempoApiClientOptions = {
  baseUrl: string;
  /** Returns the current Clerk session token, or null if signed out. */
  getToken: () => Promise<string | null>;
};

export type TempoApiClient = {
  syncIdentity: (input: IdentitySyncInput) => Promise<AuthenticatedUser>;
  getProfile: () => Promise<UserProfile>;
  updateProfile: (input: UserProfileUpdate) => Promise<UserProfile>;
  recordConsent: (input: ConsentDecisionInput) => Promise<ConsentRecord>;
  requestDataExport: () => Promise<DataExportRecord>;
  deleteAccount: () => Promise<void>;
};

type RequestInitLite = { method: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: string };

function extractMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return `Request failed (${status})`;
}

export function createTempoApiClient({ baseUrl, getToken }: TempoApiClientOptions): TempoApiClient {
  async function request(path: string, init: RequestInitLite): Promise<unknown> {
    const token = await getToken();
    if (!token) throw new TempoApiError(401, 'Not authenticated');

    const headers: Record<string, string> = { authorization: `Bearer ${token}` };
    if (init.body !== undefined) headers['content-type'] = 'application/json';

    const requestInit: { method: string; headers: Record<string, string>; body?: string } = {
      method: init.method,
      headers,
    };
    if (init.body !== undefined) requestInit.body = init.body;

    const response = await fetch(`${baseUrl}${path}`, requestInit);

    if (response.status === 204) return undefined;
    const payload: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      throw new TempoApiError(response.status, extractMessage(payload, response.status));
    }
    return payload;
  }

  return {
    async syncIdentity(input) {
      return AuthenticatedUserSchema.parse(
        await request('/v1/identity/sync', { method: 'POST', body: JSON.stringify(input) }),
      );
    },
    async getProfile() {
      return UserProfileSchema.parse(await request('/v1/profile', { method: 'GET' }));
    },
    async updateProfile(input) {
      return UserProfileSchema.parse(
        await request('/v1/profile', { method: 'PATCH', body: JSON.stringify(input) }),
      );
    },
    async recordConsent(input) {
      return ConsentRecordSchema.parse(
        await request('/v1/consent', { method: 'POST', body: JSON.stringify(input) }),
      );
    },
    async requestDataExport() {
      return DataExportRecordSchema.parse(
        await request('/v1/data-export', {
          method: 'POST',
          body: JSON.stringify({ categories: [] }),
        }),
      );
    },
    async deleteAccount() {
      await request('/v1/account', { method: 'DELETE', body: JSON.stringify({ confirm: true }) });
    },
  };
}
