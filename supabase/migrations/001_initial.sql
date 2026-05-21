-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- ============================================================
-- USERS (synced from Clerk via webhook)
-- ============================================================
create table public.users (
  id            uuid primary key default uuid_generate_v4(),
  clerk_id      text unique not null,
  email         text unique not null,
  full_name     text,
  avatar_url    text,
  onboarded     boolean not null default false,
  study_goal    text,
  subjects      text[] default '{}',
  streak_count  integer not null default 0,
  last_active   date,
  timezone      text default 'UTC',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_users_clerk_id on public.users(clerk_id);

-- ============================================================
-- STUDY SESSIONS (workspace containers)
-- ============================================================
create table public.study_sessions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  title         text not null,
  subject       text,
  total_minutes integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_sessions_user_id on public.study_sessions(user_id);
create index idx_sessions_created_at on public.study_sessions(created_at desc);

-- ============================================================
-- DOCUMENTS
-- ============================================================
create table public.documents (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  session_id      uuid references public.study_sessions(id) on delete set null,
  file_name       text not null,
  file_type       text not null,    -- 'pdf' | 'docx' | 'txt' | 'youtube' | 'note'
  storage_path    text,             -- Supabase Storage path (null for youtube/note)
  youtube_url     text,
  raw_text        text,
  summary         text,
  char_count      integer,
  embed_status    text not null default 'pending', -- 'pending'|'processing'|'done'|'error'
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_docs_user_id on public.documents(user_id);
create index idx_docs_session_id on public.documents(session_id);
create index idx_docs_embed_status on public.documents(embed_status);

-- ============================================================
-- DOCUMENT CHUNKS + EMBEDDINGS (pgvector)
-- ============================================================
create table public.document_chunks (
  id            uuid primary key default uuid_generate_v4(),
  document_id   uuid not null references public.documents(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  content       text not null,
  chunk_index   integer not null,
  page_number   integer,
  embedding     vector(768),        -- text-embedding-004 output = 768 dims
  metadata      jsonb default '{}',
  created_at    timestamptz not null default now()
);
create index idx_chunks_document_id on public.document_chunks(document_id);
create index idx_chunks_user_id on public.document_chunks(user_id);
-- IVFFlat ANN index — 100 lists ≈ sqrt(10,000 expected rows)
create index idx_chunks_embedding on public.document_chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ============================================================
-- RAG VECTOR SEARCH FUNCTION
-- ============================================================
create or replace function match_document_chunks(
  query_embedding   vector(768),
  match_user_id     uuid,
  match_count       int default 5,
  match_threshold   float default 0.7,
  filter_session_id uuid default null
)
returns table (
  id          uuid,
  content     text,
  metadata    jsonb,
  similarity  float,
  document_id uuid,
  page_number integer
)
language sql stable as $$
  select
    dc.id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity,
    dc.document_id,
    dc.page_number
  from public.document_chunks dc
  join public.documents d on d.id = dc.document_id
  where dc.user_id = match_user_id
    and (filter_session_id is null or d.session_id = filter_session_id)
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================
-- PDF HIGHLIGHTS
-- ============================================================
create table public.pdf_highlights (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  document_id   uuid not null references public.documents(id) on delete cascade,
  page_number   integer not null,
  selected_text text not null,
  color         text not null default '#FFD700',
  note          text,
  bounding_box  jsonb not null,   -- {x, y, width, height} as fractions 0.0–1.0
  created_at    timestamptz not null default now()
);
create index idx_highlights_document_id on public.pdf_highlights(document_id);
create index idx_highlights_user_id on public.pdf_highlights(user_id);

-- ============================================================
-- QUIZ SESSIONS
-- ============================================================
create table public.quiz_sessions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  session_id      uuid references public.study_sessions(id) on delete set null,
  title           text not null,
  subject         text,
  difficulty      text not null default 'medium',
  question_types  text[] default '{"mcq"}',
  total_questions integer not null,
  time_limit_sec  integer,
  score           integer,
  time_taken_sec  integer,
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);
create index idx_quiz_user_id on public.quiz_sessions(user_id);
create index idx_quiz_completed on public.quiz_sessions(completed_at desc);

-- ============================================================
-- QUIZ QUESTIONS
-- ============================================================
create table public.quiz_questions (
  id              uuid primary key default uuid_generate_v4(),
  quiz_session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  question_index  integer not null,
  question_type   text not null,   -- 'mcq'|'true_false'|'short_answer'
  question_text   text not null,
  options         jsonb,           -- [{id, text}] for MCQ
  correct_answer  text not null,
  explanation     text,
  user_answer     text,
  is_correct      boolean,
  time_spent_sec  integer,
  created_at      timestamptz not null default now()
);
create index idx_questions_quiz_id on public.quiz_questions(quiz_session_id);

-- ============================================================
-- FLASHCARD DECKS
-- ============================================================
create table public.flashcard_decks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  session_id  uuid references public.study_sessions(id) on delete set null,
  title       text not null,
  subject     text,
  card_count  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_decks_user_id on public.flashcard_decks(user_id);

-- ============================================================
-- FLASHCARDS (SM-2 spaced repetition fields)
-- ============================================================
create table public.flashcards (
  id              uuid primary key default uuid_generate_v4(),
  deck_id         uuid not null references public.flashcard_decks(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  front           text not null,
  back            text not null,
  easiness_factor float not null default 2.5,   -- SM-2 EF, min 1.3
  interval_days   integer not null default 1,
  repetitions     integer not null default 0,
  next_review     date not null default current_date,
  last_reviewed   timestamptz,
  status          text not null default 'new',  -- 'new'|'learning'|'review'|'mastered'
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_flashcards_deck_id on public.flashcards(deck_id);
create index idx_flashcards_user_id on public.flashcards(user_id);
create index idx_flashcards_next_review on public.flashcards(user_id, next_review);

-- ============================================================
-- CHAT SESSIONS
-- ============================================================
create table public.chat_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  session_id  uuid references public.study_sessions(id) on delete set null,
  title       text not null default 'New Chat',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_chats_user_id on public.chat_sessions(user_id);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
create table public.chat_messages (
  id              uuid primary key default uuid_generate_v4(),
  chat_session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role            text not null,   -- 'user'|'assistant'
  content         text not null,
  sources         jsonb default '[]',
  created_at      timestamptz not null default now()
);
create index idx_messages_chat_id on public.chat_messages(chat_session_id);
create index idx_messages_created_at on public.chat_messages(created_at);

-- ============================================================
-- EXAM SESSIONS
-- ============================================================
create table public.exam_sessions (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.users(id) on delete cascade,
  title             text not null,
  subject           text,
  total_questions   integer not null,
  time_limit_sec    integer not null,
  tab_blur_count    integer not null default 0,
  score             integer,
  completed_at      timestamptz,
  created_at        timestamptz not null default now()
);
create index idx_exam_user_id on public.exam_sessions(user_id);

-- ============================================================
-- WEAKNESS RECORDS
-- ============================================================
create table public.weakness_records (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  topic       text not null,
  subject     text,
  error_count integer not null default 1,
  last_seen   timestamptz not null default now(),
  resolved    boolean not null default false
);
create index idx_weakness_user_id on public.weakness_records(user_id);
create unique index idx_weakness_user_topic on public.weakness_records(user_id, topic);

-- ============================================================
-- STUDY ACTIVITY LOG (streaks + analytics)
-- ============================================================
create table public.study_activity (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  activity_type text not null,   -- 'quiz'|'flashcard'|'chat'|'upload'|'exam'
  subject       text,
  duration_min  integer default 0,
  score         integer,
  metadata      jsonb default '{}',
  created_at    timestamptz not null default now()
);
create index idx_activity_user_id on public.study_activity(user_id);
create index idx_activity_created_at on public.study_activity(user_id, created_at desc);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at before update on public.users for each row execute procedure update_updated_at();
create trigger trg_sessions_updated_at before update on public.study_sessions for each row execute procedure update_updated_at();
create trigger trg_docs_updated_at before update on public.documents for each row execute procedure update_updated_at();
create trigger trg_decks_updated_at before update on public.flashcard_decks for each row execute procedure update_updated_at();
create trigger trg_flashcards_updated_at before update on public.flashcards for each row execute procedure update_updated_at();
create trigger trg_chats_updated_at before update on public.chat_sessions for each row execute procedure update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users enable row level security;
alter table public.study_sessions enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.pdf_highlights enable row level security;
alter table public.quiz_sessions enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.exam_sessions enable row level security;
alter table public.weakness_records enable row level security;
alter table public.study_activity enable row level security;

-- Helper: resolve clerk_id → internal user uuid
create or replace function get_user_id_from_jwt()
returns uuid language sql stable as $$
  select id from public.users where clerk_id = (auth.jwt() ->> 'sub') limit 1;
$$;

-- RLS Policies
create policy "users_own" on public.users
  for all using (clerk_id = auth.jwt() ->> 'sub');

create policy "sessions_owner" on public.study_sessions
  for all using (user_id = get_user_id_from_jwt());

create policy "documents_owner" on public.documents
  for all using (user_id = get_user_id_from_jwt());

create policy "chunks_owner" on public.document_chunks
  for all using (user_id = get_user_id_from_jwt());

create policy "highlights_owner" on public.pdf_highlights
  for all using (user_id = get_user_id_from_jwt());

create policy "quiz_owner" on public.quiz_sessions
  for all using (user_id = get_user_id_from_jwt());

create policy "questions_owner" on public.quiz_questions
  for all using (
    quiz_session_id in (
      select id from public.quiz_sessions where user_id = get_user_id_from_jwt()
    )
  );

create policy "decks_owner" on public.flashcard_decks
  for all using (user_id = get_user_id_from_jwt());

create policy "flashcards_owner" on public.flashcards
  for all using (user_id = get_user_id_from_jwt());

create policy "chats_owner" on public.chat_sessions
  for all using (user_id = get_user_id_from_jwt());

create policy "messages_owner" on public.chat_messages
  for all using (
    chat_session_id in (
      select id from public.chat_sessions where user_id = get_user_id_from_jwt()
    )
  );

create policy "exam_owner" on public.exam_sessions
  for all using (user_id = get_user_id_from_jwt());

create policy "weakness_owner" on public.weakness_records
  for all using (user_id = get_user_id_from_jwt());

create policy "activity_owner" on public.study_activity
  for all using (user_id = get_user_id_from_jwt());
