import { extractYouTubeId } from '@/lib/utils'

export async function fetchYouTubeTranscript(url: string): Promise<string> {
  const videoId = extractYouTubeId(url)
  if (!videoId) throw new Error('Invalid YouTube URL')

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error('YOUTUBE_API_KEY not configured')

  const captionsRes = await fetch(
    `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`
  )

  if (!captionsRes.ok) {
    throw new Error(`YouTube API error: ${captionsRes.statusText}`)
  }

  const captionsData = await captionsRes.json()
  const tracks = captionsData.items as Array<{
    id: string
    snippet: { language: string; trackKind: string }
  }>

  const englishTrack = tracks?.find(
    (t) => t.snippet.language === 'en' && t.snippet.trackKind !== 'asr'
  ) ?? tracks?.find((t) => t.snippet.language === 'en')

  if (!englishTrack) {
    throw new Error('No English captions available for this video')
  }

  const transcriptRes = await fetch(
    `https://www.googleapis.com/youtube/v3/captions/${englishTrack.id}?key=${apiKey}`,
    { headers: { Accept: 'text/plain' } }
  )

  if (!transcriptRes.ok) {
    throw new Error('Failed to fetch transcript')
  }

  const text = await transcriptRes.text()
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
