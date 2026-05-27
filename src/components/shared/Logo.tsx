import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  className?: string
}

const sizeMap = {
  sm: { outer: 'w-7 h-7 rounded-md', svgSize: 12, text: 'text-base' },
  md: { outer: 'w-8 h-8 rounded-lg', svgSize: 14, text: 'text-lg' },
  lg: { outer: 'w-9 h-9 rounded-xl', svgSize: 16, text: 'text-xl' },
}

export function Logo({ size = 'md', showWordmark = true, className }: LogoProps) {
  const s = sizeMap[size]
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          s.outer,
          'relative flex items-center justify-center shrink-0 overflow-hidden shadow-sm',
          'bg-linear-to-br from-indigo-500 to-violet-600'
        )}
      >
        <div className="absolute inset-0 bg-linear-to-b from-white/15 to-transparent pointer-events-none" />
        <svg
          viewBox="0 0 20 20"
          fill="none"
          width={s.svgSize}
          height={s.svgSize}
          aria-hidden="true"
          className="relative"
        >
          <polygon
            points="11,2 4,12 10,12 9,18 16,8 10,8"
            fill="white"
            fillOpacity="0.95"
          />
        </svg>
      </div>
      {showWordmark && (
        <span className={cn('font-bold tracking-tight', s.text)}>StudySphere</span>
      )}
    </div>
  )
}
