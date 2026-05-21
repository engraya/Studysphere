export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface User {
  id: string
  clerk_id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  onboarded: boolean
  study_goal: string | null
  subjects: string[]
  streak_count: number
  last_active: string | null
  timezone: string
  created_at: string
  updated_at: string
}

export interface StudySession {
  id: string
  user_id: string
  title: string
  subject: string | null
  total_minutes: number
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  session_id: string | null
  file_name: string
  file_type: 'pdf' | 'docx' | 'txt' | 'youtube' | 'note'
  storage_path: string | null
  youtube_url: string | null
  raw_text: string | null
  summary: string | null
  char_count: number | null
  embed_status: 'pending' | 'processing' | 'done' | 'error'
  created_at: string
  updated_at: string
}

export interface DocumentChunk {
  id: string
  document_id: string
  user_id: string
  content: string
  chunk_index: number
  page_number: number | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface PdfHighlight {
  id: string
  user_id: string
  document_id: string
  page_number: number
  selected_text: string
  color: string
  note: string | null
  bounding_box: {
    x: number
    y: number
    width: number
    height: number
  }
  created_at: string
}

export interface QuizSession {
  id: string
  user_id: string
  session_id: string | null
  title: string
  subject: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  question_types: string[]
  total_questions: number
  time_limit_sec: number | null
  score: number | null
  time_taken_sec: number | null
  completed_at: string | null
  created_at: string
}

export interface QuizQuestion {
  id: string
  quiz_session_id: string
  question_index: number
  question_type: 'mcq' | 'true_false' | 'short_answer'
  question_text: string
  options: Array<{ id: string; text: string }> | null
  correct_answer: string
  explanation: string | null
  user_answer: string | null
  is_correct: boolean | null
  time_spent_sec: number | null
  created_at: string
}

export interface FlashcardDeck {
  id: string
  user_id: string
  session_id: string | null
  title: string
  subject: string | null
  card_count: number
  created_at: string
  updated_at: string
}

export interface Flashcard {
  id: string
  deck_id: string
  user_id: string
  front: string
  back: string
  easiness_factor: number
  interval_days: number
  repetitions: number
  next_review: string
  last_reviewed: string | null
  status: 'new' | 'learning' | 'review' | 'mastered'
  created_at: string
  updated_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  session_id: string | null
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  chat_session_id: string
  role: 'user' | 'assistant'
  content: string
  sources: RAGSource[]
  created_at: string
}

export interface ExamSession {
  id: string
  user_id: string
  title: string
  subject: string | null
  total_questions: number
  time_limit_sec: number
  tab_blur_count: number
  score: number | null
  completed_at: string | null
  created_at: string
}

export interface WeaknessRecord {
  id: string
  user_id: string
  topic: string
  subject: string | null
  error_count: number
  last_seen: string
  resolved: boolean
}

export interface StudyActivity {
  id: string
  user_id: string
  activity_type: 'quiz' | 'flashcard' | 'chat' | 'upload' | 'exam'
  subject: string | null
  duration_min: number
  score: number | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface RAGSource {
  document_id: string
  chunk_id: string
  content: string
  page_number: number | null
  file_name?: string
  similarity?: number
}

export type SM2Quality = 0 | 1 | 3 | 5
