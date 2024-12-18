import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of paths that don't require authentication
const publicPaths = ['/login', '/register']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const { pathname } = request.nextUrl

  // Allow access to public paths without a token
  if (publicPaths.includes(pathname)) {
    // If user is already logged in, redirect to dashboard
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Check if user is logged in for protected routes
  if (!token) {
    // Redirect to login page if no token is found
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configure which paths should be handled by the middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
