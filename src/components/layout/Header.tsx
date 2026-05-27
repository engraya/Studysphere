'use client'

import { UserButton } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, Moon, Sun, Bell } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { motion } from 'framer-motion'

const pageTitle: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/workspace': 'Workspace',
  '/chat': 'AI Tutor',
  '/quiz': 'Quizzes',
  '/flashcards': 'Flashcards',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const { toggleSidebar } = useUIStore()
  const pathname = usePathname()
  const title = Object.entries(pageTitle).find(([p]) => pathname.startsWith(p))?.[1] ?? ''

  return (
    <header className="h-14 border-b border-border/60 bg-background/80 backdrop-blur-md flex items-center px-6 gap-4 shrink-0 sticky top-0 z-40">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex-1 flex items-center">
        {title && (
          <span className="text-sm font-semibold text-foreground/70">{title}</span>
        )}
      </div>

      <motion.div whileTap={{ scale: 0.85 }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </motion.div>

      <Button variant="ghost" size="icon">
        <Bell className="w-4 h-4" />
      </Button>

      <UserButton />
    </header>
  )
}
