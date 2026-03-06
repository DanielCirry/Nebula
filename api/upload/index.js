import Busboy from 'busboy'
import { readPortfolio, writePortfolio } from '../lib/blob.js'
import { checkAdminPassword, hashPassword } from '../lib/auth.js'
import { parseCv } from '../lib/parseDocx.js'

export default async function (context, req) {
  try {
    const { fields, fileBuffer, filename } = await parseMultipart(req)

    // Check admin password against existing portfolio
    const existing = await readPortfolio()
    if (existing) {
      if (!await checkAdminPassword(existing, fields.adminPassword || '')) {
        context.res = { status: 401, body: 'Invalid admin password' }
        return
      }
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      context.res = { status: 400, body: 'No file provided' }
      return
    }

    if (fileBuffer.length > 10 * 1024 * 1024) {
      context.res = { status: 413, body: 'File too large (max 10MB)' }
      return
    }

    const isPdf = (filename || '').toLowerCase().endsWith('.pdf')
    const portfolio = await parseCv(fileBuffer, fields.contactPasscode || '', isPdf)

    // Set admin password if provided
    if (fields.adminPassword) {
      portfolio.meta.adminPasswordHash = await hashPassword(fields.adminPassword)
    }

    await writePortfolio(portfolio)

    context.res = { status: 200, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    context.log.error('Upload error:', err)
    context.res = { status: 500, body: 'Processing failed' }
  }
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {}
    const chunks = []
    let filename = ''

    const busboy = Busboy({
      headers: { 'content-type': req.headers['content-type'] },
    })

    busboy.on('field', (name, val) => { fields[name] = val })
    busboy.on('file', (_, file, info) => {
      filename = info?.filename || ''
      file.on('data', (chunk) => chunks.push(chunk))
    })
    busboy.on('finish', () => {
      resolve({ fields, fileBuffer: Buffer.concat(chunks), filename })
    })
    busboy.on('error', reject)

    const raw = req.rawBody || req.body
    if (raw) {
      const buf = Buffer.isBuffer(raw) ? raw : Buffer.from(raw, 'base64')
      busboy.end(buf)
    } else {
      resolve({ fields, fileBuffer: Buffer.alloc(0), filename: '' })
    }
  })
}
