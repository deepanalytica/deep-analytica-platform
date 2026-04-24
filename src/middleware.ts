import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Zero-Trust Security Middleware
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect Admin CRM Routes
  if (path.startsWith('/admin')) {
    // TODO: Verify JWT token and check if role === 'ADMIN'
    // const token = request.cookies.get('auth-token');
    // if (!isValidAdmin(token)) return NextResponse.redirect(new URL('/login', request.url));
    console.log(`[Middleware Security] Accessing protected route: ${path}`);
  }

  // Protect LMS Courses Routes
  if (path.startsWith('/cursos')) {
    // TODO: Verify JWT token and check if role === 'STUDENT' or 'ADMIN'
    // const token = request.cookies.get('auth-token');
    // if (!isValidStudent(token)) return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add Security Headers
  const response = NextResponse.next();
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  return response;
}

// Specify exactly which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
