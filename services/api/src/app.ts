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

  await app.register(helmet);
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'unhandled error');
    if (!reply.sent) reply.code(500).send({ message: 'Internal server error' });
  });

  // Public liveness probe.
  app.get('/healthz', () => ({ status: 'ok' }));

  // Everything below requires a verified Clerk session.
  await app.register((protectedScope, _opts, done) => {
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

    done();
  });

  return app;
}
