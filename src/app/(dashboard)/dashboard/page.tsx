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
  TrendingDown,
  ArrowRight,
  Clock,
  Target,
} from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { PageMotion } from '@/components/shared/PageMotion'

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

const fileTypeBadgeStyle: Record<string, string> = {
  pdf: 'bg-red-500/10 text-red-600 dark:text-red-400',
  docx: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  txt: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  youtube: 'bg-red-500/10 text-red-600 dark:text-red-400',
  note: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) return null

  const data = await getDashboardData(userId)
  if (!data) return null

  const { user, recentDocs, recentQuizzes, weeklyMinutes, avgScore, weaknesses } = data

  const dueTodayCount = 0

  const stats = [
    {
      label: 'Study Streak',
      value: `${user.streak_count}d`,
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      trend: user.streak_count > 0 ? 'up' : null,
    },
    {
      label: 'Weekly Study',
      value: weeklyMinutes >= 60
        ? `${Math.floor(weeklyMinutes / 60)}h ${weeklyMinutes % 60}m`
        : `${weeklyMinutes}m`,
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: weeklyMinutes > 120 ? 'up' : weeklyMinutes > 0 ? null : 'down',
    },
    {
      label: 'Avg Quiz Score',
      value: avgScore !== null ? `${avgScore}%` : '—',
      icon: Target,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      trend: avgScore !== null ? (avgScore >= 70 ? 'up' : 'down') : null,
    },
    {
      label: 'Materials',
      value: recentDocs.length.toString(),
      icon: Upload,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      trend: null,
    },
  ]

  return (
    <PageMotion>
      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good {getTimeOfDay()},{' '}
            <span className="text-primary">{user.full_name?.split(' ')[0] ?? 'there'}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your study overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg, trend }) => (
            <Card key={label} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
              </div>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="p-5 lg:col-span-1">
            <h2 className="font-semibold mb-4 text-sm">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/workspace/new', icon: Upload, label: 'Upload', color: 'text-blue-500', bg: 'bg-blue-500/8' },
                { href: '/quiz/generate', icon: Brain, label: 'Generate Quiz', color: 'text-orange-500', bg: 'bg-orange-500/8' },
                { href: '/flashcards/daily', icon: BookOpen, label: 'Daily Review', color: 'text-emerald-500', bg: 'bg-emerald-500/8', badge: dueTodayCount },
                { href: '/chat', icon: MessageSquare, label: 'AI Tutor', color: 'text-violet-500', bg: 'bg-violet-500/8' },
              ].map(({ href, icon: Icon, label, color, bg, badge }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl ${bg} hover:opacity-80 transition-opacity relative`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-xs font-medium text-center leading-tight">{label}</span>
                  {badge && badge > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </Card>

          {/* Recent Documents */}
          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Recent Materials</h2>
              <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                <Link href="/workspace">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
            {recentDocs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm font-medium mb-1">No materials yet</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Upload a PDF, DOCX, or paste a YouTube URL to get started.
                </p>
                <Button size="sm" asChild>
                  <Link href="/workspace/new">Upload your first file</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {recentDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <span
                        className={`text-[10px] font-bold uppercase px-1 rounded ${fileTypeBadgeStyle[doc.file_type] ?? 'text-muted-foreground'}`}
                      >
                        {doc.file_type.slice(0, 3)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeDate(doc.created_at)}</p>
                    </div>
                    <Badge
                      className={`text-xs shrink-0 ${
                        doc.embed_status === 'done'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                          : doc.embed_status === 'processing'
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200'
                          : 'border-border text-muted-foreground'
                      }`}
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
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-orange-500" />
                Recent Quizzes
              </h2>
              <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                <Link href="/quiz">View all <ArrowRight className="w-3 h-3" /></Link>
              </Button>
            </div>
            {recentQuizzes.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-2">
                  <Brain className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-sm text-muted-foreground">No quizzes yet.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentQuizzes.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{q.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {q.completed_at ? formatRelativeDate(q.completed_at) : ''}
                      </p>
                    </div>
                    <Badge
                      className={`shrink-0 text-xs font-semibold ${
                        q.score === null
                          ? 'border-border text-muted-foreground'
                          : q.score >= 85
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : q.score >= 70
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                          : q.score >= 50
                          ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {q.score !== null ? `${q.score}%` : 'N/A'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-sm flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-rose-500" />
              Areas to Improve
            </h2>
            {weaknesses.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No weaknesses detected yet. Keep studying!
                </p>
              </div>
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
    </PageMotion>
  )
}

function getTimeOfDay(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
