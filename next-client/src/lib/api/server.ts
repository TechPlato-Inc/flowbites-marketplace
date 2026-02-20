import { cookies } from 'next/headers';

const API_BASE = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface FetchOptions {
  revalidate?: number | false;
  tags?: string[];
  cache?: RequestCache;
}

export async function serverFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { revalidate, tags, cache } = options;

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    headers,
  };

  if (cache) {
    fetchOptions.cache = cache;
  } else if (revalidate !== undefined) {
    fetchOptions.next = { revalidate };
    if (tags) fetchOptions.next.tags = tags;
  } else if (tags) {
    fetchOptions.next = { tags };
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data ?? json;
}

export async function serverPost<T = unknown>(
  endpoint: string,
  body: unknown
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data ?? json;
}

export function getUploadUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // Handle "images/https://..." or "shots/https://..." from components that prepend a folder
  const stripped = path.replace(/^(images|shots|gallery)\//, '');
  if (stripped.startsWith('http')) return stripped;
  const UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:5001/uploads';
  return `${UPLOADS_URL}/${path}`;
}
