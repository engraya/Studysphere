import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  BookOpen,
  Brain,
  MessageSquare,
  Upload,
  Flame,
  TrendingUp,
  ArrowRight,
  Clock,
  Target,
} from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

export const metadata = { title: 'Dashboard' }

async function getDashboardData(userId: string) {
  const supabase = await createClient()

  const { data: userRow } = await supabase
    .from('users')
    .select('id, streak_count, subjects, study_goal, full_name')
    .eq('clerk_id', userId)
    .single()

  if (!userRow) return null

  const [docsRes, quizzesRes, decksRes, activityRes, weaknessRes] = await Promise.all([
    supabase
      .from('documents')
      .select('id, file_name, file_type, embed_status, created_at')
      .eq('user_id', userRow.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('quiz_sessions')
      .select('id, title, score, total_questions, completed_at, created_at')
      .eq('user_id', userRow.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(5),
    supabase
      .from('flashcard_decks')
      .select('id, title, card_count')
      .eq('user_id', userRow.id)
      .limit(3),
    supabase
      .from('study_activity')
      .select('duration_min, created_at')
      .eq('user_id', userRow.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('weakness_records')
      .select('topic, error_count')
      .eq('user_id', userRow.id)
      .eq('resolved', false)
      .order('error_count', { ascending: false })
      .limit(3),
  ])

  const weeklyMinutes = (activityRes.data ?? []).reduce((sum, a) => sum + (a.duration_min ?? 0), 0)
  const avgScore =
    quizzesRes.data && quizzesRes.data.length > 0
      ? Math.round(quizzesRes.data.reduce((s, q) => s + (q.score ?? 0), 0) / quizzesRes.data.length)
      : null

  return {
    user: userRow,
    recentDocs: docsRes.data ?? [],
    recentQuizzes: quizzesRes.data ?? [],
    decks: decksRes.data ?? [],
    weeklyMinutes,
    avgScore,
    weaknesses: weaknessRes.data ?? [],
  }
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) return null

  const data = await getDashboardData(userId)
  if (!data) return null

  const { user, recentDocs, recentQuizzes, weeklyMinutes, avgScore, weaknesses } = data

  const dueTodayCount = 0 // placeholder until flashcard query added

  const stats = [
    { label: 'Study Streak', value: `${user.streak_count}d`, icon: Flame, color: 'text-orange-500' },
    { label: 'Weekly Study', value: `${weeklyMinutes}m`, icon: Clock, color: 'text-blue-500' },
    { label: 'Avg Quiz Score', value: avgScore !== null ? `${avgScore}%` : '—', icon: Target, color: 'text-emerald-500' },
    { label: 'Documents', value: recentDocs.length.toString(), icon: Upload, color: 'text-violet-500' },
  ]

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">
          Good {getTimeOfDay()}, {user.full_name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your study overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="p-5 lg:col-span-1">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Quick Actions
          </h2>
          <div className="space-y-2">
            <Button className="w-full justify-start gap-2" asChild>
              <Link href="/workspace/new">
                <Upload className="w-4 h-4" />
                Upload Study Material
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/quiz/generate">
                <Brain className="w-4 h-4" />
                Generate Quiz
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/flashcards/daily">
                <BookOpen className="w-4 h-4" />
                Daily Review
                {dueTodayCount > 0 && (
                  <Badge className="ml-auto">{dueTodayCount}</Badge>
                )}
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/chat">
                <MessageSquare className="w-4 h-4" />
                Chat with AI Tutor
              </Link>
            </Button>
          </div>
        </Card>

        {/* Recent Documents */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Materials</h2>
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link href="/workspace">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>
          {recentDocs.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No materials yet.</p>
              <Button size="sm" className="mt-3" asChild>
                <Link href="/workspace/new">Upload your first file</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary uppercase">
                      {doc.file_type.slice(0, 3)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeDate(doc.created_at)}</p>
                  </div>
                  <Badge
                    variant={doc.embed_status === 'done' ? 'secondary' : 'outline'}
                    className="text-xs shrink-0"
                  >
                    {doc.embed_status === 'done' ? 'Ready' : doc.embed_status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Quizzes + Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Recent Quizzes
            </h2>
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link href="/quiz">View all <ArrowRight className="w-3 h-3" /></Link>
            </Button>
          </div>
          {recentQuizzes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No quizzes yet.</p>
          ) : (
            <div className="space-y-2">
              {recentQuizzes.map((q) => (
                <div key={q.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{q.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.completed_at ? formatRelativeDate(q.completed_at) : ''}
                    </p>
                  </div>
                  <Badge
                    variant={q.score !== null && q.score >= 70 ? 'secondary' : 'outline'}
                    className="shrink-0"
                  >
                    {q.score !== null ? `${q.score}%` : 'N/A'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-rose-500" />
            Areas to Improve
          </h2>
          {weaknesses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No weaknesses detected yet. Keep studying!
            </p>
          ) : (
            <div className="space-y-2">
              {weaknesses.map((w) => (
                <div key={w.topic} className="flex items-center justify-between p-2.5 rounded-lg">
                  <p className="text-sm font-medium">{w.topic}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{w.error_count} errors</span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/quiz/generate?topic=${encodeURIComponent(w.topic)}`}>
                        Practice
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function getTimeOfDay(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
