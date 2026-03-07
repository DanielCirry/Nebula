export default async function (context) {
  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hasUploadPassword: !!process.env.UPLOAD_PASSWORD,
      hasPersonalPasscode: !!process.env.CONTACT_PASSCODE,
    }),
  }
}
