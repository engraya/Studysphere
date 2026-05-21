import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { geminiProJSON } from '@/lib/ai/gemini'
import { retrieveContext } from '@/lib/ai/rag'
import { buildFlashcardPrompt } from '@/lib/ai/prompts'
import { z } from 'zod'

export const maxDuration = 60

const schema = z.object({
  session_id: z.string().uuid().nullable().optional(),
  topic: z.string().optional(),
  title: z.string().optional(),
  count: z.number().min(5).max(50).default(15),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { session_id, topic, title, count } = parsed.data
  const supabase = createAdminClient()

  const { data: userRow } = await supabase.from('users').select('id').eq('clerk_id', userId).single()
  if (!userRow) return new Response('User not found', { status: 404 })

  const context = await retrieveContext(
    topic ?? 'key concepts and definitions',
    userRow.id,
    session_id ?? null,
    10,
    0.4
  )

  if (!context.contextText) {
    return NextResponse.json({ error: 'No study materials found.' }, { status: 422 })
  }

  const prompt = buildFlashcardPrompt(context.contextText, count)
  const result = await geminiProJSON.generateContent(prompt)
  const raw = result.response.text()

  let cards: Array<{ front: string; back: string }>
  try {
    const parsed = JSON.parse(raw)
    cards = z
      .array(z.object({ front: z.string(), back: z.string() }))
      .parse(parsed.cards)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  const deckTitle = title ?? `${topic ? `${topic} — ` : ''}Flashcards`

  const { data: deck, error: deckError } = await supabase
    .from('flashcard_decks')
    .insert({
      user_id: userRow.id,
      session_id: session_id ?? null,
      title: deckTitle,
      subject: topic ?? null,
      card_count: cards.length,
    })
    .select('id')
    .single()

  if (deckError || !deck) {
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 })
  }

  const cardRows = cards.map((c) => ({
    deck_id: deck.id,
    user_id: userRow.id,
    front: c.front,
    back: c.back,
  }))

  await supabase.from('flashcards').insert(cardRows)

  return NextResponse.json({ deckId: deck.id, cardCount: cards.length })
}
