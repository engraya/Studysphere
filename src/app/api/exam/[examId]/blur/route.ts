import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  const { examId } = await params
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { count } = await req.json()

  const supabase = createAdminClient()
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userRow) return new Response('User not found', { status: 404 })

  await supabase
    .from('exam_sessions')
    .update({ tab_blur_count: count })
    .eq('id', examId)
    .eq('user_id', userRow.id)

  return NextResponse.json({ ok: true })
}
