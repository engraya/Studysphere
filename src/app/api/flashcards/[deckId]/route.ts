import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const { deckId } = await params
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const supabase = createAdminClient()
  const { data: userRow } = await supabase.from('users').select('id').eq('clerk_id', userId).single()
  if (!userRow) return new Response('User not found', { status: 404 })

  const today = new Date().toISOString().split('T')[0]

  const { data: cards } = await supabase
    .from('flashcards')
    .select('*')
    .eq('deck_id', deckId)
    .eq('user_id', userRow.id)
    .lte('next_review', today)
    .neq('status', 'mastered')
    .order('next_review', { ascending: true })

  return NextResponse.json(cards ?? [])
}
