import { auth, clerkClient } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  study_goal: z.string().min(1),
  subjects: z.array(z.string()).min(1),
  timezone: z.string().default('UTC'),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const { study_goal, subjects, timezone } = parsed.data
  const supabase = createAdminClient()

  const client = await clerkClient()
  const clerkUser = await client.users.getUser(userId)
  const email = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress ?? ''
  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null

  const { error } = await supabase
    .from('users')
    .upsert(
      { clerk_id: userId, email, full_name: fullName, study_goal, subjects, timezone, onboarded: true },
      { onConflict: 'clerk_id' }
    )

  if (error) {
    console.error('[onboard] upsert error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: { onboarded: true },
  })

  return NextResponse.json({ success: true })
}
