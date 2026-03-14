import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Only trigger on production (Vercel)
  const isMaintenanceMode = process.env.NODE_ENV === 'production';

  if (isMaintenanceMode) {
    // This points to YOUR domain's /index.html file
    return NextResponse.rewrite(new URL('/index.html', req.nextUrl.origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}