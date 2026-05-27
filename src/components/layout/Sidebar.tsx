'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/shared/Logo'
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  Brain,
  BookOpen,
  BarChart3,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-500' },
  { href: '/workspace', label: 'Workspace', icon: FolderOpen, color: 'text-blue-500' },
  { href: '/chat', label: 'AI Tutor', icon: MessageSquare, color: 'text-violet-500' },
  { href: '/quiz', label: 'Quizzes', icon: Brain, color: 'text-orange-500' },
  { href: '/flashcards', label: 'Flashcards', icon: BookOpen, color: 'text-emerald-500' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, color: 'text-blue-500' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-0.5">
        {navItems.map((item) => {
          const { href, label, icon: Icon, color } = item
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all relative',
                active
                  ? 'bg-primary/8 text-primary font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:bg-primary'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? color : '')} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all relative',
            pathname === '/settings'
              ? 'bg-primary/8 text-primary font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:bg-primary'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
