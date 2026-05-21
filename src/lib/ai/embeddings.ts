import { embeddingModel } from './gemini'

export async function embedText(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }], role: 'user' },
    taskType: 'RETRIEVAL_QUERY' as never,
  })
  return result.embedding.values
}

export async function embedChunk(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }], role: 'user' },
    taskType: 'RETRIEVAL_DOCUMENT' as never,
  })
  return result.embedding.values
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 5
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const embeddings = await Promise.all(batch.map(embedChunk))
    results.push(...embeddings)
  }

  return results
}
