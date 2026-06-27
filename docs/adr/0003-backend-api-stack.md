# 0003 — Backend API stack (services/api)

- **Status**: Accepted
- **Date**: 2026-06-27
- **Deciders**: Lance (proposed by engineering)

## Context

The identity milestone requires a backend that verifies Clerk session JWTs and
owns the durable user profile + consent records, with object-level
authorization, request validation, structured logging, rate limiting, and a
health check (AGENTS.md §13–§18). `AGENTS.md` §5 prefers NestJS "or equivalent",
and allows an ADR to choose otherwise.

## Decision

Build `services/api` on **Fastify 5 + Zod + Prisma/Postgres + @clerk/backend**.

- **HTTP**: Fastify 5 (ESM). Auth is a `preHandler` hook on an encapsulated
  protected-route scope; the public health route sits outside it.
- **Auth**: Clerk JWT verification behind a `TokenVerifier` interface — a
  `@clerk/backend` implementation for production and an injectable fake for
  tests, so authorization is testable without live Clerk keys.
- **Validation**: shared Zod schemas from `@tempo/contracts` at the boundary.
- **Persistence**: repository interfaces with in-memory adapters (tests/dev) and
  a Prisma/Postgres schema as the durable data model. Production wiring
  **fails closed** if a durable store is not configured, so an in-memory store
  can never be a production path.
- **Logging**: Fastify's Pino logger with redaction of auth headers/cookies; no
  request/response bodies logged on sensitive routes.
- **Rate limiting**: `@fastify/rate-limit`; security headers via `@fastify/helmet`.

## Consequences

- HTTP-level auth/authorization/validation tests run via `fastify.inject()` with
  **no running server, no database, and no Clerk keys** — high-confidence
  security tests in CI.
- Lower toolchain surface than NestJS (no decorators/metadata/DI container, no
  swc-for-vitest), reducing build/test risk.
- The domain layer (token verifier, repositories, identity service, contracts)
  is framework-agnostic, so migrating the HTTP layer to NestJS later is
  mechanical if desired.
- Object-level authorization is structural: endpoints derive identity from the
  verified JWT and never accept a user id from the client, so there is no id to
  tamper with (defends OWASP API1/BOLA).

## Alternatives considered

- **NestJS** (the §5 default): richer DI/module structure, but heavier and
  requires extra tooling to test with the repo's Vitest setup. Deferred; can be
  adopted later without changing the domain layer.
- **Express**: minimal, but weaker first-class validation/logging/testing
  ergonomics than Fastify.
