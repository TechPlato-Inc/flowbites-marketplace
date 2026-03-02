/**
 * Runtime validation for client-side environment variables.
 * Import this module early (e.g. in layout.tsx) to catch misconfig at startup.
 */

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(
      `Missing environment variable: ${key}. Add it to your .env.local file.`,
    );
  }
  return value;
}

export const env = {
  NEXT_PUBLIC_API_URL: requireEnv(
    "NEXT_PUBLIC_API_URL",
    "http://localhost:5001/api",
  ),
  NEXT_PUBLIC_UPLOADS_URL: requireEnv("NEXT_PUBLIC_UPLOADS_URL", "/uploads"),
} as const;
