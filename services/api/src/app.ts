import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import {
  AccountDeletionRequestSchema,
  ConsentDecisionInputSchema,
  DataExportRequestSchema,
  IdentitySyncInputSchema,
  UserProfileUpdateSchema,
} from '@tempo/contracts';
import Fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
  type FastifyServerOptions,
} from 'fastify';
import type { TokenVerifier, VerifiedIdentity } from './auth/token-verifier';
import { IdentityService, UserNotFoundError } from './identity/identity-service';
import type {
  ConsentRepository,
  DataExportRepository,
  UserRepository,
} from './persistence/repositories';

declare module 'fastify' {
  interface FastifyRequest {
    identity?: VerifiedIdentity;
  }
}

export type AppDeps = {
  verifier: TokenVerifier;
  users: UserRepository;
  consents: ConsentRepository;
  dataExports: DataExportRepository;
  logger?: FastifyServerOptions['logger'];
  /** Rate-limit policy applied globally and to the authenticated router.
   * Defaults to 100 requests/minute; lowered in tests to assert 429s. */
  rateLimit?: { max: number; timeWindow: number | string };
};

function bearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

function identityOf(request: FastifyRequest): VerifiedIdentity {
  if (!request.identity) throw new Error('identity missing after auth hook');
  return request.identity;
}

function mapDomainError(error: unknown, reply: FastifyReply): FastifyReply {
  if (error instanceof UserNotFoundError) {
    return reply.code(404).send({ message: 'User not found' });
  }
  // Unexpected — let the central error handler log + return a safe 500.
  throw error;
}

export async function buildApp(deps: AppDeps): Promise<FastifyInstance> {
  const app = Fastify({ logger: deps.logger ?? false });
  const service = new IdentityService({
    users: deps.users,
    consents: deps.consents,
    dataExports: deps.dataExports,
  });

  const rateLimitOptions = deps.rateLimit ?? { max: 100, timeWindow: '1 minute' };

  await app.register(helmet);
  await app.register(rateLimit, rateLimitOptions);

  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500;
    // Client errors (e.g. 429 from rate limiting, 400 from body limits) carry a
    // safe status + message — surface them as-is. Server errors are logged and
    // returned as a generic 500 so internals never leak (CLAUDE.md §14, §17).
    if (statusCode >= 500) {
      request.log.error({ err: error }, 'unhandled error');
      if (!reply.sent) reply.code(500).send({ message: 'Internal server error' });
      return;
    }
    if (!reply.sent) reply.code(statusCode).send({ message: error.message });
  });

  // Public liveness probe.
  app.get('/healthz', () => ({ status: 'ok' }));

  // Everything below requires a verified Clerk session.
  await app.register(async (protectedScope) => {
    // Rate-limit the authenticated router explicitly. The root limiter above
    // already applies to inherited hooks, but registering within this scope
    // keeps the limit local to the routes that perform authorization.
    await protectedScope.register(rateLimit, rateLimitOptions);

    protectedScope.addHook('preHandler', async (request, reply) => {
      const token = bearerToken(request.headers.authorization);
      if (!token) return reply.code(401).send({ message: 'Authentication required' });
      try {
        request.identity = await deps.verifier.verify(token);
      } catch {
        return reply.code(401).send({ message: 'Invalid or expired token' });
      }
    });

    protectedScope.post('/v1/identity/sync', async (request, reply) => {
      const parsed = IdentitySyncInputSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ message: 'Invalid request body' });
      return reply.code(200).send(await service.syncIdentity(identityOf(request), parsed.data));
    });

    protectedScope.get('/v1/profile', async (request, reply) => {
      try {
        return reply.code(200).send(await service.getProfile(identityOf(request)));
      } catch (error) {
        return mapDomainError(error, reply);
      }
    });

    protectedScope.patch('/v1/profile', async (request, reply) => {
      const parsed = UserProfileUpdateSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ message: 'Invalid request body' });
      try {
        return reply.code(200).send(await service.updateProfile(identityOf(request), parsed.data));
      } catch (error) {
        return mapDomainError(error, reply);
      }
    });

    protectedScope.post('/v1/consent', async (request, reply) => {
      const parsed = ConsentDecisionInputSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ message: 'Invalid request body' });
      try {
        return reply.code(201).send(await service.recordConsent(identityOf(request), parsed.data));
      } catch (error) {
        return mapDomainError(error, reply);
      }
    });

    protectedScope.get('/v1/consent', async (request, reply) => {
      try {
        return reply.code(200).send(await service.listConsents(identityOf(request)));
      } catch (error) {
        return mapDomainError(error, reply);
      }
    });

    protectedScope.post('/v1/data-export', async (request, reply) => {
      const parsed = DataExportRequestSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ message: 'Invalid request body' });
      try {
        return reply.code(202).send(await service.requestDataExport(identityOf(request)));
      } catch (error) {
        return mapDomainError(error, reply);
      }
    });

    protectedScope.delete('/v1/account', async (request, reply) => {
      const parsed = AccountDeletionRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: 'Account deletion requires explicit confirmation' });
      }
      try {
        await service.deleteAccount(identityOf(request));
        return reply.code(204).send();
      } catch (error) {
        return mapDomainError(error, reply);
      }
    });
  });

  return app;
}
