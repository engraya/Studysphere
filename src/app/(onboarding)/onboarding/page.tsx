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
    <Card className="w-full max-w-lg p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">StudySphere</span>
        </div>
        <Progress value={(step / (STEPS.length - 1)) * 100} className="h-1.5 mb-4" />
        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`text-xs ${i <= step ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            >
              {s}{i < STEPS.length - 1 && ' ·'}
            </span>
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div className="text-4xl">👋</div>
          <h2 className="text-2xl font-bold">
            Welcome, {user?.firstName ?? 'there'}!
          </h2>
          <p className="text-muted-foreground">
            Let&apos;s personalize StudySphere for you. This takes less than a minute.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: BookOpen, label: 'AI-powered quizzes' },
              { icon: Target, label: 'Smart flashcards' },
              { icon: Clock, label: 'Spaced repetition' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="text-center p-3 rounded-lg bg-muted/50">
                <Icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">What&apos;s your main study goal?</h2>
          <p className="text-muted-foreground text-sm">
            This helps us tailor your experience and AI recommendations.
          </p>
          <div className="space-y-2 mt-4">
            {STUDY_GOALS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setStudyGoal(id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-lg border text-left transition-colors ${
                  studyGoal === id
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border hover:bg-muted/50 text-muted-foreground'
                }`}
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
          <h2 className="text-2xl font-bold">What subjects do you study?</h2>
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
                  className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted/50 text-muted-foreground transition-colors"
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
          <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
          <p className="text-muted-foreground">
            Here&apos;s what we&apos;ve set up for you:
          </p>
          <div className="space-y-2 bg-muted/30 rounded-lg p-4">
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
  )
}
