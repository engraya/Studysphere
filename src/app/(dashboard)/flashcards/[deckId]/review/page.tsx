'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FlashcardCard } from '@/components/flashcards/FlashcardCard'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { useFlashcardStore } from '@/stores/flashcardStore'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, RotateCcw } from 'lucide-react'
import type { Flashcard } from '@/types'

const QUALITY_BUTTONS = [
  { quality: 0, label: 'Again', color: 'bg-destructive hover:bg-destructive/90 text-white' },
  { quality: 1, label: 'Hard', color: 'bg-orange-500 hover:bg-orange-600 text-white' },
  { quality: 3, label: 'Good', color: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
  { quality: 5, label: 'Easy', color: 'bg-blue-500 hover:bg-blue-600 text-white' },
] as const

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const deckId = params.deckId as string

  const { cards, currentIndex, isFlipped, setCards, nextCard, flipCard, recordResult } = useFlashcardStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch(`/api/flashcards/${deckId}`)
      .then((r) => r.json())
      .then((data: Flashcard[]) => {
        setCards(data)
        setLoading(false)
        if (data.length === 0) setDone(true)
      })
      .catch(() => {
        toast.error('Failed to load cards')
        router.push('/flashcards')
      })
  }, [deckId]) // eslint-disable-line

  const handleRate = async (quality: 0 | 1 | 3 | 5) => {
    const card = cards[currentIndex]
    if (!card || submitting) return

    setSubmitting(true)
    recordResult(card.id, quality)

    try {
      await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: card.id, quality }),
      })
    } catch {
      toast.error('Failed to save review')
    } finally {
      setSubmitting(false)
    }

    if (currentIndex >= cards.length - 1) {
      setDone(true)
    } else {
      nextCard()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 mt-20">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
        <h2 className="text-2xl font-bold">Session complete!</h2>
        <p className="text-muted-foreground">You reviewed {cards.length} cards. Great work!</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => { setDone(false); setCards([...cards]); }} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Review again
          </Button>
          <Button onClick={() => router.push('/flashcards')}>Back to decks</Button>
        </div>
      </div>
    )
  }

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex) / cards.length) * 100

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} / {cards.length}
        </p>
        <Progress value={progress} className="w-48 h-1.5" />
      </div>

      <FlashcardCard
        front={currentCard.front}
        back={currentCard.back}
        isFlipped={isFlipped}
        onFlip={flipCard}
      />

      {isFlipped && (
        <Card className="p-4">
          <p className="text-xs text-muted-foreground text-center mb-3">How well did you know this?</p>
          <div className="grid grid-cols-4 gap-2">
            {QUALITY_BUTTONS.map(({ quality, label, color }) => (
              <button
                key={quality}
                onClick={() => handleRate(quality)}
                disabled={submitting}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-opacity ${color} ${submitting ? 'opacity-50' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>
      )}

      {!isFlipped && (
        <p className="text-center text-sm text-muted-foreground">
          Click the card to reveal the answer
        </p>
      )}
    </div>
  )
}
