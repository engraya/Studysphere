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

  const { error } = await supabase
    .from('users')
    .update({ study_goal, subjects, timezone, onboarded: true })
    .eq('clerk_id', userId)

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const client = await clerkClient()
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { onboarded: true },
  })

  return NextResponse.json({ success: true })
}
