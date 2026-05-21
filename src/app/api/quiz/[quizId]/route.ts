import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const supabase = createAdminClient()
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userRow) return new Response('User not found', { status: 404 })

  const { data: quiz } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', quizId)
    .eq('user_id', userRow.id)
    .single()

  if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_session_id', quizId)
    .order('question_index')

  return NextResponse.json({ ...quiz, questions: questions ?? [] })
}
