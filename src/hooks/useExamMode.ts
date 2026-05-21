'use client'

import { useEffect, useCallback } from 'react'
import { useExamStore } from '@/stores/examStore'

export function useExamMode(examId: string | null) {
  const { status, tabBlurCount, setIsFullscreen, setStatus, incrementBlurCount } = useExamStore()

  const requestFullscreen = useCallback(() => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
    setIsFullscreen(true)
  }, [setIsFullscreen])

  const submitExam = useCallback(() => {
    setStatus('ended')
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }, [setStatus])

  useEffect(() => {
    if (status !== 'active') return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        incrementBlurCount()
        const newCount = tabBlurCount + 1
        setStatus('warning')

        if (examId) {
          fetch(`/api/exam/${examId}/blur`, { method: 'POST', body: JSON.stringify({ count: newCount }) }).catch(() => {})
        }

        if (newCount >= 3) submitExam()
      }
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && status === 'active') {
        setIsFullscreen(false)
        requestFullscreen()
        setStatus('warning')
      } else if (document.fullscreenElement) {
        setIsFullscreen(true)
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        if ((status as string) === 'warning') setStatus('active')
      }
    }

    const handleBlur = () => {
      if (status === 'active') handleVisibilityChange()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [status, tabBlurCount]) // eslint-disable-line

  return { requestFullscreen, submitExam }
}
