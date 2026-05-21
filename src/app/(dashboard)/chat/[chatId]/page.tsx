import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('chat_sessions')
    .select('title')
    .eq('id', chatId)
    .single()
  return { title: data?.title ?? 'Chat' }
}

export default async function ChatSessionPage({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  const { chatId } = await params
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminClient()

  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userRow) return null

  const { data: session } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', chatId)
    .eq('user_id', userRow.id)
    .single()

  if (!session) notFound()

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_session_id', chatId)
    .order('created_at', { ascending: true })

  const initialMessages = (messages ?? []).map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="border-b border-border pb-4 mb-0 px-0 shrink-0">
        <h1 className="text-lg font-semibold">{session.title}</h1>
        <p className="text-sm text-muted-foreground">AI Tutor — answers based on your documents</p>
      </div>
      <div className="flex-1 min-h-0">
        <ChatWindow
          chatSessionId={chatId}
          sessionId={session.session_id ?? undefined}
        />
      </div>
    </div>
  )
}
