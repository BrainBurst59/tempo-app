import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_AUTHORIZED_PARTIES: z.string().optional(),
  DATABASE_URL: z.string().url().optional(),
});
export type ApiEnv = z.infer<typeof EnvSchema>;

/** Thrown when env validation fails; lists offending keys + reasons only,
 * never values (CLAUDE.md §17, §27). */
export class EnvValidationError extends Error {
  public readonly issues: readonly string[];
  constructor(issues: readonly string[]) {
    super(`Invalid environment configuration:\n${issues.map((i) => `  - ${i}`).join('\n')}`);
    this.name = 'EnvValidationError';
    this.issues = issues;
  }
}

export function loadEnv(source: Record<string, string | undefined> = process.env): ApiEnv {
  const result = EnvSchema.safeParse(source);
  if (!result.success) {
    throw new EnvValidationError(
      result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
    );
  }
  return result.data;
}

export function parseAuthorizedParties(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  const parties = value
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return parties.length > 0 ? parties : undefined;
}
