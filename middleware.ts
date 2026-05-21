import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/api/webhooks/clerk',
])

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()

  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  if (userId) {
    const { sessionClaims } = await auth()
    const isOnboarded = (sessionClaims?.metadata as { onboarded?: boolean } | undefined)
      ?.onboarded

    if (!isOnboarded && !isOnboardingRoute(req) && !isPublicRoute(req)) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    if (isOnboarded && isOnboardingRoute(req)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
