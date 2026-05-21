import { embedText } from './embeddings'
import { createAdminClient } from '@/lib/supabase/server'
import type { RAGSource } from '@/types'

export interface RAGContext {
  contextText: string
  sources: RAGSource[]
}

export async function retrieveContext(
  query: string,
  userId: string,
  sessionId?: string | null,
  matchCount = 5,
  threshold = 0.6
): Promise<RAGContext> {
  const supabase = createAdminClient()

  const queryEmbedding = await embedText(query)

  const { data: chunks, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: queryEmbedding as never,
    match_user_id: userId,
    match_count: matchCount,
    match_threshold: threshold,
    filter_session_id: sessionId ?? null,
  })

  if (error || !chunks || chunks.length === 0) {
    return { contextText: '', sources: [] }
  }

  const docIds = [...new Set(chunks.map((c: { document_id: string }) => c.document_id))]
  const { data: docs } = await supabase
    .from('documents')
    .select('id, file_name')
    .in('id', docIds)

  const docMap = new Map((docs ?? []).map((d: { id: string; file_name: string }) => [d.id, d.file_name]))

  const sources: RAGSource[] = chunks.map((c: {
    id: string
    document_id: string
    content: string
    page_number: number | null
    similarity: number
  }) => ({
    chunk_id: c.id,
    document_id: c.document_id,
    content: c.content,
    page_number: c.page_number,
    file_name: docMap.get(c.document_id),
    similarity: c.similarity,
  }))

  const contextText = sources
    .map(
      (s) =>
        `[Source: ${s.file_name ?? 'Document'}${s.page_number ? `, Page ${s.page_number}` : ''}]\n${s.content}`
    )
    .join('\n\n---\n\n')

  return { contextText, sources }
}
