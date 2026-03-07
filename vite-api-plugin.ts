import type { Plugin } from 'vite'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const DATA_PATH = resolve('dev-portfolio.json')

function checkUploadPassword(password: string): boolean {
  const expected = process.env.UPLOAD_PASSWORD
  if (!expected) return true
  return password === expected
}

function checkContactPasscode(passcode: string): boolean {
  const expected = process.env.CONTACT_PASSCODE
  if (!expected) return true
  return passcode === expected
}

export function devApiPlugin(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      // GET /api/data
      server.middlewares.use('/api/data', (_req, res) => {
        if (!existsSync(DATA_PATH)) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'No portfolio data' }))
          return
        }
        const portfolio = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))

        if (process.env.CONTACT_PASSCODE && portfolio.contact?.data) {
          portfolio.contact = { encrypted: true }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(portfolio))
      })

      // GET /api/auth-status
      server.middlewares.use('/api/auth-status', (_req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          hasUploadPassword: !!process.env.UPLOAD_PASSWORD,
          hasPersonalPasscode: !!process.env.CONTACT_PASSCODE,
        }))
      })

      // POST /api/reveal-contact
      server.middlewares.use('/api/reveal-contact', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405).end(); return }
        const body = await readBody(req)
        const { passcode } = JSON.parse(body)

        if (!existsSync(DATA_PATH)) { res.writeHead(404).end('No data'); return }

        const portfolio = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))
        if (!portfolio.contact?.data) {
          res.writeHead(404).end('No contact data')
          return
        }

        if (!checkContactPasscode(passcode || '')) {
          res.writeHead(401).end('Invalid passcode')
          return
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(portfolio.contact.data))
      })

      // POST /api/upload
      server.middlewares.use('/api/upload', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405).end(); return }

        try {
          const { default: Busboy } = await import('busboy')
          const { fields, fileBuffer } = await parseMultipart(req, Busboy)

          if (!checkUploadPassword(fields.uploadPassword || '')) {
            res.writeHead(401).end('Invalid upload password')
            return
          }

          if (!fileBuffer || fileBuffer.length === 0) {
            res.writeHead(400).end('No file provided')
            return
          }

          if (fileBuffer.length > 10 * 1024 * 1024) {
            res.writeHead(413).end('File too large (max 10MB)')
            return
          }

          const isPdf = (fields.filename || '').toLowerCase().endsWith('.pdf') || fields.mimetype === 'application/pdf'
          const { parseCv } = await import('./api/lib/parseDocx.js')
          const portfolio = await parseCv(fileBuffer, isPdf)

          writeFileSync(DATA_PATH, JSON.stringify(portfolio, null, 2))
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true }))
        } catch (err) {
          console.error('Upload error:', err)
          res.writeHead(500).end('Processing failed')
        }
      })

      // POST /api/edit
      server.middlewares.use('/api/edit', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405).end(); return }
        const body = await readBody(req)
        const { uploadPassword, data: edits } = JSON.parse(body)

        if (!existsSync(DATA_PATH)) { res.writeHead(404).end('No portfolio data'); return }

        if (!checkUploadPassword(uploadPassword || '')) {
          res.writeHead(401).end('Invalid upload password')
          return
        }

        const portfolio = JSON.parse(readFileSync(DATA_PATH, 'utf-8'))

        const EDITABLE_KEYS = ['profile', 'skills', 'experience', 'education', 'projects', 'other']
        for (const [key, value] of Object.entries(edits)) {
          if (EDITABLE_KEYS.includes(key)) (portfolio as any)[key] = value
        }

        writeFileSync(DATA_PATH, JSON.stringify(portfolio, null, 2))
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      })
    },
  }
}

function readBody(req: any): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk: any) => { body += chunk })
    req.on('end', () => resolve(body))
  })
}

function parseMultipart(req: any, Busboy: any): Promise<{ fields: Record<string, string>; fileBuffer: Buffer }> {
  return new Promise((resolve, reject) => {
    const fields: Record<string, string> = {}
    const chunks: Buffer[] = []

    const busboy = Busboy({ headers: req.headers })
    busboy.on('field', (name: string, val: string) => { fields[name] = val })
    busboy.on('file', (_name: any, file: any, info: any) => {
      const fname = info?.filename || info?.name || (typeof info === 'string' ? info : '')
      if (fname) fields.filename = fname
      const mime = info?.mimeType || info?.mime || ''
      if (mime) fields.mimetype = mime
      file.on('data', (chunk: Buffer) => chunks.push(chunk))
    })
    busboy.on('finish', () => resolve({ fields, fileBuffer: Buffer.concat(chunks) }))
    busboy.on('error', reject)

    req.pipe(busboy)
  })
}
