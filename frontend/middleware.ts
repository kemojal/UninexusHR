import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const { pathname, search } = request.nextUrl;

  // Special handling for join page with token
  if (pathname.startsWith("/join") && search.includes("token=")) {
    return NextResponse.next();
  }

  // List of paths that don't require authentication
  const publicPaths = ["/login", "/register", "/join"];

  // Allow access to public paths without a token
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    // If user is already logged in, redirect to dashboard
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Check if user is logged in for protected routes
  if (!token && !pathname.startsWith("/join")) {
    // Redirect to login page if no token is found
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which paths should be handled by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
