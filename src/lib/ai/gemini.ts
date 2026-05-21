import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'

function getGenAI() {
  const key = process.env.GOOGLE_GEMINI_API_KEY
  if (!key) throw new Error('GOOGLE_GEMINI_API_KEY is not set')
  return new GoogleGenerativeAI(key)
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY ?? 'placeholder')

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
]

export const geminiPro = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  safetySettings,
  generationConfig: {
    temperature: 0.4,
    topP: 0.8,
    maxOutputTokens: 8192,
  },
})

export const geminiProJSON = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  safetySettings,
  generationConfig: {
    temperature: 0.2,
    responseMimeType: 'application/json',
    maxOutputTokens: 8192,
  },
})

export const embeddingModel = genAI.getGenerativeModel({
  model: 'text-embedding-004',
})
