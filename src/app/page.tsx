import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Brain,
  BookOpen,
  MessageSquare,
  BarChart3,
  Upload,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react'
import { LandingThemeToggle } from '@/components/shared/LandingThemeToggle'
import { Logo } from '@/components/shared/Logo'

const features = [
  {
    icon: Upload,
    title: 'Smart Document Upload',
    description:
      'Upload PDFs, DOCX, or paste YouTube links. AI processes your content in seconds — ready to quiz and chat.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    gradientFrom: 'from-blue-500',
  },
  {
    icon: MessageSquare,
    title: 'AI Tutor Chat',
    description:
      'Ask anything about your materials. Get document-grounded answers with exact source citations.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    gradientFrom: 'from-violet-500',
  },
  {
    icon: Brain,
    title: 'Quiz Generator',
    description:
      'Generate MCQ, true/false, and short-answer quizzes at any difficulty with instant scoring and explanations.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    gradientFrom: 'from-orange-500',
  },
  {
    icon: BookOpen,
    title: 'Smart Flashcards',
    description:
      'AI creates flashcards from your notes. SM-2 spaced repetition schedules reviews for maximum long-term retention.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    gradientFrom: 'from-emerald-500',
  },
  {
    icon: BarChart3,
    title: 'Learning Analytics',
    description:
      'Track study hours, quiz scores, and streaks. AI detects your weak spots and surfaces what to study next.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    gradientFrom: 'from-rose-500',
  },
  {
    icon: Zap,
    title: 'Exam Simulation',
    description:
      'Full-screen proctored exam mode with strict timer, tab-switch detection, and mixed question types.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    gradientFrom: 'from-amber-500',
  },
]

const stats = [
  { value: '50k+', label: 'Active students' },
  { value: '2M+', label: 'Questions generated' },
  { value: '94%', label: 'Avg score improvement' },
  { value: '4.9★', label: 'User rating' },
]

const steps = [
  {
    step: '01',
    title: 'Upload your materials',
    description: 'Drop in a PDF, Word doc, or paste a YouTube link. StudySphere parses and embeds it instantly.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    step: '02',
    title: 'AI builds your study kit',
    description: 'Quizzes, flashcards, and a context-aware tutor are generated automatically from your content.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    step: '03',
    title: 'Study, test, and master',
    description: 'Practice with spaced repetition, get instant feedback, and track your growth with analytics.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
]

const testimonials = [
  {
    quote: "I went from 60% to 91% on my biochemistry exam in two weeks. The AI quiz generator is genuinely better than any flashcard app I've used.",
    name: 'Aisha Karim',
    role: 'Medical Student, UCL',
    initials: 'AK',
    color: 'bg-violet-500',
  },
  {
    quote: "Being able to chat with my lecture PDFs changed how I study. It's like having a tutor who actually read the same textbook.",
    name: 'Marcus Tran',
    role: 'CS Undergrad, Georgia Tech',
    initials: 'MT',
    color: 'bg-blue-500',
  },
  {
    quote: "The spaced repetition is spot-on. I review 20 cards in the morning and my retention has been night and day compared to passive re-reading.",
    name: 'Lena Hoffmann',
    role: 'Law Student, Humboldt University',
    initials: 'LH',
    color: 'bg-emerald-500',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <LandingThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Get started free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[500px] pointer-events-none">
          <div className="absolute left-1/4 top-0 w-96 h-72 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute right-1/4 top-20 w-72 h-56 rounded-full bg-violet-500/6 blur-3xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Powered by Google Gemini 2.0
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 bg-linear-to-br from-foreground via-foreground/90 to-primary bg-clip-text text-transparent leading-[1.1]">
              Study Smarter,<br />Not Harder
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Upload your study materials and let AI generate quizzes, flashcards, and a personal tutor
              that knows your exact content. Master anything in half the time.
            </p>
            <div className="flex items-center gap-3 flex-wrap mb-8">
              <Button size="lg" asChild className="gap-2">
                <Link href="/sign-up">
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
            <div className="flex items-center gap-5 text-sm text-muted-foreground flex-wrap">
              {['No credit card required', 'Free tier available', 'Cancel anytime'].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Product preview mockup */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden ring-1 ring-border/40">
              {/* Browser chrome */}
              <div className="h-9 bg-muted/40 border-b border-border flex items-center px-3 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                <div className="flex-1 mx-4">
                  <div className="h-4 bg-border/60 rounded-full w-40 mx-auto" />
                </div>
              </div>
              {/* App layout */}
              <div className="flex h-56">
                {/* Sidebar mock */}
                <div className="w-32 bg-sidebar border-r border-border p-2.5 flex flex-col gap-0.5 shrink-0">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-primary/10 mb-2">
                    <div className="w-3 h-3 rounded bg-primary/60" />
                    <div className="h-2 bg-primary/40 rounded w-12" />
                  </div>
                  {[
                    { w: 'w-14', color: 'bg-blue-400/40' },
                    { w: 'w-12', color: 'bg-violet-400/40' },
                    { w: 'w-16', color: 'bg-orange-400/40' },
                    { w: 'w-14', color: 'bg-emerald-400/40' },
                    { w: 'w-12', color: 'bg-rose-400/40' },
                  ].map(({ w, color }, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2 py-1.5 rounded-md">
                      <div className={`w-3 h-3 rounded ${color}`} />
                      <div className={`h-2 bg-muted-foreground/20 rounded ${w}`} />
                    </div>
                  ))}
                </div>
                {/* Main content mock */}
                <div className="flex-1 p-3 space-y-2 overflow-hidden">
                  <div className="h-5 bg-foreground/10 rounded w-36 mb-3" />
                  {/* Stat cards */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: 'bg-orange-400/20', val: 'bg-orange-400/40' },
                      { label: 'bg-blue-400/20', val: 'bg-blue-400/40' },
                      { label: 'bg-emerald-400/20', val: 'bg-emerald-400/40' },
                      { label: 'bg-violet-400/20', val: 'bg-violet-400/40' },
                    ].map(({ label, val }, i) => (
                      <div key={i} className="rounded-lg border border-border bg-card p-1.5">
                        <div className={`w-4 h-4 rounded ${label} mb-1`} />
                        <div className={`h-3 rounded w-8 ${val} mb-0.5`} />
                        <div className="h-1.5 bg-muted-foreground/15 rounded w-10" />
                      </div>
                    ))}
                  </div>
                  {/* Content rows */}
                  <div className="rounded-lg border border-border bg-card p-2 space-y-1.5">
                    <div className="h-2.5 bg-foreground/10 rounded w-24" />
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2 py-0.5">
                        <div className="w-5 h-5 rounded bg-blue-400/20 shrink-0" />
                        <div className="flex-1 h-2 bg-muted-foreground/15 rounded" />
                        <div className="w-10 h-2 bg-emerald-400/30 rounded" />
                      </div>
                    ))}
                  </div>
                  {/* Quick actions grid mock */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      'bg-blue-400/20',
                      'bg-orange-400/20',
                      'bg-emerald-400/20',
                      'bg-violet-400/20',
                    ].map((c, i) => (
                      <div key={i} className={`rounded-lg ${c} h-8`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border/50 bg-muted/20 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-medium tracking-widest uppercase mb-4">
            Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Everything you need to excel
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A complete AI-powered study toolkit — no more juggling five different apps.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description, color, bg, gradientFrom }) => (
            <Card
              key={title}
              className="p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border-border/60 bg-card relative overflow-hidden group"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-px bg-linear-to-r ${gradientFrom} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-base mb-2 tracking-tight">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/20 border-y border-border/50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-medium tracking-widest uppercase mb-4">
              How it works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              From upload to mastery in minutes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-px bg-linear-to-r from-transparent via-border to-transparent" />
            {steps.map(({ step, title, description, color, bg, border }) => (
              <div key={step} className="relative text-center md:text-left">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${bg} border ${border} mb-5`}>
                  <span className={`text-lg font-bold ${color}`}>{step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2 tracking-tight">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-medium tracking-widest uppercase mb-4">
            Student reviews
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Real results, real students
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, role, initials, color }) => (
            <Card key={name} className="p-6 border-border/60 bg-card flex flex-col gap-4">
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground/80 flex-1">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">{name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border">
        <div className="absolute inset-0 bg-linear-to-br from-primary/8 via-background to-violet-500/6 pointer-events-none" />
        <div className="absolute left-1/4 -top-20 w-72 h-72 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Free to start — no card required
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Ready to study like a top student?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            Join 50,000+ students who use AI to study smarter — not just harder.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" asChild className="gap-2 px-8">
              <Link href="/sign-up">
                Get started for free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign in to your account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold tracking-tight">StudySphere</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                AI-powered learning that adapts to your materials, your pace, and your goals.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Product</p>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Changelog', 'Roadmap'].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Company</p>
              <ul className="space-y-2">
                {['About', 'Blog', 'Privacy', 'Terms'].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} StudySphere. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with ♥ for learners everywhere
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
