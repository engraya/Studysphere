import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { ExamShell } from '@/components/exam/ExamShell'
import type { QuizQuestion } from '@/types'

interface PageProps {
  params: Promise<{ examId: string }>
}

export default async function ExamPage({ params }: PageProps) {
  const { examId } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createAdminClient()
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userRow) redirect('/dashboard')

  const { data: quiz } = await supabase
    .from('quiz_sessions')
    .select('id, title, time_limit_sec, total_questions')
    .eq('id', examId)
    .eq('user_id', userRow.id)
    .is('completed_at', null)
    .single()

  if (!quiz) redirect('/dashboard')

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_session_id', examId)
    .order('question_index', { ascending: true })

  if (!questions?.length) redirect('/dashboard')

  return (
    <ExamShell
      examId={examId}
      questions={questions as QuizQuestion[]}
      timeLimitSec={quiz.time_limit_sec ?? 3600}
    />
  )
}
