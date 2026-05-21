'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FlashcardCardProps {
  front: string
  back: string
  isFlipped: boolean
  onFlip: () => void
}

export function FlashcardCard({ front, back, isFlipped, onFlip }: FlashcardCardProps) {
  return (
    <div
      className="relative w-full h-64 cursor-pointer perspective-1000"
      style={{ perspective: '1000px' }}
      onClick={onFlip}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {/* Front */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl border bg-card text-center',
            'backface-hidden'
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Question
          </p>
          <p className="text-lg font-medium">{front}</p>
          <p className="text-xs text-muted-foreground mt-6">Click to reveal answer</p>
        </div>

        {/* Back */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center p-8 rounded-2xl border bg-primary/5 text-center',
          )}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-xs font-medium text-primary mb-4 uppercase tracking-wider">Answer</p>
          <p className="text-sm leading-relaxed">{back}</p>
        </div>
      </motion.div>
    </div>
  )
}
