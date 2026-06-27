import {
  TokenVerificationError,
  type TokenVerifier,
  type VerifiedIdentity,
} from './token-verifier';

/** Test/dev verifier: maps known opaque tokens to identities. Any other token
 * is rejected, exactly like an invalid real token. */
export function createFakeTokenVerifier(tokens: Record<string, VerifiedIdentity>): TokenVerifier {
  return {
    async verify(token) {
      const identity = tokens[token];
      if (!identity) throw new TokenVerificationError();
      return Promise.resolve(identity);
    },
  };
}
