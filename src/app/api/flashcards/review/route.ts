import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { computeSM2 } from '@/lib/algorithms/sm2'
import { z } from 'zod'
import type { SM2Quality } from '@/types'

const schema = z.object({
  card_id: z.string().uuid(),
  quality: z.union([z.literal(0), z.literal(1), z.literal(3), z.literal(5)]),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { card_id, quality } = parsed.data
  const supabase = createAdminClient()

  const { data: card } = await supabase
    .from('flashcards')
    .select('*')
    .eq('id', card_id)
    .single()

  if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 })

  const result = computeSM2(
    {
      easinessFactor: card.easiness_factor,
      intervalDays: card.interval_days,
      repetitions: card.repetitions,
      nextReview: new Date(card.next_review),
    },
    quality as SM2Quality
  )

  await supabase
    .from('flashcards')
    .update({
      easiness_factor: result.easinessFactor,
      interval_days: result.intervalDays,
      repetitions: result.repetitions,
      next_review: result.nextReview.toISOString().split('T')[0],
      last_reviewed: new Date().toISOString(),
      status: result.status,
    })
    .eq('id', card_id)

  return NextResponse.json({ nextReview: result.nextReview, status: result.status })
}
