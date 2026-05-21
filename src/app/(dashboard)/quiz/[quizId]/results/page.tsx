import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, XCircle, Trophy, ArrowRight, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Quiz Results' }

export default async function QuizResultsPage({
  params,
}: {
  params: Promise<{ quizId: string }>
}) {
  const { quizId } = await params
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminClient()
  const { data: userRow } = await supabase.from('users').select('id').eq('clerk_id', userId).single()
  if (!userRow) return null

  const { data: quiz } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', quizId)
    .eq('user_id', userRow.id)
    .single()

  if (!quiz) notFound()

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_session_id', quizId)
    .order('question_index')

  const score = quiz.score ?? 0
  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-destructive'

  return (
    <div className="max-w-2xl space-y-6">
      {/* Score summary */}
      <Card className="p-8 text-center">
        <Trophy className={cn('w-12 h-12 mx-auto mb-3', scoreColor)} />
        <h1 className="text-3xl font-bold mb-1">{score}%</h1>
        <p className="text-muted-foreground mb-4">
          {questions?.filter((q) => q.is_correct).length ?? 0} / {quiz.total_questions} correct
          {quiz.time_taken_sec
            ? ` · ${Math.floor(quiz.time_taken_sec / 60)}m ${quiz.time_taken_sec % 60}s`
            : ''}
        </p>
        <Badge
          variant={score >= 70 ? 'secondary' : 'destructive'}
          className="text-sm"
        >
          {score >= 80 ? 'Excellent!' : score >= 70 ? 'Good job!' : score >= 50 ? 'Keep practicing' : 'Needs improvement'}
        </Badge>
      </Card>

      {/* Per-question breakdown */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Question Review</h2>
        {questions?.map((q, i) => (
          <Card key={q.id} className={cn('p-4', q.is_correct ? 'border-emerald-500/30' : 'border-destructive/30')}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {q.is_correct ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="font-medium text-sm">
                  {i + 1}. {q.question_text}
                </p>
                <div className="text-xs space-y-1">
                  {q.user_answer && (
                    <p className={q.is_correct ? 'text-emerald-600' : 'text-destructive'}>
                      Your answer: {q.user_answer}
                    </p>
                  )}
                  {!q.is_correct && (
                    <p className="text-emerald-600">
                      Correct answer: {q.correct_answer}
                    </p>
                  )}
                  {q.explanation && (
                    <p className="text-muted-foreground bg-muted/50 p-2 rounded mt-1">
                      {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" asChild className="gap-2">
          <Link href="/quiz/generate">
            <RotateCcw className="w-4 h-4" />
            New Quiz
          </Link>
        </Button>
        <Button asChild className="gap-2">
          <Link href="/dashboard">
            Back to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
