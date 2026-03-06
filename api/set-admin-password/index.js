import { readPortfolio, writePortfolio } from '../lib/blob.js'
import { checkAdminPassword, hashPassword } from '../lib/auth.js'

export default async function (context, req) {
  const { currentPassword, newPassword } = req.body || {}

  try {
    const portfolio = await readPortfolio()
    if (!portfolio) {
      context.res = { status: 404, body: 'No portfolio data' }
      return
    }

    if (!await checkAdminPassword(portfolio, currentPassword || '')) {
      context.res = { status: 401, body: 'Invalid current password' }
      return
    }

    if (!newPassword) {
      context.res = { status: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) }
      return
    }

    portfolio.meta.adminPasswordHash = await hashPassword(newPassword)

    await writePortfolio(portfolio)

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    }
  } catch (err) {
    context.log.error('Set admin password error:', err)
    context.res = { status: 500, body: 'Failed to set password' }
  }
}
