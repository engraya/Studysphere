import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { CheckCircle2, BookOpen } from 'lucide-react'

export const metadata = { title: 'Daily Review' }

export default async function DailyReviewPage() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminClient()
  const { data: userRow } = await supabase.from('users').select('id').eq('clerk_id', userId).single()
  if (!userRow) return null

  const today = new Date().toISOString().split('T')[0]

  const { data: dueCards } = await supabase
    .from('flashcards')
    .select('deck_id, flashcard_decks(id, title)')
    .eq('user_id', userRow.id)
    .lte('next_review', today)
    .neq('status', 'mastered')

  const byDeck = (dueCards ?? []).reduce<Record<string, { title: string; count: number }>>((acc, c) => {
    const deckRaw = c.flashcard_decks
    const deck = Array.isArray(deckRaw) ? (deckRaw[0] as { id: string; title: string } | undefined) : (deckRaw as { id: string; title: string } | null)
    if (!deck) return acc
    if (!acc[deck.id]) acc[deck.id] = { title: deck.title, count: 0 }
    acc[deck.id].count++
    return acc
  }, {})

  const deckEntries = Object.entries(byDeck)
  const totalDue = dueCards?.length ?? 0

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Daily Review</h1>
        <p className="text-muted-foreground">
          {totalDue > 0
            ? `${totalDue} cards due for review today`
            : 'All caught up for today!'}
        </p>
      </div>

      {totalDue === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">All done for today!</h2>
          <p className="text-muted-foreground">Check back tomorrow for more reviews.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {deckEntries.map(([deckId, { title, count }]) => (
            <Card key={deckId} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{title}</p>
                  <Badge variant="secondary">{count} due</Badge>
                </div>
              </div>
              <Button asChild>
                <Link href={`/flashcards/${deckId}/review`}>Review</Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
