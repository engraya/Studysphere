import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { FileText, PlayCircle, FileType, ArrowLeft, MessageSquare, Brain } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

interface PageProps {
  params: Promise<{ sessionId: string }>
}

const fileTypeIcon: Record<string, React.ReactNode> = {
  pdf: <FileType className="w-4 h-4 text-red-500" />,
  docx: <FileText className="w-4 h-4 text-blue-500" />,
  txt: <FileText className="w-4 h-4 text-gray-500" />,
  youtube: <PlayCircle className="w-4 h-4 text-red-500" />,
  note: <FileText className="w-4 h-4 text-amber-500" />,
}

export default async function WorkspaceSessionPage({ params }: PageProps) {
  const { sessionId } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createAdminClient()
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userRow) redirect('/dashboard')

  const { data: session } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userRow.id)
    .single()

  if (!session) redirect('/workspace')

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/workspace">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Workspace
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{session.title}</h1>
          {session.subject && (
            <p className="text-muted-foreground">{session.subject}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link href={`/chat?session=${sessionId}`}>
              <MessageSquare className="w-4 h-4" />
              Chat with AI
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href={`/quiz/generate?session=${sessionId}`}>
              <Brain className="w-4 h-4" />
              Generate Quiz
            </Link>
          </Button>
        </div>
      </div>

      {!documents || documents.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No materials in this session yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {fileTypeIcon[doc.file_type] ?? <FileText className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.file_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeDate(doc.created_at)}
                  </p>
                </div>
                <Badge
                  variant={doc.embed_status === 'done' ? 'secondary' : 'outline'}
                  className="text-xs shrink-0"
                >
                  {doc.embed_status === 'done' ? 'Ready' : doc.embed_status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
