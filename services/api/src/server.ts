import { createClerkTokenVerifier } from './auth/clerk-token-verifier';
import { buildApp } from './app';
import { loadEnv, parseAuthorizedParties } from './env';
import { loggerOptions } from './logger';
import {
  InMemoryConsentRepository,
  InMemoryDataExportRepository,
  InMemoryUserRepository,
} from './persistence/in-memory';

async function main(): Promise<void> {
  const env = loadEnv();
  const authorizedParties = parseAuthorizedParties(env.CLERK_AUTHORIZED_PARTIES);
  const verifier = createClerkTokenVerifier({
    secretKey: env.CLERK_SECRET_KEY,
    ...(authorizedParties ? { authorizedParties } : {}),
  });

  // Fail closed: the in-memory store is for local/dev only. A durable adapter
  // (Prisma/Postgres) must be wired before production (CLAUDE.md §6, §18).
  if (env.NODE_ENV === 'production') {
    throw new Error(
      'Refusing to start in production: durable persistence (Prisma/Postgres) is not yet wired.',
    );
  }

  const app = await buildApp({
    verifier,
    users: new InMemoryUserRepository(),
    consents: new InMemoryConsentRepository(),
    dataExports: new InMemoryDataExportRepository(),
    logger: loggerOptions,
  });

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
}

main().catch((error: unknown) => {
  console.error('Failed to start TEMPO API', error);
  process.exit(1);
});
