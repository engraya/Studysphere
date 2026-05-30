import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from '@google/genai'

const MODEL = 'gemini-3.5-flash'
const EMBEDDING_MODEL = 'gemini-embedding-001'

function getGenAI() {
  const key = process.env.GOOGLE_GEMINI_API_KEY
  if (!key) throw new Error('GOOGLE_GEMINI_API_KEY is not set')
  return new GoogleGenAI({ apiKey: key })
}

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
]

export const geminiPro = {
  generateContent: async (prompt: string) => {
    const ai = getGenAI()
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { temperature: 0.4, topP: 0.8, maxOutputTokens: 8192, safetySettings },
    })
    return { response: { text: () => response.text ?? '' } }
  },
}

export const geminiProJSON = {
  generateContent: async (prompt: string) => {
    const ai = getGenAI()
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        maxOutputTokens: 8192,
        safetySettings,
      },
    })
    return { response: { text: () => response.text ?? '' } }
  },
}

export const embeddingModel = {
  embedContent: async (params: {
    content: { parts: [{ text: string }]; role: string }
    taskType: string
  }) => {
    const ai = getGenAI()
    const result = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: params.content.parts[0].text,
      config: { taskType: params.taskType as never },
    })
    return { embedding: { values: result.embeddings?.[0]?.values ?? [] } }
  },
}
