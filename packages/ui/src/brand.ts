/**
 * Brand constants — the single source of truth for user-facing brand copy.
 *
 * Scope guard (feature/brand-tempobeast-foundation): only VISIBLE app copy reads
 * from here. Package names (`@tempo/*`), the Expo `slug`/`scheme`, backend
 * namespaces, and component identifiers (`TempoButton`, `createTempoApiClient`,
 * …) intentionally still say "tempo" and must NOT be renamed until the brand
 * name is formally confirmed. When it is, changing `brand.name` (and the single
 * literal in `app.json`) updates every visible surface.
 */
export const brand = {
  /** The user-facing product name shown in app copy. */
  name: 'TempoBeast',
} as const;

export type Brand = typeof brand;
