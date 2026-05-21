import { auth } from '@clerk/nextjs/server'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { retrieveContext } from '@/lib/ai/rag'
import { buildRAGSystemPrompt } from '@/lib/ai/prompts'
import { createAdminClient } from '@/lib/supabase/server'

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

  const { messages, chatSessionId, sessionId } = await req.json()

  const lastUserMessage: string =
    [...messages].reverse().find((m: { role: string }) => m.role === 'user')?.content ?? ''

  const context = await retrieveContext(lastUserMessage, userRow.id, sessionId ?? null)

  const result = streamText({
    model: google('gemini-1.5-pro'),
    system: buildRAGSystemPrompt(context.contextText),
    messages,
    onFinish: async ({ text }) => {
      if (!chatSessionId) return
      await supabase.from('chat_messages').insert([
        {
          chat_session_id: chatSessionId,
          role: 'user',
          content: lastUserMessage,
          sources: [],
        },
        {
          chat_session_id: chatSessionId,
          role: 'assistant',
          content: text,
          sources: context.sources,
        },
      ])

      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatSessionId)

      await supabase.from('study_activity').insert({
        user_id: userRow.id,
        activity_type: 'chat',
        duration_min: 1,
        metadata: { chat_session_id: chatSessionId },
      })
    },
  })

  return result.toTextStreamResponse()
}
