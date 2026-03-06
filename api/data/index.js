import { readPortfolio } from '../lib/blob.js'

export default async function (context) {
  try {
    const portfolio = await readPortfolio()
    if (!portfolio) {
      context.res = { status: 404, body: 'No portfolio data' }
      return
    }

    // Strip contact data when passcode is configured
    if (process.env.CONTACT_PASSCODE && portfolio.contact?.data) {
      portfolio.contact = { encrypted: true }
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(portfolio),
    }
  } catch (err) {
    context.log.error('Data fetch error:', err)
    context.res = { status: 500, body: 'Failed to fetch data' }
  }
}
