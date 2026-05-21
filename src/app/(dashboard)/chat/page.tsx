import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, MessageSquare, Clock } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { createAdminClient } from '@/lib/supabase/server'

export const metadata = { title: 'AI Tutor Chat' }

export default async function ChatListPage() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userRow) return null

  const { data: sessions } = await adminSupabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userRow.id)
    .order('updated_at', { ascending: false })

  async function createSession() {
    'use server'
    const adminSb = createAdminClient()
    const { data } = await adminSb
      .from('chat_sessions')
      .insert({ user_id: userRow!.id, title: 'New Chat' })
      .select('id')
      .single()
    return data?.id
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Tutor</h1>
          <p className="text-muted-foreground">Chat about your study materials</p>
        </div>
        <form
          action={async () => {
            'use server'
            const id = await createSession()
            if (id) {
              const { redirect } = await import('next/navigation')
              redirect(`/chat/${id}`)
            }
          }}
        >
          <Button type="submit" className="gap-2">
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </form>
      </div>

      {!sessions || sessions.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No chats yet</h2>
          <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
            Start a chat with your AI tutor to ask questions about your uploaded study materials.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <Link key={session.id} href={`/chat/${session.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow hover:bg-muted/30 cursor-pointer">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-violet-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{session.title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatRelativeDate(session.updated_at)}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
