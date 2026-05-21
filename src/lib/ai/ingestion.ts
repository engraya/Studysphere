import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { embedBatch } from './embeddings'
import { createAdminClient } from '@/lib/supabase/server'

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
})

export async function ingestDocument(
  documentId: string,
  userId: string,
  rawText: string,
  pageMap?: Map<number, string>
): Promise<void> {
  const supabase = createAdminClient()

  await supabase
    .from('documents')
    .update({ embed_status: 'processing' })
    .eq('id', documentId)

  try {
    const chunks = await splitter.splitText(rawText)

    const embeddings = await embedBatch(chunks)

    const rows = chunks.map((content, index) => ({
      document_id: documentId,
      user_id: userId,
      content,
      chunk_index: index,
      page_number: pageMap ? estimatePage(index, chunks.length, pageMap.size) : null,
      embedding: JSON.stringify(embeddings[index]),
      metadata: { chunk_index: index },
    }))

    const BATCH_SIZE = 50
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const { error } = await supabase
        .from('document_chunks')
        .insert(rows.slice(i, i + BATCH_SIZE))

      if (error) throw error
    }

    await supabase
      .from('documents')
      .update({ embed_status: 'done', char_count: rawText.length })
      .eq('id', documentId)
  } catch (err) {
    await supabase
      .from('documents')
      .update({ embed_status: 'error' })
      .eq('id', documentId)
    throw err
  }
}

function estimatePage(chunkIndex: number, totalChunks: number, totalPages: number): number {
  return Math.ceil(((chunkIndex + 1) / totalChunks) * totalPages)
}
