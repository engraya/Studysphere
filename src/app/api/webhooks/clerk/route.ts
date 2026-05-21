import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { createAdminClient } from '@/lib/supabase/server'

type ClerkUserEvent = {
  type: 'user.created' | 'user.updated' | 'user.deleted'
  data: {
    id: string
    email_addresses: Array<{ email_address: string; id: string }>
    primary_email_address_id: string
    first_name: string | null
    last_name: string | null
    image_url: string
  }
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.text()
  const wh = new Webhook(WEBHOOK_SECRET)

  let event: ClerkUserEvent
  try {
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserEvent
  } catch {
    return new Response('Invalid webhook signature', { status: 400 })
  }

  const supabase = createAdminClient()
  const { type, data } = event

  const primaryEmail = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  )?.email_address

  if (!primaryEmail) {
    return new Response('No primary email', { status: 400 })
  }

  const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ') || null

  if (type === 'user.created') {
    const { error } = await supabase.from('users').insert({
      clerk_id: data.id,
      email: primaryEmail,
      full_name: fullName,
      avatar_url: data.image_url,
    })
    if (error) {
      console.error('Error creating user:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  if (type === 'user.updated') {
    const { error } = await supabase
      .from('users')
      .update({
        email: primaryEmail,
        full_name: fullName,
        avatar_url: data.image_url,
      })
      .eq('clerk_id', data.id)
    if (error) {
      console.error('Error updating user:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  if (type === 'user.deleted') {
    await supabase.from('users').delete().eq('clerk_id', data.id)
  }

  return new Response('OK', { status: 200 })
}
