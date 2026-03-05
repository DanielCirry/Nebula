import { BlobServiceClient } from '@azure/storage-blob'
import { createHash, createDecipheriv } from 'crypto'
import bcryptjs from 'bcryptjs'

export default async function (context, req) {
  const passcode = req.body?.passcode
  if (!passcode) {
    context.res = { status: 400, body: 'Passcode required' }
    return
  }

  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!connStr) {
    context.res = { status: 500, body: 'Server misconfigured' }
    return
  }

  try {
    const blobClient = BlobServiceClient.fromConnectionString(connStr)
    const container = blobClient.getContainerClient('portfolio-data')
    const blob = container.getBlockBlobClient('portfolio.json')

    const download = await blob.download(0)
    const body = await streamToString(download.readableStreamBody)
    const portfolio = JSON.parse(body)

    const storedHash = portfolio.contact?.passcodeHash
    let valid = false
    if (storedHash?.startsWith('$2')) {
      valid = await bcryptjs.compare(passcode, storedHash)
    } else {
      valid = createHash('sha256').update(passcode).digest('hex') === storedHash
    }
    if (!valid) {
      context.res = { status: 401, body: 'Incorrect passcode' }
      return
    }

    const encryptionKey = process.env.CONTACT_ENCRYPTION_KEY
    if (!encryptionKey || !portfolio.contact?.data) {
      context.res = { status: 404, body: 'No contact data' }
      return
    }

    const [encryptedData, authTag] = portfolio.contact.data.split(':')
    const iv = Buffer.from(portfolio.contact.iv, 'hex')
    const key = createHash('sha256').update(encryptionKey).digest()

    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: decrypted,
    }
  } catch (err) {
    context.log.error('Reveal contact error:', err)
    context.res = { status: 500, body: 'Decryption failed' }
  }
}

async function streamToString(stream) {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}
