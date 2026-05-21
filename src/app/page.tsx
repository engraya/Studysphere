import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Zap,
  Brain,
  BookOpen,
  MessageSquare,
  BarChart3,
  Upload,
  ArrowRight,
  CheckCircle2,
  Star,
} from 'lucide-react'

const features = [
  {
    icon: Upload,
    title: 'Smart Document Upload',
    description:
      'Upload PDFs, DOCX, text files, or paste YouTube links. AI instantly processes and understands your content.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: MessageSquare,
    title: 'AI Tutor Chat',
    description:
      'Ask questions about your uploaded materials. The AI remembers context and gives document-grounded answers.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Brain,
    title: 'Quiz Generator',
    description:
      'Generate MCQ, true/false, and short-answer quizzes at any difficulty. Get instant scoring and explanations.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: BookOpen,
    title: 'Smart Flashcards',
    description:
      'AI creates flashcards from your notes. Spaced repetition (SM-2) schedules reviews for maximum retention.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: BarChart3,
    title: 'Learning Analytics',
    description:
      'Track study hours, quiz performance, and streak data. AI identifies your weaknesses and recommends focus areas.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Zap,
    title: 'Exam Simulation',
    description:
      'Full-screen exam mode with strict timer, tab detection, and mixed question types across your materials.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">StudySphere</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get started free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <Badge variant="secondary" className="mb-6">
          <Star className="w-3 h-3 mr-1" />
          Powered by Google Gemini AI
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
          Study Smarter,
          <br />
          Not Harder
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Upload your study materials and let AI create quizzes, flashcards, and a personalized
          tutor that knows your exact content. Master anything faster.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button size="lg" asChild className="gap-2">
            <Link href="/sign-up">
              Start studying for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          {['No credit card required', 'Free tier available', 'Cancel anytime'].map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything you need to excel</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A complete AI-powered study toolkit in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <Card
              key={title}
              className="p-6 hover:shadow-lg transition-shadow border-border/50 bg-card/50 backdrop-blur-sm"
            >
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform how you study?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of students using AI to study more effectively.
          </p>
          <Button size="lg" asChild className="gap-2">
            <Link href="/sign-up">
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} StudySphere. Built with AI for learners.
      </footer>
    </div>
  )
}
