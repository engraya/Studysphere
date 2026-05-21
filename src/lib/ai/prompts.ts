export function buildRAGSystemPrompt(context: string): string {
  return `You are StudySphere AI, an expert educational tutor. Your role is to help students learn and understand study material.

CONTEXT FROM STUDENT'S DOCUMENTS:
${context}

INSTRUCTIONS:
- Answer questions based ONLY on the provided context above
- If the answer is not in the context, clearly say "I don't see this covered in your uploaded materials"
- Explain concepts clearly and simply
- Use examples when helpful
- Format your response with markdown (headers, bullet points, code blocks where appropriate)
- Be encouraging and supportive
- Keep answers focused and educational`
}

export function buildQuizPrompt(
  context: string,
  options: {
    questionCount: number
    types: string[]
    difficulty: string
    topic?: string
  }
): string {
  const typeDescriptions = options.types
    .map((t) =>
      t === 'mcq'
        ? 'Multiple Choice (4 options, exactly one correct)'
        : t === 'true_false'
          ? 'True/False'
          : 'Short Answer (1-3 sentence expected answer)'
    )
    .join(', ')

  return `You are an expert educator creating a quiz from study material.

STUDY MATERIAL:
${context}

TASK: Generate exactly ${options.questionCount} quiz questions${options.topic ? ` about "${options.topic}"` : ''}.

REQUIREMENTS:
- Difficulty level: ${options.difficulty}
- Question types to include: ${typeDescriptions}
- Distribute question types evenly if multiple types requested
- Each question must have a clear, unambiguous correct answer
- Explanations must reference the source material

OUTPUT FORMAT (valid JSON only):
{
  "questions": [
    {
      "type": "mcq",
      "question_text": "...",
      "options": [{"id": "A", "text": "..."}, {"id": "B", "text": "..."}, {"id": "C", "text": "..."}, {"id": "D", "text": "..."}],
      "correct_answer": "A",
      "explanation": "...",
      "topic": "..."
    },
    {
      "type": "true_false",
      "question_text": "...",
      "options": null,
      "correct_answer": "true",
      "explanation": "...",
      "topic": "..."
    },
    {
      "type": "short_answer",
      "question_text": "...",
      "options": null,
      "correct_answer": "...",
      "explanation": "...",
      "topic": "..."
    }
  ]
}`
}

export function buildFlashcardPrompt(context: string, count: number = 15): string {
  return `You are an expert educator creating flashcards from study material.

STUDY MATERIAL:
${context}

TASK: Generate exactly ${count} flashcards that capture the key concepts, definitions, and facts.

REQUIREMENTS:
- Front: A clear, concise question or term (max 100 chars)
- Back: A comprehensive but concise answer/definition (max 300 chars)
- Cover the most important concepts
- Vary between definitions, explanations, and application questions
- Use simple, clear language

OUTPUT FORMAT (valid JSON only):
{
  "cards": [
    {"front": "...", "back": "..."}
  ]
}`
}

export function buildSummaryPrompt(text: string): string {
  return `You are an expert educator. Summarize the following study material concisely.

MATERIAL:
${text.slice(0, 8000)}

Create a structured summary with:
1. **Overview** (2-3 sentences describing the main topic)
2. **Key Concepts** (bullet points of the most important ideas)
3. **Important Facts** (specific data, dates, formulas if present)
4. **Key Takeaways** (3-5 main points a student should remember)

Use markdown formatting.`
}

export function buildWeaknessAnalysisPrompt(
  wrongTopics: string[],
  subjects: string[]
): string {
  return `You are an educational coach analyzing a student's performance.

Topics the student got wrong: ${wrongTopics.join(', ')}
Student's subjects: ${subjects.join(', ')}

Provide:
1. The top 3 areas to focus on for improvement
2. A brief study strategy for each area
3. Encouraging message

Keep it concise and actionable. Use markdown.`
}
