/** Key under Clerk user `unsafeMetadata` that flags completed onboarding. The
 * backend profile's `onboardingCompletedAt` is the durable record; this flag is
 * what the route gate reads so it works before a profile fetch resolves. */
export const ONBOARDING_METADATA_KEY = 'onboardingComplete';

/** Pure check over arbitrary Clerk metadata — safe against unknown shapes. */
export function isOnboardingComplete(metadata: unknown): boolean {
  return Boolean(
    metadata &&
    typeof metadata === 'object' &&
    ONBOARDING_METADATA_KEY in metadata &&
    (metadata as Record<string, unknown>)[ONBOARDING_METADATA_KEY] === true,
  );
}
