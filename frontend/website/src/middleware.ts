import { NextResponse } from 'next/server'

export function middleware() {
  // If you are running 'npm run dev', this will be 'development'
  // If it's live on Vercel, it will be 'production'
  const isMaintenanceMode = process.env.NODE_ENV === 'production';

  if (isMaintenanceMode) {
    return NextResponse.rewrite(new URL('/index.html', 'https://example.com'))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}