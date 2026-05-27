import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, BookOpen, Clock } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { PageMotion } from '@/components/shared/PageMotion'

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
    <PageMotion>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Flashcards</h1>
            <p className="text-muted-foreground">Spaced repetition for lasting memory</p>
          </div>
          <div className="flex gap-2">
            {totalDue > 0 && (
              <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white" asChild>
                <Link href="/flashcards/daily">
                  <Clock className="w-4 h-4" />
                  Daily Review
                  <span className="ml-1 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {totalDue}
                  </span>
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
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No flashcard decks yet</h2>
            <p className="text-muted-foreground mb-4">Generate flashcards from your study materials.</p>
            <Button asChild className="gap-2">
              <Link href="/quiz/generate?mode=flashcard">
                <Plus className="w-4 h-4" />
                Generate your first deck
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => {
              const due = dueByDeck[deck.id] ?? 0
              const masteredPct = deck.card_count > 0
                ? Math.max(0, Math.min(100, ((deck.card_count - due) / deck.card_count) * 100))
                : 100
              return (
                <Card key={deck.id} className="p-5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{deck.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeDate(deck.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{deck.card_count} cards</span>
                      <span className={due > 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-emerald-600 dark:text-emerald-400 font-medium'}>
                        {due > 0 ? `${due} due` : 'All caught up'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${masteredPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {due > 0 ? (
                      <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900 text-xs">
                        {due} due
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 text-xs">
                        Up to date
                      </Badge>
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
    </PageMotion>
  )
}
