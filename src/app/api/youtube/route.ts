import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { fetchYouTubeTranscript } from '@/lib/ai/youtube'
import { ingestDocument } from '@/lib/ai/ingestion'
import { z } from 'zod'

export const maxDuration = 60

const schema = z.object({
  url: z.string().url(),
  session_id: z.string().uuid().nullable().optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })

  const { url, session_id } = parsed.data
  const supabase = createAdminClient()

  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userRow) return new Response('User not found', { status: 404 })

  let transcript: string
  try {
    transcript = await fetchYouTubeTranscript(url)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch transcript' },
      { status: 422 }
    )
  }

  const videoTitle = `YouTube Video — ${new Date().toLocaleDateString()}`

  const { data: doc, error } = await supabase
    .from('documents')
    .insert({
      user_id: userRow.id,
      session_id: session_id ?? null,
      file_name: videoTitle,
      file_type: 'youtube',
      youtube_url: url,
      raw_text: transcript,
      char_count: transcript.length,
      embed_status: 'pending',
    })
    .select('id')
    .single()

  if (error || !doc) {
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 })
  }

  ingestDocument(doc.id, userRow.id, transcript).catch(console.error)

  return NextResponse.json({ documentId: doc.id, status: 'processing' })
}
