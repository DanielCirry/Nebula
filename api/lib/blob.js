import { BlobServiceClient } from '@azure/storage-blob'

const CONTAINER = 'portfolio-data'
const BLOB_NAME = 'portfolio.json'

function getContainer() {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!connStr) throw new Error('AZURE_STORAGE_CONNECTION_STRING not configured')
  const client = BlobServiceClient.fromConnectionString(connStr)
  return client.getContainerClient(CONTAINER)
}

export async function readPortfolio() {
  const container = getContainer()
  const blob = container.getBlockBlobClient(BLOB_NAME)
  const exists = await blob.exists()
  if (!exists) return null
  const download = await blob.download(0)
  const chunks = []
  for await (const chunk of download.readableStreamBody) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export async function writePortfolio(portfolio) {
  const container = getContainer()
  await container.createIfNotExists()
  const blob = container.getBlockBlobClient(BLOB_NAME)
  const data = JSON.stringify(portfolio)
  await blob.upload(data, data.length, {
    blobHTTPHeaders: { blobContentType: 'application/json' },
  })
}
