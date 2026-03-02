import axios from "axios";

/**
 * Extract a user-friendly error message from an unknown catch value.
 * Handles Axios errors, standard Error objects, and unknown types.
 */
export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error || err.message || fallback;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}
