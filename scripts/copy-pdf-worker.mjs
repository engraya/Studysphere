import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { createRequire } from 'module'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const workerSrc = join(
  dirname(require.resolve('pdfjs-dist/package.json')),
  'build',
  'pdf.worker.min.mjs'
)
const dest = join(__dirname, '..', 'public', 'pdf.worker.min.mjs')

if (existsSync(workerSrc)) {
  mkdirSync(join(__dirname, '..', 'public'), { recursive: true })
  copyFileSync(workerSrc, dest)
  console.log('✓ Copied pdf.worker.min.mjs to public/')
} else {
  console.log('ℹ pdfjs-dist not found, skipping worker copy')
}
