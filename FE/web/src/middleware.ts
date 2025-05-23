import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  const isAuthenticated = !!accessToken?.value;
  const accessPermission = request.cookies.get('accessPermission'); // 새로 추가한 접근 권한 쿠키
  const isPermissionPage = request.nextUrl.pathname === '/permission';
  const isLoginPage = request.nextUrl.pathname === '/login';
  const currentPath = request.nextUrl.pathname;
  // 응답 생성
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  // 0. splashImage.jpeg 요청은 무조건 허용 (다른 조건 무시)
  if (pathname === '/splashImage.jpeg') {
    return NextResponse.next();
  }
  // 1. 접근 권한이 없는 경우: /permission 페이지로 강제 이동 (단, 이미 /permission이면 통과)
  if (!accessPermission && currentPath !== '/permission') {
    return NextResponse.redirect(new URL('/permission', request.url));
  }
  // 2. 접근 권한이 있는데도 /permission 페이지에 머물러 있으면 로그인 페이지로 보냄.
  if (accessPermission && isPermissionPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // 3. 로그인 상태가 아닌 사용자가 보호된 페이지 (즉, /login, /callback, /permission이 아닌 페이지)에 접속하면 /login으로 이동.
  if (
    !isAuthenticated &&
    currentPath !== '/login' &&
    currentPath !== '/callback' &&
    currentPath !== '/permission'
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // 4. 이미 로그인된 상태에서 /login 페이지에 접근하면 메인 페이지로 이동.
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api/|_next/|favicon.ico).*)'],
};
