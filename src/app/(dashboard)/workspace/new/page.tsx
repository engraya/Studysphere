'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Upload, PlayCircle, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES, formatFileSize } from '@/lib/utils'

type UploadState = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export default function NewWorkspacePage() {
  const router = useRouter()
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [youtubeUrl, setPlayCircleUrl] = useState('')
  const [loadingPlayCircle, setLoadingPlayCircle] = useState(false)
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([])

  const uploadFile = useCallback((file: File) => {
    setUploadState('uploading')
    setUploadProgress(0)

    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', file)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 80))
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        setUploadProgress(100)
        setUploadState('done')
        toast.success('File uploaded! AI is processing it now.')
        setTimeout(() => router.push('/workspace'), 1500)
      } else {
        setUploadState('error')
        toast.error('Upload failed. Please try again.')
      }
    }

    xhr.onerror = () => {
      setUploadState('error')
      toast.error('Upload failed. Please try again.')
    }

    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  }, [router])

  const onDrop = useCallback((accepted: File[], rejected: { file: File }[]) => {
    setRejectedFiles(rejected.map((r) => r.file.name))
    if (accepted.length > 0) uploadFile(accepted[0])
  }, [uploadFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE_BYTES,
    maxFiles: 1,
    disabled: uploadState === 'uploading' || uploadState === 'done',
  })

  const handleYouTubeSubmit = async () => {
    if (!youtubeUrl) return
    setLoadingPlayCircle(true)
    try {
      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to fetch transcript')
      }
      toast.success('YouTube video added! AI is processing the transcript.')
      router.push('/workspace')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to process YouTube video')
    } finally {
      setLoadingPlayCircle(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Study Material</h1>
        <p className="text-muted-foreground">Upload a file or add a YouTube video to study with AI.</p>
      </div>

      <Tabs defaultValue="file">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="file" className="gap-2">
            <Upload className="w-4 h-4" />
            File Upload
          </TabsTrigger>
          <TabsTrigger value="youtube" className="gap-2">
            <PlayCircle className="w-4 h-4" />
            YouTube
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-4">
          <Card className="p-2">
            {uploadState === 'idle' || uploadState === 'error' ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium mb-1">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, DOCX, TXT · Max {formatFileSize(MAX_FILE_SIZE_BYTES)}
                </p>
                {rejectedFiles.length > 0 && (
                  <p className="text-sm text-destructive mt-2">
                    Invalid file(s): {rejectedFiles.join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-8 text-center space-y-4">
                {uploadState === 'done' ? (
                  <>
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="font-medium">Upload complete!</p>
                    <p className="text-sm text-muted-foreground">Redirecting to workspace…</p>
                  </>
                ) : uploadState === 'uploading' ? (
                  <>
                    <FileText className="w-10 h-10 text-primary mx-auto" />
                    <p className="font-medium">Uploading…</p>
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
                    <p className="font-medium text-destructive">Upload failed</p>
                    <Button variant="outline" onClick={() => setUploadState('idle')}>
                      Try again
                    </Button>
                  </>
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="youtube" className="mt-4">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="font-medium mb-1">YouTube Video URL</h3>
              <p className="text-sm text-muted-foreground">
                Paste a YouTube URL to import the transcript as study material.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setPlayCircleUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleYouTubeSubmit()}
              />
              <Button
                onClick={handleYouTubeSubmit}
                disabled={!youtubeUrl || loadingPlayCircle}
                className="shrink-0"
              >
                {loadingPlayCircle ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Import'
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: The video must have English captions enabled.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
