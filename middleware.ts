import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/identify',
  '/login',
  '/signup',
  '/_next',
  '/favicon.ico',
  '/api',
  '/pilgrim/signin',
  '/pilgrim/otp',
  '/pilgrim/main'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check Supabase session (from cookies)
  const supabaseToken = request.cookies.get('sb-access-token') || request.cookies.get('supabase-auth-token');
  if (!supabaseToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/identify';
    return NextResponse.redirect(url);
  }

  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
}; 