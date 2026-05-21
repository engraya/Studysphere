import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { geminiProJSON } from '@/lib/ai/gemini'
import { retrieveContext } from '@/lib/ai/rag'
import { buildQuizPrompt } from '@/lib/ai/prompts'
import { z } from 'zod'

export const maxDuration = 60

const schema = z.object({
  session_id: z.string().uuid().nullable().optional(),
  question_count: z.number().min(3).max(30).default(10),
  types: z.array(z.enum(['mcq', 'true_false', 'short_answer'])).default(['mcq']),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  topic: z.string().optional(),
  title: z.string().optional(),
  time_limit_sec: z.number().optional(),
})

const questionSchema = z.object({
  type: z.enum(['mcq', 'true_false', 'short_answer']),
  question_text: z.string(),
  options: z.array(z.object({ id: z.string(), text: z.string() })).nullable().optional(),
  correct_answer: z.string(),
  explanation: z.string().optional(),
  topic: z.string().optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { session_id, question_count, types, difficulty, topic, title, time_limit_sec } = parsed.data

  const supabase = createAdminClient()
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userRow) return new Response('User not found', { status: 404 })

  const context = await retrieveContext(
    topic ?? `Generate a ${difficulty} quiz`,
    userRow.id,
    session_id ?? null,
    8,
    0.4
  )

  if (!context.contextText) {
    return NextResponse.json(
      { error: 'No study materials found. Please upload documents first.' },
      { status: 422 }
    )
  }

  const prompt = buildQuizPrompt(context.contextText, {
    questionCount: question_count,
    types,
    difficulty,
    topic,
  })

  const result = await geminiProJSON.generateContent(prompt)
  const raw = result.response.text()

  let questions: z.infer<typeof questionSchema>[]
  try {
    const parsed = JSON.parse(raw)
    questions = z.array(questionSchema).parse(parsed.questions)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  const quizTitle = title ?? `${topic ? `${topic} — ` : ''}${difficulty} Quiz`

  const { data: quiz, error: quizError } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: userRow.id,
      session_id: session_id ?? null,
      title: quizTitle,
      subject: topic ?? null,
      difficulty,
      question_types: types,
      total_questions: questions.length,
      time_limit_sec: time_limit_sec ?? null,
    })
    .select('id')
    .single()

  if (quizError || !quiz) {
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 })
  }

  const questionRows = questions.map((q, i) => ({
    quiz_session_id: quiz.id,
    question_index: i,
    question_type: q.type,
    question_text: q.question_text,
    options: q.options ?? null,
    correct_answer: q.correct_answer,
    explanation: q.explanation ?? null,
  }))

  await supabase.from('quiz_questions').insert(questionRows)

  return NextResponse.json({ quizId: quiz.id })
}
