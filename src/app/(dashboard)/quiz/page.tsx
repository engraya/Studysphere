import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Brain, Trophy, Clock } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

export const metadata = { title: 'Quizzes' }

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
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
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
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No quizzes yet</h2>
          <p className="text-muted-foreground mb-4">Generate your first quiz from your study materials.</p>
          <Button asChild><Link href="/quiz/generate">Generate Quiz</Link></Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => (
            <Card key={q.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{q.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeDate(q.created_at)}
                    </span>
                    <Badge variant="outline" className="text-xs capitalize">{q.difficulty}</Badge>
                    <span className="text-xs text-muted-foreground">{q.total_questions} questions</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {q.completed_at ? (
                    <>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        {q.score}%
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
  )
}
