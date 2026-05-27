import { Logo } from '@/components/shared/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex mb-2">
            <Logo size="lg" />
          </div>
          <p className="text-muted-foreground text-sm">Your AI-powered study companion</p>
        </div>
        {children}
      </div>
    </main>
  )
}
