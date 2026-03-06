import { readPortfolio } from '../lib/blob.js'
import { verifyPassword } from '../lib/auth.js'

export default async function (context, req) {
  const passcode = req.body?.passcode
  if (!passcode) {
    context.res = { status: 400, body: 'Passcode required' }
    return
  }

  try {
    const portfolio = await readPortfolio()
    if (!portfolio) {
      context.res = { status: 404, body: 'No portfolio data' }
      return
    }

    const contact = portfolio.contact
    if (!contact?.encrypted || !contact?.data) {
      context.res = { status: 404, body: 'No protected contact data' }
      return
    }

    if (!await verifyPassword(passcode, contact.passcodeHash)) {
      context.res = { status: 401, body: 'Incorrect passcode' }
      return
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact.data),
    }
  } catch (err) {
    context.log.error('Reveal contact error:', err)
    context.res = { status: 500, body: 'Failed to reveal contact' }
  }
}
