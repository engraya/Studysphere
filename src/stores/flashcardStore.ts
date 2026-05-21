import { create } from 'zustand'
import type { Flashcard } from '@/types'

interface FlashcardStore {
  cards: Flashcard[]
  currentIndex: number
  isFlipped: boolean
  sessionResults: Array<{ cardId: string; quality: number }>

  setCards: (cards: Flashcard[]) => void
  nextCard: () => void
  flipCard: () => void
  resetFlip: () => void
  recordResult: (cardId: string, quality: number) => void
  reset: () => void
}

export const useFlashcardStore = create<FlashcardStore>((set) => ({
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  sessionResults: [],

  setCards: (cards) => set({ cards, currentIndex: 0, isFlipped: false, sessionResults: [] }),

  nextCard: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.cards.length - 1),
      isFlipped: false,
    })),

  flipCard: () => set((state) => ({ isFlipped: !state.isFlipped })),
  resetFlip: () => set({ isFlipped: false }),

  recordResult: (cardId, quality) =>
    set((state) => ({
      sessionResults: [...state.sessionResults, { cardId, quality }],
    })),

  reset: () => set({ cards: [], currentIndex: 0, isFlipped: false, sessionResults: [] }),
}))
