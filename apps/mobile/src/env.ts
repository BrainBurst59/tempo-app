import { z } from 'zod';

/**
 * Public (client-shipped) environment for the TEMPO mobile app.
 *
 * Only `EXPO_PUBLIC_*` values belong here — Expo statically inlines them at
 * build time and they are visible in the bundle. The Clerk *publishable* key is
 * safe to ship; the Clerk *secret* key must NEVER appear in the client
 * (CLAUDE.md §6, §27).
 */
const ClientEnvSchema = z.object({
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is required')
    .regex(/^pk_(test|live)_/, 'must be a Clerk publishable key (pk_test_… or pk_live_…)'),
  EXPO_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:3000'),
});
export type ClientEnv = z.infer<typeof ClientEnvSchema>;

/** Thrown when public env validation fails. Lists offending keys + reasons only;
 * never echoes values, so a misconfigured key cannot leak into logs. */
export class ClientEnvError extends Error {
  public readonly issues: readonly string[];
  constructor(issues: readonly string[]) {
    super(`Invalid public environment configuration:\n${issues.map((i) => `  - ${i}`).join('\n')}`);
    this.name = 'ClientEnvError';
    this.issues = issues;
  }
}

/** Pure validator — unit-testable without touching `process.env`. */
export function validateClientEnv(source: Record<string, string | undefined>): ClientEnv {
  const result = ClientEnvSchema.safeParse(source);
  if (!result.success) {
    throw new ClientEnvError(
      result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
    );
  }
  return result.data;
}

/** Reads + validates the public env from the inlined `process.env`. Call at
 * startup and surface a clear config error rather than crashing the bundler. */
export function readClientEnv(): ClientEnv {
  return validateClientEnv({
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  });
}
