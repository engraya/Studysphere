import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createSchema = z.object({
  document_id: z.string().uuid(),
  page_number: z.number().int().min(1),
  selected_text: z.string().min(1).max(2000),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFD700'),
  note: z.string().max(500).optional(),
  bounding_box: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().min(0).max(1),
    height: z.number().min(0).max(1),
  }),
})

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const documentId = searchParams.get('document_id')
  if (!documentId) return NextResponse.json({ error: 'document_id required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: userRow } = await supabase.from('users').select('id').eq('clerk_id', userId).single()
  if (!userRow) return new Response('User not found', { status: 404 })

  const { data: highlights } = await supabase
    .from('pdf_highlights')
    .select('*')
    .eq('document_id', documentId)
    .eq('user_id', userRow.id)
    .order('page_number', { ascending: true })

  return NextResponse.json(highlights ?? [])
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: userRow } = await supabase.from('users').select('id').eq('clerk_id', userId).single()
  if (!userRow) return new Response('User not found', { status: 404 })

  const { data: highlight, error } = await supabase
    .from('pdf_highlights')
    .insert({ user_id: userRow.id, ...parsed.data })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to save highlight' }, { status: 500 })
  return NextResponse.json(highlight)
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: userRow } = await supabase.from('users').select('id').eq('clerk_id', userId).single()
  if (!userRow) return new Response('User not found', { status: 404 })

  await supabase.from('pdf_highlights').delete().eq('id', id).eq('user_id', userRow.id)
  return new Response(null, { status: 204 })
}
