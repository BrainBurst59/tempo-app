import type {
  ConsentRecord,
  DataExportRecord,
  UserProfile,
  UserProfileUpdate,
} from '@tempo/contracts';

export type StoredUser = {
  id: string;
  clerkUserId: string;
  email: string | null;
  profile: UserProfile;
};

export type CreateUserInput = {
  clerkUserId: string;
  email: string | null;
  displayName: string;
};

export interface UserRepository {
  findByClerkId(clerkUserId: string): Promise<StoredUser | null>;
  create(input: CreateUserInput): Promise<StoredUser>;
  updateProfile(id: string, patch: UserProfileUpdate): Promise<StoredUser>;
  delete(id: string): Promise<void>;
}

export interface ConsentRepository {
  append(record: ConsentRecord): Promise<ConsentRecord>;
  listForUser(userId: string): Promise<ConsentRecord[]>;
  deleteForUser(userId: string): Promise<void>;
}

export interface DataExportRepository {
  create(record: DataExportRecord): Promise<DataExportRecord>;
  deleteForUser(userId: string): Promise<void>;
}
