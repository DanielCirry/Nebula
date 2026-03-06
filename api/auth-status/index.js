import { readPortfolio } from '../lib/blob.js'

export default async function (context) {
  try {
    const portfolio = await readPortfolio()
    if (!portfolio) {
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasAdminPassword: false, hasPersonalPasscode: false }),
      }
      return
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hasAdminPassword: !!portfolio.meta?.adminPasswordHash,
        hasPersonalPasscode: !!portfolio.contact?.encrypted,
      }),
    }
  } catch (err) {
    context.log.error('Auth status error:', err)
    context.res = { status: 500, body: 'Failed to check auth status' }
  }
}
