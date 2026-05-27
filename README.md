<div align="center">

  <img src="src/app/icon.svg" alt="StudySphere Logo" width="64" height="64" />

  <h1>StudySphere</h1>

  <p><strong>AI-powered study companion — upload documents, generate quizzes, chat with your tutor, master anything.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat&logo=clerk&logoColor=white" alt="Clerk" />
    <img src="https://img.shields.io/badge/Google_Gemini-2.0-4285F4?style=flat&logo=google&logoColor=white" alt="Gemini" />
  </p>

</div>

---

## Overview

StudySphere turns any study material into an active learning session. Drop in a PDF, Word doc, or YouTube link — the AI processes it, then generates quizzes, flashcards, and a context-aware tutor that cites your exact sources. A spaced repetition scheduler and learning analytics keep you on track long-term.

Built as a full-stack portfolio project demonstrating production-grade architecture: RAG pipelines, vector search, real-time streaming AI responses, Clerk webhook-based user provisioning, and a polished design system.

---

## Features

| Feature | Description |
|---|---|
| **Document Workspace** | Upload PDFs, DOCX, TXT, or paste YouTube URLs. AI parses, chunks, and embeds content for semantic search. |
| **Quiz Generator** | MCQ, true/false, and short-answer questions at configurable difficulty. Instant scoring with per-question explanations. |
| **Smart Flashcards** | AI-generated Q&A cards from your notes. SM-2 spaced repetition surfaces due cards and tracks mastery per deck. |
| **AI Tutor Chat** | RAG-powered chat grounded in your uploaded documents. Responses include source citations with file + page references. |
| **Learning Analytics** | Study-time charts, quiz score trends, subject radar, and weak-spot detection surfaced from your activity. |
| **Exam Mode** | Full-screen proctored simulations with countdown timer, tab-switch detection, and mixed question types. |

---

## Tech Stack

**Frontend**
- [Next.js 16](https://nextjs.org/) App Router — server components, route groups, streaming
- [React 19](https://react.dev/) — concurrent features, server actions
- [TypeScript 5](https://www.typescriptlang.org/) — end-to-end type safety
- [TailwindCSS 4](https://tailwindcss.com/) — `@theme inline` design tokens, OKLCH color system
- [shadcn/ui](https://ui.shadcn.com/) (base-nova) — accessible component primitives
- [Framer Motion 12](https://www.framer.com/motion/) — page transitions, micro-interactions
- [Recharts 3](https://recharts.org/) — analytics charts
- [Zustand 5](https://zustand-demo.pmnd.rs/) — client state management
- [TanStack Query 5](https://tanstack.com/query) — server state, caching

**Backend & Data**
- [Supabase](https://supabase.com/) — PostgreSQL database, pgvector for embedding storage, Row Level Security
- [Clerk](https://clerk.com/) — authentication, user management, webhooks
- [Vercel AI SDK 6](https://sdk.vercel.ai/) — streaming AI responses, tool calls
- [Google Gemini 2.0](https://deepmind.google/technologies/gemini/) — LLM for generation + `text-embedding-004` for embeddings
- [LangChain](https://js.langchain.com/) — document loading, recursive text splitting
- [Svix](https://www.svix.com/) — webhook signature verification

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com/) project with `pgvector` enabled
- A [Clerk](https://clerk.com/) application
- A [Google AI Studio](https://aistudio.google.com/) API key
- A [YouTube Data API v3](https://developers.google.com/youtube/v3) key (for YouTube URL support)

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/Engraya/studysphere.git
cd studysphere

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
# Fill in your keys — see the section below

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Google Gemini (server-only)
GOOGLE_GEMINI_API_KEY=AIza...

# YouTube Data API (server-only)
YOUTUBE_API_KEY=AIza...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Sign-in / sign-up pages (Clerk)
│   ├── (dashboard)/     # Protected app shell — dashboard, workspace,
│   │   ├── analytics/   #   chat, quiz, flashcards, analytics, settings
│   │   ├── chat/
│   │   ├── flashcards/
│   │   ├── quiz/
│   │   ├── workspace/
│   │   └── layout.tsx   # Sidebar + Header shell
│   ├── (exam)/          # Full-screen exam mode
│   ├── (onboarding)/    # Post-signup onboarding flow
│   ├── api/             # Route handlers — Clerk webhook, AI streams,
│   │                    #   document processing, embedding pipelines
│   ├── globals.css      # Design tokens (OKLCH), Tailwind v4 theme
│   └── layout.tsx       # Root layout — Clerk, ThemeProvider, Query
├── components/
│   ├── layout/          # Sidebar, Header, MobileSidebar
│   ├── shared/          # Logo, PageMotion, LandingThemeToggle
│   └── ui/              # shadcn/ui primitives
├── lib/
│   ├── supabase/        # Supabase client (browser + server)
│   ├── ai/              # Gemini client, embedding helpers
│   └── utils.ts         # cn(), date helpers
├── stores/              # Zustand stores (workspace, quiz, chat)
└── providers/           # ThemeProvider, QueryProvider
```

---

## Architecture Highlights

**RAG Pipeline** — Documents are chunked with LangChain's `RecursiveCharacterTextSplitter`, embedded with `text-embedding-004`, and stored in Supabase pgvector. At query time, the top-k cosine-similar chunks are injected into the Gemini context window along with the user's question.

**Streaming** — AI Tutor responses stream token-by-token via the Vercel AI SDK's `streamText` + `useChat` hook. The UI renders partial Markdown in real time using `react-markdown`.

**Auth Flow** — Clerk handles sign-up/sign-in. A Svix-verified webhook (`/api/webhooks/clerk`) provisions the Supabase `users` table on `user.created` events, keeping auth and database in sync.

**Spaced Repetition** — Flashcard review intervals are computed server-side using the SM-2 algorithm. Due cards surface in the Daily Review queue; mastery progress is persisted per card in Supabase.

---

## License

MIT © [Ahmad](https://github.com/Engraya)
