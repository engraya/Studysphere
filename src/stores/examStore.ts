import { create } from 'zustand'
import type { QuizQuestion } from '@/types'

type ExamStatus = 'idle' | 'active' | 'warning' | 'ended'

interface ExamStore {
  examId: string | null
  questions: QuizQuestion[]
  currentIndex: number
  answers: Record<string, string>
  timeLeft: number
  isFullscreen: boolean
  tabBlurCount: number
  status: ExamStatus

  startExam: (examId: string, questions: QuizQuestion[], timeLimitSec: number) => void
  answerQuestion: (questionId: string, answer: string) => void
  nextQuestion: () => void
  prevQuestion: () => void
  setTimeLeft: (seconds: number) => void
  setIsFullscreen: (v: boolean) => void
  incrementBlurCount: () => void
  setStatus: (status: ExamStatus) => void
  reset: () => void
}

export const useExamStore = create<ExamStore>((set) => ({
  examId: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  timeLeft: 0,
  isFullscreen: false,
  tabBlurCount: 0,
  status: 'idle',

  startExam: (examId, questions, timeLimitSec) =>
    set({ examId, questions, currentIndex: 0, answers: {}, timeLeft: timeLimitSec, status: 'active', tabBlurCount: 0 }),

  answerQuestion: (questionId, answer) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),

  nextQuestion: () =>
    set((state) => ({ currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1) })),

  prevQuestion: () =>
    set((state) => ({ currentIndex: Math.max(state.currentIndex - 1, 0) })),

  setTimeLeft: (seconds) => set({ timeLeft: seconds }),
  setIsFullscreen: (v) => set({ isFullscreen: v }),
  incrementBlurCount: () => set((state) => ({ tabBlurCount: state.tabBlurCount + 1 })),
  setStatus: (status) => set({ status }),

  reset: () =>
    set({ examId: null, questions: [], currentIndex: 0, answers: {}, timeLeft: 0, isFullscreen: false, tabBlurCount: 0, status: 'idle' }),
}))
