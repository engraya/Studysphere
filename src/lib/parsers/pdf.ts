export async function parsePDF(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string; numpages: number }>
  const data = await pdfParse(buffer)
  return {
    text: data.text,
    numPages: data.numpages,
  }
}
