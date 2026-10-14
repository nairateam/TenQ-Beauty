/** Adds an email to the newsletter list in Payload. Resolves false if the server refused it. */
export async function subscribe(email: string, source: 'footer' | 'journal') {
  try {
    const res = await fetch('/api/subscribers/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source }),
    })
    return res.ok
  } catch {
    return false
  }
}
