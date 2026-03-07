import { BlobServiceClient } from '@azure/storage-blob'
import { readPortfolio } from '../lib/blob.js'
import { checkUploadPassword } from '../lib/auth.js'

export default async function (context, req) {
  const { password } = req.body || {}

  try {
    const portfolio = await readPortfolio()
    if (!portfolio) {
      context.res = { status: 404, body: 'No portfolio data' }
      return
    }

    if (!checkUploadPassword(password || '')) {
      context.res = { status: 401, body: 'Invalid password' }
      return
    }

    const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING
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
