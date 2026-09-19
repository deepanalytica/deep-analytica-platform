import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MINING_V2_COOKIE, verifyMiningSessionToken } from './lib/mining-v2/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith('/mining-v2') && !path.startsWith('/mining-v2/access')) {
    const secret = process.env.DMI_SESSION_SECRET;
    const token = request.cookies.get(MINING_V2_COOKIE)?.value;
    const valid = secret ? await verifyMiningSessionToken(token, secret) : false;

    if (!valid) {
      const access = new URL('/mining-v2/access', request.url);
      access.searchParams.set('next', path);
      return NextResponse.redirect(access);
    }
  }

  if (path.startsWith('/admin')) {
    console.log(`[Middleware Security] Accessing protected route: ${path}`);
  }

  const response = NextResponse.next();
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
