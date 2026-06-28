/**
 * Pulls a human-readable message out of an Axios error. Spring's default
 * error body (and most custom @ExceptionHandler responses) is shaped like
 * { message: "...", error: "...", status: 400 } — this checks the common
 * field names backends use and falls back to a generic string only if none
 * of them are present, instead of always discarding the real reason.
 *
 * Single shared source — previously duplicated separately in UsersPage.tsx
 * and ManageAppraisalsPage.tsx; both should import this instead.
 */
export function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: unknown } }).response;
    const data = response?.data;
    if (data && typeof data === 'object') {
      const body = data as Record<string, unknown>;
      const candidate = body.message ?? body.error ?? body.detail;
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate;
      }
    }
    if (typeof data === 'string' && data.trim()) {
      return data;
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}