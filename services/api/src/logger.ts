import type { FastifyServerOptions } from 'fastify';

/**
 * Pino logger options with redaction. We never log Authorization headers,
 * cookies, or token-bearing fields, and Fastify does not log request/response
 * bodies by default — so health/profile/consent payloads stay out of logs
 * (CLAUDE.md §17).
 */
export const loggerOptions: FastifyServerOptions['logger'] = {
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'req.headers["x-api-key"]',
    ],
    remove: true,
  },
  // Only essential request metadata — no bodies, no query strings with PII.
  serializers: {
    req(request: { method: string; url: string }) {
      return { method: request.method, url: request.url };
    },
  },
};
