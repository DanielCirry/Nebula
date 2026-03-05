import { BlobServiceClient } from '@azure/storage-blob'

export default async function (context) {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!connStr) {
    context.res = { status: 404, body: 'No portfolio data' }
    return
  }

  try {
    const blobClient = BlobServiceClient.fromConnectionString(connStr)
    const container = blobClient.getContainerClient('portfolio-data')
    const blob = container.getBlockBlobClient('portfolio.json')

    const exists = await blob.exists()
    if (!exists) {
      context.res = { status: 404, body: 'No portfolio data' }
      return
    }

    const download = await blob.download(0)
    const body = await streamToString(download.readableStreamBody)

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body,
    }
  } catch (err) {
    context.log.error('Data fetch error:', err)
    context.res = { status: 500, body: 'Failed to fetch data' }
  }
}

async function streamToString(stream) {
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}
