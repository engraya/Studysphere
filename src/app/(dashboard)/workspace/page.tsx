import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Upload, Plus, FileText, PlayCircle, FileType, Clock } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

export const metadata = { title: 'Workspace' }

const fileTypeIcon: Record<string, React.ReactNode> = {
  pdf: <FileType className="w-4 h-4 text-red-500" />,
  docx: <FileText className="w-4 h-4 text-blue-500" />,
  txt: <FileText className="w-4 h-4 text-gray-500" />,
  youtube: <PlayCircle className="w-4 h-4 text-red-500" />,
  note: <FileText className="w-4 h-4 text-amber-500" />,
}

export default async function WorkspacePage() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = await createClient()
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single()

  if (!userRow) return null

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userRow.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workspace</h1>
          <p className="text-muted-foreground">Your study materials</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/workspace/new">
            <Plus className="w-4 h-4" />
            Add Material
          </Link>
        </Button>
      </div>

      {!documents || documents.length === 0 ? (
        <Card className="p-12 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No study materials yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Upload PDFs, Word documents, or paste YouTube links to start studying with AI.
          </p>
          <Button asChild className="gap-2">
            <Link href="/workspace/new">
              <Plus className="w-4 h-4" />
              Add your first material
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {fileTypeIcon[doc.file_type] ?? <FileText className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {doc.file_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(doc.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <Badge
                  variant={doc.embed_status === 'done' ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {doc.embed_status === 'done' ? '✓ Ready' : doc.embed_status}
                </Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/chat?document=${doc.id}`}>Chat</Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/quiz/generate?document=${doc.id}`}>Quiz</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
