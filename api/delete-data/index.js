import { BlobServiceClient } from '@azure/storage-blob'
import { createHash } from 'crypto'

export default async function (context, req) {
  const { password } = req.body || {}

  if (!password) {
    context.res = { status: 400, body: 'Password required' }
    return
  }

  const uploadPassword = process.env.UPLOAD_PASSWORD
  if (!uploadPassword) {
    context.res = { status: 500, body: 'Server misconfigured' }
    return
  }

  const passwordHash = createHash('sha256').update(password).digest('hex')
  if (passwordHash !== uploadPassword) {
    context.res = { status: 401, body: 'Invalid password' }
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

    const exists = await blob.exists()
    if (exists) {
      await blob.delete()
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    }
  } catch (err) {
    context.log.error('Delete data error:', err)
    context.res = { status: 500, body: 'Delete failed' }
  }
}
