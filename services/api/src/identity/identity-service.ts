import { randomUUID } from 'node:crypto';
import type {
  AuthenticatedUser,
  ConsentDecisionInput,
  ConsentRecord,
  DataExportRecord,
  IdentitySyncInput,
  UserProfile,
  UserProfileUpdate,
} from '@tempo/contracts';
import type { VerifiedIdentity } from '../auth/token-verifier';
import type {
  ConsentRepository,
  DataExportRepository,
  StoredUser,
  UserRepository,
} from '../persistence/repositories';

export class UserNotFoundError extends Error {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
  }
}

export type IdentityServiceDeps = {
  users: UserRepository;
  consents: ConsentRepository;
  dataExports: DataExportRepository;
  now?: () => Date;
  generateId?: () => string;
};

/**
 * Identity domain logic. Object-level authorization is structural: every method
 * resolves the caller's record from the VERIFIED identity (Clerk user id) and
 * never accepts a user id from the client. There is therefore no id to tamper
 * with — a token can only ever read/write its own data (OWASP API1/BOLA).
 */
export class IdentityService {
  constructor(private readonly deps: IdentityServiceDeps) {}

  private nowIso(): string {
    return (this.deps.now ? this.deps.now() : new Date()).toISOString();
  }

  private nextId(): string {
    return this.deps.generateId ? this.deps.generateId() : randomUUID();
  }

  private async requireUser(identity: VerifiedIdentity): Promise<StoredUser> {
    const user = await this.deps.users.findByClerkId(identity.clerkUserId);
    if (!user) throw new UserNotFoundError();
    return user;
  }

  /** Provisions the TEMPO user on first sign-in, or returns the existing one.
   * Identity comes from the verified token; the body is a display hint only. */
  async syncIdentity(
    identity: VerifiedIdentity,
    input: IdentitySyncInput,
  ): Promise<AuthenticatedUser> {
    const existing = await this.deps.users.findByClerkId(identity.clerkUserId);
    const user =
      existing ??
      (await this.deps.users.create({
        clerkUserId: identity.clerkUserId,
        email: identity.email,
        displayName: input.displayName ?? 'Athlete',
      }));
    return {
      userId: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      createdAt: user.profile.createdAt,
    };
  }

  async getProfile(identity: VerifiedIdentity): Promise<UserProfile> {
    return (await this.requireUser(identity)).profile;
  }

  async updateProfile(identity: VerifiedIdentity, patch: UserProfileUpdate): Promise<UserProfile> {
    const user = await this.requireUser(identity);
    return (await this.deps.users.updateProfile(user.id, patch)).profile;
  }

  async recordConsent(
    identity: VerifiedIdentity,
    input: ConsentDecisionInput,
  ): Promise<ConsentRecord> {
    const user = await this.requireUser(identity);
    return this.deps.consents.append({
      id: this.nextId(),
      userId: user.id,
      purpose: input.purpose,
      decision: input.decision,
      dataCategories: input.dataCategories,
      policyVersion: input.policyVersion,
      source: input.source,
      decidedAt: this.nowIso(),
    });
  }

  async listConsents(identity: VerifiedIdentity): Promise<ConsentRecord[]> {
    const user = await this.requireUser(identity);
    return this.deps.consents.listForUser(user.id);
  }

  async requestDataExport(identity: VerifiedIdentity): Promise<DataExportRecord> {
    const user = await this.requireUser(identity);
    return this.deps.dataExports.create({
      id: this.nextId(),
      userId: user.id,
      status: 'requested',
      requestedAt: this.nowIso(),
      readyAt: null,
    });
  }

  /** Deletes all of the caller's data. Production also deletes the Clerk user
   * via the Clerk API (wired in server.ts with the secret key). */
  async deleteAccount(identity: VerifiedIdentity): Promise<void> {
    const user = await this.requireUser(identity);
    await this.deps.consents.deleteForUser(user.id);
    await this.deps.dataExports.deleteForUser(user.id);
    await this.deps.users.delete(user.id);
  }
}
