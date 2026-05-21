'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PdfHighlight } from '@/types'

interface BoundingBox { x: number; y: number; width: number; height: number }

interface NewHighlight {
  selectedText: string
  pageNumber: number
  boundingBox: BoundingBox
}

const PRESET_COLORS = ['#FFD700', '#FF6B6B', '#51CF66', '#339AF0', '#CC5DE8']

export function usePDFHighlight(documentId: string) {
  const queryClient = useQueryClient()
  const [pendingHighlight, setPendingHighlight] = useState<NewHighlight | null>(null)
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])

  const { data: highlights = [] } = useQuery<PdfHighlight[]>({
    queryKey: ['highlights', documentId],
    queryFn: async () => {
      const res = await fetch(`/api/highlights?document_id=${documentId}`)
      if (!res.ok) throw new Error('Failed to load highlights')
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: {
      document_id: string
      page_number: number
      selected_text: string
      color: string
      note?: string
      bounding_box: BoundingBox
    }) => {
      const res = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to save highlight')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights', documentId] })
      setPendingHighlight(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/highlights?id=${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights', documentId] })
    },
  })

  const handleMouseUp = useCallback(
    (pageNumber: number, pageRef: HTMLElement) => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) return

      const selectedText = selection.toString().trim()
      if (!selectedText) return

      const range = selection.getRangeAt(0)
      const selectionRect = range.getBoundingClientRect()
      const pageRect = pageRef.getBoundingClientRect()

      const boundingBox: BoundingBox = {
        x: (selectionRect.left - pageRect.left) / pageRect.width,
        y: (selectionRect.top - pageRect.top) / pageRect.height,
        width: selectionRect.width / pageRect.width,
        height: selectionRect.height / pageRect.height,
      }

      setPendingHighlight({ selectedText, pageNumber, boundingBox })
    },
    []
  )

  const saveHighlight = useCallback(
    (note?: string) => {
      if (!pendingHighlight) return
      createMutation.mutate({
        document_id: documentId,
        page_number: pendingHighlight.pageNumber,
        selected_text: pendingHighlight.selectedText,
        color: selectedColor,
        note,
        bounding_box: pendingHighlight.boundingBox,
      })
    },
    [pendingHighlight, selectedColor, documentId, createMutation]
  )

  return {
    highlights,
    pendingHighlight,
    setPendingHighlight,
    selectedColor,
    setSelectedColor,
    presetColors: PRESET_COLORS,
    handleMouseUp,
    saveHighlight,
    deleteHighlight: deleteMutation.mutate,
    isSaving: createMutation.isPending,
  }
}
