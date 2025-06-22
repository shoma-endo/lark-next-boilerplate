import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('lark_token')?.value;
  const pathname = req.nextUrl.pathname;

  const isApiRoute = pathname.startsWith('/api/');
  const isLoginPage = pathname.startsWith('/login');
  const isPublicAsset = pathname.startsWith('/_next') || pathname === '/favicon.ico';

  const isAuthenticated = !!token && token.trim() !== '';

  if (!isAuthenticated && !isLoginPage && !isApiRoute && !isPublicAsset) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname); // 任意：元のページに戻す用
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/((?!_next|favicon.ico).*)'],
};
