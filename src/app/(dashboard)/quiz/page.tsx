import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Brain, Trophy, Clock } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { PageMotion } from '@/components/shared/PageMotion'

export const metadata = { title: 'Quizzes' }

const difficultyStyle: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
  medium: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900',
  hard: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900',
}

function scoreStyle(score: number | null): string {
  if (score === null) return 'border-border text-muted-foreground'
  if (score >= 85) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200'
  if (score >= 70) return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200'
  if (score >= 50) return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200'
  return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200'
}

export default async function QuizListPage() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminClient()
  const { data: userRow } = await supabase.from('users').select('id').eq('clerk_id', userId).single()
  if (!userRow) return null

  const { data: quizzes } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', userRow.id)
    .order('created_at', { ascending: false })

  return (
    <PageMotion>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quizzes</h1>
            <p className="text-muted-foreground">Test your knowledge with AI-generated quizzes</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/quiz/generate">
              <Plus className="w-4 h-4" />
              Generate Quiz
            </Link>
          </Button>
        </div>

        {!quizzes || quizzes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No quizzes yet</h2>
            <p className="text-muted-foreground mb-4">Generate your first quiz from your study materials.</p>
            <Button asChild><Link href="/quiz/generate">Generate Quiz</Link></Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {quizzes.map((q) => (
              <Card key={q.id} className="p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{q.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeDate(q.created_at)}
                      </span>
                      <Badge className={cn('text-xs capitalize', difficultyStyle[q.difficulty] ?? 'border-border text-muted-foreground')}>
                        {q.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{q.total_questions} questions</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {q.completed_at ? (
                      <>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <Badge className={cn('text-xs font-semibold', scoreStyle(q.score))}>
                            {q.score !== null ? `${q.score}%` : 'N/A'}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/quiz/${q.id}/results`}>Review</Link>
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" asChild>
                        <Link href={`/quiz/${q.id}`}>Take Quiz</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageMotion>
  )
}
