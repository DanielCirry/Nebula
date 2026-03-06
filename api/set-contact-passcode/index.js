import { readPortfolio, writePortfolio } from '../lib/blob.js'
import { checkAdminPassword, hashPassword } from '../lib/auth.js'

export default async function (context, req) {
  const { adminPassword, passcode } = req.body || {}

  try {
    const portfolio = await readPortfolio()
    if (!portfolio) {
      context.res = { status: 404, body: 'No portfolio data' }
      return
    }

    if (!await checkAdminPassword(portfolio, adminPassword || '')) {
      context.res = { status: 401, body: 'Invalid admin password' }
      return
    }

    // Get current contact data
    const contactData = portfolio.contact?.data || {}

    if (passcode) {
      portfolio.contact = {
        encrypted: true,
        data: contactData,
        passcodeHash: await hashPassword(passcode),
      }
    } else {
      portfolio.contact = { encrypted: false, data: contactData }
    }

    await writePortfolio(portfolio)

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    }
  } catch (err) {
    context.log.error('Set contact passcode error:', err)
    context.res = { status: 500, body: 'Failed to set passcode' }
  }
}
