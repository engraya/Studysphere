import type { SM2Quality } from '@/types'

export interface SM2Card {
  easinessFactor: number
  intervalDays: number
  repetitions: number
  nextReview: Date
}

export interface SM2Result {
  easinessFactor: number
  intervalDays: number
  repetitions: number
  nextReview: Date
  status: 'new' | 'learning' | 'review' | 'mastered'
}

export function computeSM2(card: SM2Card, quality: SM2Quality): SM2Result {
  let { easinessFactor, intervalDays, repetitions } = card

  if (quality < 3) {
    repetitions = 0
    intervalDays = 1
  } else {
    if (repetitions === 0) {
      intervalDays = 1
    } else if (repetitions === 1) {
      intervalDays = 6
    } else {
      intervalDays = Math.round(intervalDays * easinessFactor)
    }
    repetitions += 1
  }

  easinessFactor = Math.max(
    1.3,
    easinessFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  )

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + intervalDays)

  const status: SM2Result['status'] =
    repetitions === 0
      ? 'new'
      : repetitions <= 2
        ? 'learning'
        : intervalDays >= 21
          ? 'mastered'
          : 'review'

  return { easinessFactor, intervalDays, repetitions, nextReview, status }
}
