import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { parsePDF } from '@/lib/parsers/pdf'
import { parseDOCX } from '@/lib/parsers/docx'
import { parseText } from '@/lib/parsers/text'
import { ingestDocument } from '@/lib/ai/ingestion'
import { getFileExtension, MAX_FILE_SIZE_BYTES } from '@/lib/utils'

export const maxDuration = 60

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const supabase = createAdminClient()

  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userRow) return new Response('User not found', { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const sessionId = formData.get('session_id') as string | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 413 })
  }

  const ext = getFileExtension(file.name)
  const allowedExts = ['pdf', 'docx', 'txt']
  if (!allowedExts.includes(ext)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 })
  }

  const fileType = ext as 'pdf' | 'docx' | 'txt'
  const buffer = Buffer.from(await file.arrayBuffer())

  const storagePath = `${userRow.id}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, buffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })
  }

  let rawText = ''
  let numPages: number | undefined

  if (fileType === 'pdf') {
    const parsed = await parsePDF(buffer)
    rawText = parsed.text
    numPages = parsed.numPages
  } else if (fileType === 'docx') {
    rawText = await parseDOCX(buffer)
  } else {
    rawText = parseText(buffer.toString('utf-8'))
  }

  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert({
      user_id: userRow.id,
      session_id: sessionId ?? null,
      file_name: file.name,
      file_type: fileType,
      storage_path: storagePath,
      raw_text: rawText,
      char_count: rawText.length,
      embed_status: 'pending',
    })
    .select('id')
    .single()

  if (docError || !doc) {
    return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
  }

  ingestDocument(doc.id, userRow.id, rawText).catch(console.error)

  await supabase.from('study_activity').insert({
    user_id: userRow.id,
    activity_type: 'upload',
    metadata: { document_id: doc.id, file_name: file.name, num_pages: numPages },
  })

  return NextResponse.json({ documentId: doc.id, status: 'processing' })
}
