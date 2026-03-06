export default async function (context) {
  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      hasPersonalPasscode: !!process.env.CONTACT_PASSCODE,
    }),
  }
}
