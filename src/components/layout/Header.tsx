'use client'

import { UserButton } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Menu, Moon, Sun, Bell } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { toggleSidebar } = useUIStore()

  return (
    <header className="h-16 border-b border-border bg-card/50 flex items-center px-6 gap-4 shrink-0">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <Button variant="ghost" size="icon">
        <Bell className="w-4 h-4" />
      </Button>

      <UserButton />
    </header>
  )
}
