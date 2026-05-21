import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  quiz_id: z.string().uuid(),
  answers: z.record(z.string(), z.string()),
  time_taken_sec: z.number().optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { quiz_id, answers, time_taken_sec } = parsed.data
  const supabase = createAdminClient()

  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userRow) return new Response('User not found', { status: 404 })

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_session_id', quiz_id)

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
  }

  const wrongTopics: string[] = []
  let correctCount = 0

  const updates = questions.map((q) => {
    const userAnswer = answers[q.id] ?? ''
    const isCorrect =
      q.question_type === 'short_answer'
        ? userAnswer.toLowerCase().trim().includes(q.correct_answer.toLowerCase().trim())
        : userAnswer.toLowerCase() === q.correct_answer.toLowerCase()

    if (isCorrect) {
      correctCount++
    } else if (q.explanation) {
      wrongTopics.push(q.explanation.slice(0, 80))
    }

    return supabase
      .from('quiz_questions')
      .update({ user_answer: userAnswer, is_correct: isCorrect })
      .eq('id', q.id)
  })

  await Promise.all(updates)

  const score = Math.round((correctCount / questions.length) * 100)

  await supabase
    .from('quiz_sessions')
    .update({
      score,
      time_taken_sec: time_taken_sec ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq('id', quiz_id)

  for (const topic of wrongTopics.slice(0, 10)) {
    const { data: existing } = await supabase
      .from('weakness_records')
      .select('id, error_count')
      .eq('user_id', userRow.id)
      .eq('topic', topic)
      .single()

    if (existing) {
      await supabase
        .from('weakness_records')
        .update({ error_count: existing.error_count + 1, last_seen: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('weakness_records')
        .insert({ user_id: userRow.id, topic, error_count: 1 })
    }
  }

  await supabase.from('study_activity').insert({
    user_id: userRow.id,
    activity_type: 'quiz',
    score,
    duration_min: time_taken_sec ? Math.ceil(time_taken_sec / 60) : 0,
    metadata: { quiz_id },
  })

  return NextResponse.json({ score, correctCount, totalQuestions: questions.length })
}
