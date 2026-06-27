import { verifyToken } from '@clerk/backend';
import {
  TokenVerificationError,
  type TokenVerifier,
  type VerifiedIdentity,
} from './token-verifier';

export type ClerkVerifierOptions = {
  secretKey: string;
  authorizedParties?: string[];
};

function readStringClaim(payload: object, key: string): string | null {
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Verifies Clerk session JWTs networklessly via Clerk's JWKS (resolved from the
 * secret key). `sub` is the Clerk user id; `email` is read from a custom claim
 * if the instance is configured to include it (otherwise null and filled in by
 * a later Clerk API sync).
 */
export function createClerkTokenVerifier(options: ClerkVerifierOptions): TokenVerifier {
  return {
    async verify(token) {
      let payload: object;
      try {
        payload = await verifyToken(token, {
          secretKey: options.secretKey,
          ...(options.authorizedParties ? { authorizedParties: options.authorizedParties } : {}),
        });
      } catch {
        throw new TokenVerificationError();
      }
      const clerkUserId = readStringClaim(payload, 'sub');
      if (!clerkUserId) throw new TokenVerificationError();
      return { clerkUserId, email: readStringClaim(payload, 'email') } satisfies VerifiedIdentity;
    },
  };
}
