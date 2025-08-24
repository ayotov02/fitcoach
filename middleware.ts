import { type NextRequest } from 'next/server';
import { createMiddlewareSupabaseClient } from '@/lib/auth/supabase';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareSupabaseClient(request);

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/coach', '/client', '/profile', '/settings'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Authentication pages
  const authPaths = ['/auth/login', '/auth/signup'];
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    // Redirect to login if accessing protected route without authentication
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return Response.redirect(redirectUrl);
  }

  if (isAuthPath && user) {
    // Redirect authenticated users away from auth pages
    return Response.redirect(new URL('/dashboard', request.url));
  }

  // Role-based route protection
  if (user && isProtectedPath) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = userData?.role;

    // Coach-specific routes
    if (request.nextUrl.pathname.startsWith('/coach') && userRole !== 'coach') {
      return Response.redirect(new URL('/auth/unauthorized', request.url));
    }

    // Client-specific routes
    if (request.nextUrl.pathname.startsWith('/client') && userRole !== 'client') {
      return Response.redirect(new URL('/auth/unauthorized', request.url));
    }

    // Redirect to role-specific dashboard if accessing generic dashboard
    if (request.nextUrl.pathname === '/dashboard') {
      if (userRole === 'coach') {
        return Response.redirect(new URL('/coach/dashboard', request.url));
      }
      if (userRole === 'client') {
        return Response.redirect(new URL('/client/dashboard', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};