import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const supabase = createAdminClient()
  const { data: userRow } = await supabase.from('users').select('id, streak_count').eq('clerk_id', userId).single()
  if (!userRow) return new Response('User not found', { status: 404 })

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [activityRes, quizzesRes, weaknessRes] = await Promise.all([
    supabase
      .from('study_activity')
      .select('activity_type, duration_min, score, created_at')
      .eq('user_id', userRow.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true }),
    supabase
      .from('quiz_sessions')
      .select('score, subject, difficulty, completed_at')
      .eq('user_id', userRow.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: true })
      .limit(20),
    supabase
      .from('weakness_records')
      .select('topic, subject, error_count')
      .eq('user_id', userRow.id)
      .eq('resolved', false)
      .order('error_count', { ascending: false })
      .limit(5),
  ])

  const dailyStudy = buildDailyStudy(activityRes.data ?? [])
  const scoreTrend = (quizzesRes.data ?? [])
    .filter((q) => q.score !== null)
    .map((q) => ({
      date: q.completed_at!.split('T')[0],
      score: q.score!,
      subject: q.subject,
    }))

  const subjectPerformance = buildSubjectPerformance(quizzesRes.data ?? [])
  const activityDates = buildActivityDates(activityRes.data ?? [])

  return NextResponse.json({
    streak: userRow.streak_count,
    dailyStudy,
    scoreTrend,
    subjectPerformance,
    weaknesses: weaknessRes.data ?? [],
    activityDates,
  })
}

function buildDailyStudy(activities: Array<{ duration_min: number; created_at: string }>) {
  const map: Record<string, number> = {}
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    map[d.toISOString().split('T')[0]] = 0
  }

  for (const a of activities) {
    const date = a.created_at.split('T')[0]
    if (map[date] !== undefined) map[date] += a.duration_min ?? 0
  }

  return Object.entries(map).map(([date, minutes]) => ({ date, minutes }))
}

function buildSubjectPerformance(quizzes: Array<{ score: number | null; subject: string | null }>) {
  const subjectMap: Record<string, { total: number; count: number }> = {}
  for (const q of quizzes) {
    if (q.score === null || !q.subject) continue
    if (!subjectMap[q.subject]) subjectMap[q.subject] = { total: 0, count: 0 }
    subjectMap[q.subject].total += q.score
    subjectMap[q.subject].count++
  }
  return Object.entries(subjectMap).map(([subject, { total, count }]) => ({
    subject,
    score: Math.round(total / count),
  }))
}

function buildActivityDates(activities: Array<{ created_at: string }>) {
  const dates = new Set(activities.map((a) => a.created_at.split('T')[0]))
  return [...dates]
}
