'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useQuizStore } from '@/stores/quizStore'
import { toast } from 'sonner'
import { Clock, ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuizQuestion } from '@/types'

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string

  const { questions, currentIndex, answers, timeLeft, status, setQuiz, answerQuestion, nextQuestion, prevQuestion, setTimeLeft, setStatus, reset } = useQuizStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/quiz/${quizId}`)
      .then((r) => r.json())
      .then((data) => {
        setQuiz(quizId, data.questions, data.time_limit_sec)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load quiz')
        router.push('/quiz')
      })

    return () => reset()
  }, [quizId]) // eslint-disable-line

  useEffect(() => {
    if (status !== 'active' || !timeLeft) return
    const interval = setInterval(() => {
      setTimeLeft(timeLeft - 1)
      if (timeLeft <= 1) handleSubmit()
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft, status]) // eslint-disable-line

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    setStatus('reviewing')

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: quizId,
          answers,
          time_taken_sec: questions[0] ? undefined : undefined,
        }),
      })
      if (!res.ok) throw new Error('Submit failed')
      router.push(`/quiz/${quizId}/results`)
    } catch {
      toast.error('Failed to submit quiz')
      setStatus('active')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const currentQ = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const answered = Object.keys(answers).length

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <Progress value={progress} className="h-1.5 w-48 mt-1" />
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{answered}/{questions.length} answered</Badge>
          {timeLeft > 0 && (
            <div className={cn('flex items-center gap-1.5 text-sm font-mono', timeLeft < 60 ? 'text-destructive' : 'text-muted-foreground')}>
              <Clock className="w-4 h-4" />
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>

      {/* Question */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="capitalize">{currentQ?.question_type?.replace('_', ' ')}</Badge>
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
            placeholder="Type your answer here..."
            value={answers[currentQ.id] ?? ''}
            onChange={(e) => answerQuestion(currentQ.id, e.target.value)}
          />
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentIndex < questions.length - 1 ? (
            <Button onClick={nextQuestion} className="gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
