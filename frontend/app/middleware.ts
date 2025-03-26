import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/signin', '/signup']

// All routes under these paths are protected
const protectedPaths = [
  '/dashboard',
  '/jobs',
  '/settings',
  '/candidates',
  '/logout',
]

export function middleware(request: NextRequest) {
  // Get the path
  const path = request.nextUrl.pathname
  
  // Check if the path is a public route (exact match or subpath)
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )
  
  // Check if the path is protected (exact match or subpath)
  const isProtectedRoute = protectedPaths.some(route => 
    path === route || path.startsWith(`${route}/`)
  )
  
  // Check for auth tokens
  const checkAuthentication = () => {
    // Collect all possible auth tokens
    const authToken = request.cookies.get('auth_token')?.value
    const lsAuthToken = request.cookies.get('ls_auth_token')?.value
    const nextAuthToken = request.cookies.get('next-auth.session-token')?.value
    
    // Consider authenticated if any token exists
    return Boolean(authToken || lsAuthToken || nextAuthToken)
  }
  
  const isAuthenticated = checkAuthentication()
  
  console.log(`Path: ${path}, Protected: ${isProtectedRoute}, Authenticated: ${isAuthenticated}`);
  
  // Special handling for the root path - if authenticated, redirect to dashboard
  if (path === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // For protected routes, check if user is authenticated
  if (isProtectedRoute && !isAuthenticated) {
    // Store the original URL to redirect back after login
    const signinUrl = new URL('/signin', request.url)
    signinUrl.searchParams.set('callbackUrl', encodeURIComponent(path))
    
    // Redirect to signin
    return NextResponse.redirect(signinUrl)
  }
  
  // Prevent authenticated users from accessing auth pages
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Allow all other requests
  return NextResponse.next()
}

// Configure the paths that should trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|images|favicon.ico|.*\\.png$).*)',
  ],
} 