export function parseText(content: string): string {
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
}
