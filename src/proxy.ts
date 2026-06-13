import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // HSTS — only on production (https)
  if (request.headers.get('x-forwarded-proto') === 'https') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  // Remove server fingerprint headers
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');

  // Rate limit signal for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Policy', '100;w=60');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
