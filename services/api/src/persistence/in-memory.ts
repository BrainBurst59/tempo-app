import { randomUUID } from 'node:crypto';
import type {
  ConsentRecord,
  DataExportRecord,
  UserProfile,
  UserProfileUpdate,
} from '@tempo/contracts';
import type {
  ConsentRepository,
  CreateUserInput,
  DataExportRepository,
  StoredUser,
  UserRepository,
} from './repositories';

/**
 * In-memory adapters for tests and local development. NEVER used in production
 * (server.ts fails closed without a durable store). They implement real
 * store/retrieve semantics so domain tests exercise the same behavior as the
 * durable adapters.
 */
export class InMemoryUserRepository implements UserRepository {
  private readonly byId = new Map<string, StoredUser>();
  private readonly clerkToId = new Map<string, string>();

  findByClerkId(clerkUserId: string): Promise<StoredUser | null> {
    const id = this.clerkToId.get(clerkUserId);
    return Promise.resolve(id ? (this.byId.get(id) ?? null) : null);
  }

  create(input: CreateUserInput): Promise<StoredUser> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const profile: UserProfile = {
      userId: id,
      displayName: input.displayName,
      biologicalSex: null,
      birthDate: null,
      heightCm: null,
      weightKg: null,
      primaryGoal: 'general_fitness',
      measurementSystem: 'metric',
      avatarArchetype: null,
      onboardingCompletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const user: StoredUser = { id, clerkUserId: input.clerkUserId, email: input.email, profile };
    this.byId.set(id, user);
    this.clerkToId.set(input.clerkUserId, id);
    return Promise.resolve(user);
  }

  updateProfile(id: string, patch: UserProfileUpdate): Promise<StoredUser> {
    const user = this.byId.get(id);
    if (!user) return Promise.reject(new Error('User not found'));
    const profile: UserProfile = { ...user.profile, updatedAt: new Date().toISOString() };
    // Apply only the keys the caller actually provided (no undefined writes).
    for (const key of Object.keys(patch) as (keyof UserProfileUpdate)[]) {
      const value = patch[key];
      if (value !== undefined) {
        (profile as Record<string, unknown>)[key] = value;
      }
    }
    const next: StoredUser = { ...user, profile };
    this.byId.set(id, next);
    return Promise.resolve(next);
  }

  delete(id: string): Promise<void> {
    const user = this.byId.get(id);
    if (user) {
      this.clerkToId.delete(user.clerkUserId);
      this.byId.delete(id);
    }
    return Promise.resolve();
  }
}

export class InMemoryConsentRepository implements ConsentRepository {
  private readonly byUser = new Map<string, ConsentRecord[]>();

  append(record: ConsentRecord): Promise<ConsentRecord> {
    const list = this.byUser.get(record.userId) ?? [];
    list.push(record);
    this.byUser.set(record.userId, list);
    return Promise.resolve(record);
  }

  listForUser(userId: string): Promise<ConsentRecord[]> {
    return Promise.resolve([...(this.byUser.get(userId) ?? [])]);
  }

  deleteForUser(userId: string): Promise<void> {
    this.byUser.delete(userId);
    return Promise.resolve();
  }
}

export class InMemoryDataExportRepository implements DataExportRepository {
  private readonly byUser = new Map<string, DataExportRecord[]>();

  create(record: DataExportRecord): Promise<DataExportRecord> {
    const list = this.byUser.get(record.userId) ?? [];
    list.push(record);
    this.byUser.set(record.userId, list);
    return Promise.resolve(record);
  }

  deleteForUser(userId: string): Promise<void> {
    this.byUser.delete(userId);
    return Promise.resolve();
  }
}
