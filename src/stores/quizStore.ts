import { create } from 'zustand'
import type { QuizQuestion } from '@/types'

type QuizStatus = 'idle' | 'active' | 'reviewing' | 'completed'

interface QuizStore {
  quizId: string | null
  questions: QuizQuestion[]
  currentIndex: number
  answers: Record<string, string>
  timeLeft: number
  status: QuizStatus
  startTime: number | null

  setQuiz: (quizId: string, questions: QuizQuestion[], timeLimitSec?: number) => void
  answerQuestion: (questionId: string, answer: string) => void
  nextQuestion: () => void
  prevQuestion: () => void
  setTimeLeft: (seconds: number) => void
  setStatus: (status: QuizStatus) => void
  reset: () => void
}

export const useQuizStore = create<QuizStore>((set) => ({
  quizId: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  timeLeft: 0,
  status: 'idle',
  startTime: null,

  setQuiz: (quizId, questions, timeLimitSec) =>
    set({
      quizId,
      questions,
      currentIndex: 0,
      answers: {},
      timeLeft: timeLimitSec ?? 0,
      status: 'active',
      startTime: Date.now(),
    }),

  answerQuestion: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),

  nextQuestion: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
    })),

  prevQuestion: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    })),

  setTimeLeft: (seconds) => set({ timeLeft: seconds }),
  setStatus: (status) => set({ status }),

  reset: () =>
    set({
      quizId: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      timeLeft: 0,
      status: 'idle',
      startTime: null,
    }),
}))
