'use client'

import { useState, useRef, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { usePDFHighlight } from '@/hooks/usePDFHighlight'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, X, Save } from 'lucide-react'
import type { PdfHighlight } from '@/types'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFViewerProps {
  fileUrl: string
  documentId: string
}

export function PDFViewer({ fileUrl, documentId }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [noteText, setNoteText] = useState('')
  const pageRef = useRef<HTMLDivElement>(null)

  const {
    highlights,
    pendingHighlight,
    setPendingHighlight,
    selectedColor,
    setSelectedColor,
    presetColors,
    handleMouseUp,
    saveHighlight,
    deleteHighlight,
    isSaving,
  } = usePDFHighlight(documentId)

  const onDocumentLoad = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }, [])

  const onMouseUp = useCallback(() => {
    if (pageRef.current) handleMouseUp(currentPage, pageRef.current)
  }, [currentPage, handleMouseUp])

  const pageHighlights = highlights.filter((h) => h.page_number === currentPage)

  return (
    <div className="flex h-full">
      {/* PDF Viewer */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-3 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm min-w-[80px] text-center">{currentPage} / {numPages}</span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))} disabled={currentPage >= numPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={() => setScale((s) => Math.min(3, s + 0.2))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* PDF Page */}
        <ScrollArea className="flex-1">
          <div className="flex justify-center p-4">
            <div ref={pageRef} className="relative" onMouseUp={onMouseUp}>
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoad}
                loading={<Loader2 className="w-8 h-8 animate-spin text-muted-foreground mt-20" />}
              >
                <Page pageNumber={currentPage} scale={scale} renderTextLayer renderAnnotationLayer />
              </Document>

              {/* Highlight overlay */}
              {pageHighlights.map((h) => (
                <HighlightRect key={h.id} highlight={h} scale={scale} onDelete={deleteHighlight} />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Sidebar: pending highlight popover + highlight list */}
      {pendingHighlight && (
        <div className="w-72 border-l border-border bg-card p-4 shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Add Highlight</h3>
            <Button variant="ghost" size="icon" onClick={() => setPendingHighlight(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded italic">
            &ldquo;{pendingHighlight.selectedText.slice(0, 120)}{pendingHighlight.selectedText.length > 120 ? '…' : ''}&rdquo;
          </p>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Color</p>
            <div className="flex gap-2">
              {presetColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${selectedColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Note (optional)</p>
            <Input
              placeholder="Add a note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="text-xs"
            />
          </div>
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => { saveHighlight(noteText || undefined); setNoteText('') }}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Highlight
          </Button>
        </div>
      )}
    </div>
  )
}

function HighlightRect({
  highlight,
  scale,
  onDelete,
}: {
  highlight: PdfHighlight
  scale: number
  onDelete: (id: string) => void
}) {
  const bb = highlight.bounding_box
  const pageWidth = 816 * scale
  const pageHeight = 1056 * scale

  return (
    <div
      className="absolute group"
      style={{
        left: bb.x * pageWidth,
        top: bb.y * pageHeight,
        width: bb.width * pageWidth,
        height: bb.height * pageHeight,
        backgroundColor: highlight.color + '55',
        border: `1px solid ${highlight.color}`,
        borderRadius: 2,
        pointerEvents: 'auto',
      }}
      title={highlight.note ?? highlight.selected_text}
    >
      <button
        onClick={() => onDelete(highlight.id)}
        className="absolute -top-2 -right-2 w-4 h-4 bg-background border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  )
}
