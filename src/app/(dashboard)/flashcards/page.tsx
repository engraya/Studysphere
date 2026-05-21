import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, BookOpen, Clock } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

export const metadata = { title: 'Flashcards' }

export default async function FlashcardsPage() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminClient()
  const { data: userRow } = await supabase.from('users').select('id').eq('clerk_id', userId).single()
  if (!userRow) return null

  const { data: decks } = await supabase
    .from('flashcard_decks')
    .select('*')
    .eq('user_id', userRow.id)
    .order('created_at', { ascending: false })

  const today = new Date().toISOString().split('T')[0]
  const { data: dueCards } = await supabase
    .from('flashcards')
    .select('id, deck_id')
    .eq('user_id', userRow.id)
    .lte('next_review', today)
    .neq('status', 'mastered')

  const dueByDeck = (dueCards ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.deck_id] = (acc[c.deck_id] ?? 0) + 1
    return acc
  }, {})

  const totalDue = dueCards?.length ?? 0

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <p className="text-muted-foreground">Spaced repetition for lasting memory</p>
        </div>
        <div className="flex gap-2">
          {totalDue > 0 && (
            <Button variant="outline" asChild className="gap-2">
              <Link href="/flashcards/daily">
                <Clock className="w-4 h-4" />
                Daily Review
                <Badge className="ml-1">{totalDue}</Badge>
              </Link>
            </Button>
          )}
          <Button asChild className="gap-2">
            <Link href="/quiz/generate?mode=flashcard">
              <Plus className="w-4 h-4" />
              Generate Deck
            </Link>
          </Button>
        </div>
      </div>

      {!decks || decks.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No flashcard decks yet</h2>
          <p className="text-muted-foreground mb-4">Generate flashcards from your study materials.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => {
            const due = dueByDeck[deck.id] ?? 0
            return (
              <Card key={deck.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{deck.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {deck.card_count} cards · {formatRelativeDate(deck.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {due > 0 ? (
                    <Badge variant="secondary">{due} due</Badge>
                  ) : (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">Up to date</Badge>
                  )}
                  <Button size="sm" asChild>
                    <Link href={`/flashcards/${deck.id}/review`}>Study</Link>
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
