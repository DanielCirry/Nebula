import { readPortfolio, writePortfolio } from '../lib/blob.js'
import { checkUploadPassword } from '../lib/auth.js'

export default async function (context, req) {
  const { uploadPassword, data: edits } = req.body || {}

  try {
    const portfolio = await readPortfolio()
    if (!portfolio) {
      context.res = { status: 404, body: 'No portfolio data' }
      return
    }

    if (!checkUploadPassword(uploadPassword || '')) {
      context.res = { status: 401, body: 'Invalid upload password' }
      return
    }

    const EDITABLE_KEYS = ['profile', 'skills', 'experience', 'education', 'projects', 'other']
    for (const [key, value] of Object.entries(edits || {})) {
      if (EDITABLE_KEYS.includes(key)) portfolio[key] = value
    }

    await writePortfolio(portfolio)

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    }
  } catch (err) {
    context.log.error('Edit error:', err)
    context.res = { status: 500, body: 'Edit failed' }
  }
}
