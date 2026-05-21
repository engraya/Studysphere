import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'StudySphere — AI-Powered Learning',
    template: '%s | StudySphere',
  },
  description:
    'StudySphere is your AI-powered study companion. Upload documents, generate quizzes, create flashcards, and chat with an AI tutor — all in one place.',
  keywords: ['study', 'AI', 'learning', 'quiz', 'flashcards', 'education'],
  openGraph: {
    title: 'StudySphere — AI-Powered Learning',
    description: 'Your AI-powered study companion',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen bg-background antialiased">
          <ThemeProvider>
            <QueryProvider>
              {children}
              <Toaster richColors position="top-right" />
              <Analytics />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
