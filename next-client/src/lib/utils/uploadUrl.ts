/**
 * Single source of truth for constructing upload URLs.
 * Used by both client-side and server-side API modules.
 */
export function getUploadUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // Handle "images/https://..." or "shots/https://..." from components that prepend a folder
  const stripped = path.replace(/^(images|shots|gallery)\//, "");
  if (stripped.startsWith("http")) return stripped;
  const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || "/uploads";
  return `${UPLOADS_URL}/${path}`;
}
