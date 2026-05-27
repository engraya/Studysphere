'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Zap, BookOpen, Target, Clock, ArrowRight, ArrowLeft, X, Plus } from 'lucide-react'

const STUDY_GOALS = [
  { id: 'exam_prep', label: 'Exam Preparation', icon: '🎯' },
  { id: 'skill_building', label: 'Skill Building', icon: '🚀' },
  { id: 'coursework', label: 'University/School Coursework', icon: '🎓' },
  { id: 'professional', label: 'Professional Development', icon: '💼' },
  { id: 'curiosity', label: 'Personal Curiosity', icon: '🔍' },
]

const POPULAR_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History',
  'Computer Science', 'Economics', 'Psychology', 'Literature', 'Philosophy',
]

const STEPS = ['Welcome', 'Study Goal', 'Subjects', 'Schedule']

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [studyGoal, setStudyGoal] = useState('')
  const [subjects, setSubjects] = useState<string[]>([])
  const [subjectInput, setSubjectInput] = useState('')
  const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  const addSubject = (subject: string) => {
    if (subject && !subjects.includes(subject)) {
      setSubjects((prev) => [...prev, subject])
    }
    setSubjectInput('')
  }

  const removeSubject = (subject: string) => {
    setSubjects((prev) => prev.filter((s) => s !== subject))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSubject(subjectInput.trim())
    }
  }

  const canProceed = () => {
    if (step === 1) return !!studyGoal
    if (step === 2) return subjects.length > 0
    return true
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ study_goal: studyGoal, subjects, timezone }),
      })
      if (!res.ok) throw new Error('Failed to save')
      await user?.reload()
      router.push('/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <Card className="w-full p-8 relative">
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">StudySphere</span>
          </div>
          <Progress value={(step / (STEPS.length - 1)) * 100} className="h-1 mb-3" />
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  i < step ? 'bg-primary w-6' : i === step ? 'bg-primary w-4' : 'bg-muted w-2'
                )}
              />
            ))}
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="text-4xl">👋</div>
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome, {user?.firstName ?? 'there'}!
            </h2>
            <p className="text-muted-foreground">
              Let&apos;s personalize StudySphere for you. This takes less than a minute.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: BookOpen, label: 'AI-powered quizzes', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                { icon: Target, label: 'Smart flashcards', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { icon: Clock, label: 'Spaced repetition', color: 'text-blue-500', bg: 'bg-blue-500/10' },
              ].map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className={`text-center p-4 rounded-xl ${bg}`}>
                  <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
                  <p className="text-xs font-medium text-foreground/80 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">What&apos;s your main study goal?</h2>
            <p className="text-muted-foreground text-sm">
              This helps us tailor your experience and AI recommendations.
            </p>
            <div className="space-y-2 mt-4">
              {STUDY_GOALS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setStudyGoal(id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all',
                    studyGoal === id
                      ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/30'
                      : 'border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">What subjects do you study?</h2>
            <p className="text-muted-foreground text-sm">
              Add your subjects so AI can give better recommendations.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Add a subject..."
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => addSubject(subjectInput.trim())}
                disabled={!subjectInput.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 pr-1">
                    {s}
                    <button onClick={() => removeSubject(s)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Popular subjects:</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SUBJECTS.filter((s) => !subjects.includes(s)).map((s) => (
                  <button
                    key={s}
                    onClick={() => addSubject(s)}
                    className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-4xl">🎉</div>
            <h2 className="text-2xl font-bold tracking-tight">You&apos;re all set!</h2>
            <p className="text-muted-foreground">
              Here&apos;s what we&apos;ve set up for you:
            </p>
            <div className="space-y-2 bg-muted/30 rounded-xl p-4 border border-border/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Study goal</span>
                <span className="font-medium capitalize">
                  {STUDY_GOALS.find((g) => g.id === studyGoal)?.label}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subjects</span>
                <span className="font-medium">{subjects.join(', ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Timezone</span>
                <span className="font-medium">{timezone}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload your first study material to get started with AI-powered learning!
            </p>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={loading} className="gap-2">
              {loading ? 'Setting up...' : 'Go to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
