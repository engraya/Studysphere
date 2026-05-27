import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)'])

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/analytics(.*)',
  '/flashcards(.*)',
  '/quiz(.*)',
  '/workspace(.*)',
  '/onboarding(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Redirect signed-in users away from landing/auth pages to the dashboard
  if (userId && isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect unauthenticated users to sign-in when hitting protected routes
  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth()
    return redirectToSignIn()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
