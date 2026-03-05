import { BlobServiceClient } from '@azure/storage-blob'
import { createHash } from 'crypto'
import Busboy from 'busboy'
import { parseDocx } from '../lib/parseDocx.js'

export default async function (context, req) {
  const uploadPassword = process.env.UPLOAD_PASSWORD
  if (!uploadPassword) {
    context.res = { status: 500, body: 'Server misconfigured' }
    return
  }

  try {
    const { fields, fileBuffer } = await parseMultipart(req)

    const passwordHash = createHash('sha256').update(fields.password || '').digest('hex')
    if (passwordHash !== uploadPassword) {
      context.res = { status: 401, body: 'Invalid password' }
      return
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      context.res = { status: 400, body: 'No file provided' }
      return
    }

    const encryptionKey = process.env.CONTACT_ENCRYPTION_KEY || 'default-dev-key'
    const portfolio = await parseDocx(fileBuffer, fields.contactPasscode || '', encryptionKey)

    const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING
    if (connStr) {
      const blobClient = BlobServiceClient.fromConnectionString(connStr)
      const container = blobClient.getContainerClient('portfolio-data')
      await container.createIfNotExists()
      const blob = container.getBlockBlobClient('portfolio.json')
      await blob.upload(JSON.stringify(portfolio), JSON.stringify(portfolio).length, {
        blobHTTPHeaders: { blobContentType: 'application/json' },
      })
    }

    context.res = { status: 200, body: JSON.stringify({ ok: true, sections: Object.keys(portfolio).length }) }
  } catch (err) {
    context.log.error('Upload error:', err)
    context.res = { status: 500, body: 'Processing failed' }
  }
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {}
    const chunks = []

    const busboy = Busboy({
      headers: { 'content-type': req.headers['content-type'] },
    })

    busboy.on('field', (name, val) => { fields[name] = val })
    busboy.on('file', (_, file) => {
      file.on('data', (chunk) => chunks.push(chunk))
    })
    busboy.on('finish', () => {
      resolve({ fields, fileBuffer: Buffer.concat(chunks) })
    })
    busboy.on('error', reject)

    if (req.rawBody) {
      busboy.end(typeof req.rawBody === 'string' ? Buffer.from(req.rawBody, 'binary') : req.rawBody)
    } else if (req.body) {
      busboy.end(typeof req.body === 'string' ? Buffer.from(req.body, 'binary') : req.body)
    } else {
      resolve({ fields, fileBuffer: Buffer.alloc(0) })
    }
  })
}
