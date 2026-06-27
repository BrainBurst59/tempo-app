/** Extracts a user-safe message from a Clerk error without leaking internals.
 * Clerk throws `{ errors: [{ message, longMessage }] }`. */
export function clerkErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error && typeof error === 'object' && 'errors' in error) {
    const errors = (error as { errors: unknown }).errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const first: unknown = errors[0];
      if (first && typeof first === 'object' && 'message' in first) {
        const message = (first as { message: unknown }).message;
        if (typeof message === 'string' && message.length > 0) return message;
      }
    }
  }
  return fallback;
}
