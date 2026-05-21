'use client'

import { useEffect, useState } from 'react'
import { useExamStore } from '@/stores/examStore'
import { useExamMode } from '@/hooks/useExamMode'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Clock, AlertTriangle, Trophy, X, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { QuizQuestion } from '@/types'

interface ExamShellProps {
  examId: string
  questions: QuizQuestion[]
  timeLimitSec: number
}

export function ExamShell({ examId, questions, timeLimitSec }: ExamShellProps) {
  const router = useRouter()
  const {
    currentIndex,
    answers,
    timeLeft,
    status,
    tabBlurCount,
    startExam,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    setTimeLeft,
    setStatus,
    reset,
  } = useExamStore()

  const { requestFullscreen, submitExam } = useExamMode(examId)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    startExam(examId, questions, timeLimitSec)
    requestFullscreen()
    return () => reset()
  }, []) // eslint-disable-line

  useEffect(() => {
    if (status !== 'active') return
    const interval = setInterval(() => {
      setTimeLeft(timeLeft - 1)
      if (timeLeft <= 1) handleSubmit()
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft, status]) // eslint-disable-line

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    submitExam()

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: examId, answers, time_taken_sec: timeLimitSec - timeLeft }),
      })
      if (!res.ok) throw new Error()
      router.push(`/quiz/${examId}/results`)
    } catch {
      toast.error('Failed to submit. Please try again.')
      setStatus('active')
    } finally {
      setSubmitting(false)
    }
  }

  const currentQ = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const timePercent = (timeLeft / timeLimitSec) * 100
  const timeColor = timePercent > 20 ? 'text-foreground' : timePercent > 10 ? 'text-amber-500' : 'text-destructive'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Tab blur warning overlay */}
      {status === 'warning' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <Card className="p-8 max-w-md text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold">Tab Switch Detected!</h2>
            <p className="text-muted-foreground">
              You have switched tabs {tabBlurCount} time{tabBlurCount > 1 ? 's' : ''}.
              After 3 violations, your exam will be auto-submitted.
            </p>
            <Badge variant="destructive" className="text-sm">
              {3 - tabBlurCount} warning{3 - tabBlurCount !== 1 ? 's' : ''} remaining
            </Badge>
            <Button onClick={() => { setStatus('active'); requestFullscreen() }}>
              Resume Exam
            </Button>
          </Card>
        </div>
      )}

      {/* Exam header */}
      <header className="h-14 border-b border-border bg-card/80 flex items-center px-6 gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-sm">Exam Mode</span>
        </div>

        <Progress value={progress} className="flex-1 h-1.5" />

        <span className="text-xs text-muted-foreground">
          {currentIndex + 1}/{questions.length}
        </span>

        <div className={cn('flex items-center gap-1.5 text-sm font-mono font-medium', timeColor)}>
          <Clock className="w-4 h-4" />
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>

        {tabBlurCount > 0 && (
          <Badge variant="outline" className="text-xs gap-1">
            <X className="w-3 h-3 text-destructive" />
            {tabBlurCount}/3 violations
          </Badge>
        )}
      </header>

      {/* Question */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="capitalize">
                {currentQ?.question_type?.replace('_', ' ')}
              </Badge>
              <span className="text-xs text-muted-foreground ml-auto">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
            <h2 className="text-lg font-medium mb-6">{currentQ?.question_text}</h2>

            {currentQ?.question_type === 'mcq' && currentQ.options && (
              <div className="space-y-2">
                {currentQ.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => answerQuestion(currentQ.id, opt.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3.5 rounded-lg border text-left transition-colors',
                      answers[currentQ.id] === opt.id
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border hover:bg-muted/50 text-muted-foreground'
                    )}
                  >
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                      {opt.id}
                    </span>
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {currentQ?.question_type === 'true_false' && (
              <div className="grid grid-cols-2 gap-3">
                {['true', 'false'].map((v) => (
                  <button
                    key={v}
                    onClick={() => answerQuestion(currentQ.id, v)}
                    className={cn(
                      'p-4 rounded-lg border text-center font-medium capitalize transition-colors',
                      answers[currentQ.id] === v
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted/50'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}

            {currentQ?.question_type === 'short_answer' && (
              <textarea
                className="w-full min-h-[120px] p-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Type your answer..."
                value={answers[currentQ.id] ?? ''}
                onChange={(e) => answerQuestion(currentQ.id, e.target.value)}
              />
            )}
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={prevQuestion} disabled={currentIndex === 0} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            {currentIndex < questions.length - 1 ? (
              <Button onClick={nextQuestion} className="gap-2">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                <Send className="w-4 h-4" />
                Submit Exam
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
