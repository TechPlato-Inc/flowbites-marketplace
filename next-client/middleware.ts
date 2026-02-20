import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = [
  '/dashboard',
  '/settings',
  '/service-orders',
];

const AUTH_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;

  // Check if the path is protected
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  // Check if the path is an auth page
  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL('/dashboard/buyer', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/service-orders/:path*',
    '/login',
    '/register',
  ],
};
