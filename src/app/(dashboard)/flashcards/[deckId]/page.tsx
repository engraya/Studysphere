import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Brain, RotateCcw } from 'lucide-react'

interface PageProps {
  params: Promise<{ deckId: string }>
}

const statusColor: Record<string, string> = {
  new: 'bg-muted text-muted-foreground',
  learning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  mastered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

export default async function DeckPage({ params }: PageProps) {
  const { deckId } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createAdminClient()
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userRow) redirect('/dashboard')

  const { data: deck } = await supabase
    .from('flashcard_decks')
    .select('*')
    .eq('id', deckId)
    .eq('user_id', userRow.id)
    .single()

  if (!deck) redirect('/flashcards')

  const { data: cards } = await supabase
    .from('flashcards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true })

  const today = new Date().toISOString().split('T')[0]
  const dueCount = (cards ?? []).filter(
    (c) => c.next_review <= today && c.status !== 'mastered'
  ).length

  const stats = (cards ?? []).reduce<Record<string, number>>(
    (acc, c) => { acc[c.status] = (acc[c.status] ?? 0) + 1; return acc },
    {}
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/flashcards">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Flashcards
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{deck.title}</h1>
          {deck.subject && <p className="text-muted-foreground">{deck.subject}</p>}
        </div>
        <div className="flex gap-2">
          {dueCount > 0 && (
            <Button variant="outline" asChild className="gap-2">
              <Link href={`/flashcards/${deckId}/review`}>
                <RotateCcw className="w-4 h-4" />
                Review ({dueCount})
              </Link>
            </Button>
          )}
          <Button asChild className="gap-2">
            <Link href={`/flashcards/${deckId}/review`}>
              <Brain className="w-4 h-4" />
              Study All
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['new', 'learning', 'review', 'mastered'] as const).map((s) => (
          <Card key={s} className="p-4 text-center">
            <p className="text-2xl font-bold">{stats[s] ?? 0}</p>
            <p className="text-xs text-muted-foreground capitalize mt-1">{s}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        {!cards || cards.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No cards in this deck yet.</p>
          </Card>
        ) : (
          cards.map((card) => (
            <Card key={card.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{card.front}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{card.back}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${statusColor[card.status]}`}>
                  {card.status}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
