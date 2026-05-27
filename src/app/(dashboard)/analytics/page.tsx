'use client'

import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Flame, Target, Clock, Trophy } from 'lucide-react'
import { PageMotion } from '@/components/shared/PageMotion'

interface AnalyticsData {
  streak: number
  dailyStudy: Array<{ date: string; minutes: number }>
  scoreTrend: Array<{ date: string; score: number; subject: string | null }>
  subjectPerformance: Array<{ subject: string; score: number }>
  weaknesses: Array<{ topic: string; error_count: number }>
  activityDates: string[]
}

const tooltipStyle = {
  background: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'var(--color-foreground)',
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await fetch('/api/analytics')
      if (!res.ok) throw new Error('Failed to load analytics')
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    )
  }

  const totalMinutes = data?.dailyStudy.reduce((s, d) => s + d.minutes, 0) ?? 0
  const avgScore = data?.scoreTrend.length
    ? Math.round(data.scoreTrend.reduce((s, q) => s + q.score, 0) / data.scoreTrend.length)
    : 0

  const stats = [
    { label: 'Study Streak', value: `${data?.streak ?? 0}d`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Monthly Study', value: `${Math.round(totalMinutes / 60)}h`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Avg Quiz Score', value: `${avgScore}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Quizzes Taken', value: `${data?.scoreTrend.length ?? 0}`, icon: Trophy, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ]

  const shortDate = (d: string) => {
    const date = new Date(d)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <PageMotion>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Your learning progress over the last 30 days</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <h2 className="font-semibold mb-4 text-sm">Daily Study Minutes</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.dailyStudy.slice(-14).map((d) => ({ ...d, date: shortDate(d.date) }))}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v) => [`${v}m`, 'Study time']}
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }}
                />
                <Bar dataKey="minutes" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold mb-4 text-sm">Quiz Score Trend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data?.scoreTrend.map((d) => ({ ...d, date: shortDate(d.date) }))}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Score']}
                  contentStyle={tooltipStyle}
                  cursor={{ stroke: 'var(--color-border)' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: 'var(--color-chart-2)', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {(data?.subjectPerformance.length ?? 0) > 0 && (
            <Card className="p-5">
              <h2 className="font-semibold mb-4 text-sm">Subject Performance</h2>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={data?.subjectPerformance}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    fill="var(--color-chart-4)"
                    fillOpacity={0.25}
                    stroke="var(--color-chart-4)"
                    strokeWidth={2}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {(data?.weaknesses.length ?? 0) > 0 && (
            <Card className="p-5">
              <h2 className="font-semibold mb-4 text-sm">Top Weaknesses</h2>
              <div className="space-y-3">
                {data?.weaknesses.map((w) => (
                  <div key={w.topic} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{w.topic}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-rose-500 to-orange-500"
                          style={{ width: `${Math.min(100, (w.error_count / 10) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{w.error_count}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageMotion>
  )
}
