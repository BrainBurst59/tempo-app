/** The verified principal extracted from a Clerk session JWT. */
export type VerifiedIdentity = {
  clerkUserId: string;
  email: string | null;
};

/** Abstraction over JWT verification so the HTTP layer and tests do not depend
 * on Clerk directly. Production uses the Clerk implementation; tests inject a
 * fake. */
export interface TokenVerifier {
  verify(token: string): Promise<VerifiedIdentity>;
}

export class TokenVerificationError extends Error {
  constructor(message = 'Invalid or expired token') {
    super(message);
    this.name = 'TokenVerificationError';
  }
}
