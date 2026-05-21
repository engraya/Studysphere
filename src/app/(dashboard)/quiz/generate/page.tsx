'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Brain, Loader2 } from 'lucide-react'

function QuizGenerateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topicParam = searchParams.get('topic') ?? ''

  const [loading, setLoading] = useState(false)
  const [topic, setTopic] = useState(topicParam)
  const [difficulty, setDifficulty] = useState('medium')
  const [count, setCount] = useState(10)
  const [useMCQ, setUseMCQ] = useState(true)
  const [useTF, setUseTF] = useState(false)
  const [useSA, setUseSA] = useState(false)
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0)

  const handleGenerate = async () => {
    const types: string[] = []
    if (useMCQ) types.push('mcq')
    if (useTF) types.push('true_false')
    if (useSA) types.push('short_answer')
    if (types.length === 0) {
      toast.error('Select at least one question type.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_count: count,
          types,
          difficulty,
          topic: topic || undefined,
          time_limit_sec: timeLimitMinutes > 0 ? timeLimitMinutes * 60 : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate quiz')

      router.push(`/quiz/${data.quizId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generate Quiz</h1>
        <p className="text-muted-foreground">AI will create questions from your study materials.</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Label>Topic (optional)</Label>
          <Input
            placeholder="e.g. Photosynthesis, World War II, Calculus..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to generate from all your materials.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Number of Questions: {count}</Label>
          <Slider
            value={[count]}
            onValueChange={([v]) => setCount(v)}
            min={3}
            max={30}
            step={1}
          />
        </div>

        <div className="space-y-3">
          <Label>Question Types</Label>
          <div className="space-y-2">
            {[
              { label: 'Multiple Choice (MCQ)', value: useMCQ, set: setUseMCQ },
              { label: 'True / False', value: useTF, set: setUseTF },
              { label: 'Short Answer', value: useSA, set: setUseSA },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center justify-between">
                <Label className="font-normal">{label}</Label>
                <Switch checked={value} onCheckedChange={set} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Time Limit: {timeLimitMinutes > 0 ? `${timeLimitMinutes} min` : 'None'}</Label>
          <Slider
            value={[timeLimitMinutes]}
            onValueChange={([v]) => setTimeLimitMinutes(v)}
            min={0}
            max={60}
            step={5}
          />
        </div>

        <Button
          className="w-full gap-2"
          onClick={handleGenerate}
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating quiz…
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Generate Quiz
            </>
          )}
        </Button>
      </Card>
    </div>
  )
}

export default function QuizGeneratePage() {
  return (
    <Suspense fallback={<div className="max-w-xl space-y-6 animate-pulse"><div className="h-8 w-48 rounded bg-muted" /><div className="h-96 rounded-lg bg-muted" /></div>}>
      <QuizGenerateForm />
    </Suspense>
  )
}
