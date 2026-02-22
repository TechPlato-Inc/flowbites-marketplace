import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/settings", "/service-orders"];

const AUTH_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // Legacy admin routes → redirect to production dashboard
  if (
    pathname.startsWith("/admin/dashboard") ||
    pathname.startsWith("/admin/settings")
  ) {
    if (!accessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", "/dashboard/admin");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL("/dashboard/admin", request.url));
  }

  // Legacy admin login → redirect to main login
  if (pathname === "/admin/login") {
    if (accessToken) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check if the path is a regular protected route
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  // Check if the path is an auth page
  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // When user visits auth pages, clear any stale auth cookies and let the page render.
  // This fixes the httpOnly accessToken cookie that JS can't clear.
  // If a user is truly logged in and visits /login, they'll be able to re-authenticate.
  if (isAuthPage && accessToken) {
    const response = NextResponse.next();
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    response.cookies.delete("userRole");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/service-orders/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
