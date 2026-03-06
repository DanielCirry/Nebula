import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ContactData, RevealContactResponse } from '../../shared/types'

function ContactField({ label, value }: { label: string; value: string }) {
  const isEmail = label.toLowerCase() === 'email'
  const isLink = value.startsWith('http') || label.toLowerCase() === 'linkedin'

  return (
    <p>
      <span className="text-text-muted text-xs block mb-0.5">{label}</span>
      {isEmail ? (
        <a href={`mailto:${value}`} className="text-accent hover:text-accent-warm transition-colors">{value}</a>
      ) : isLink ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-warm transition-colors">{value}</a>
      ) : (
        <span className="text-text-primary">{value}</span>
      )}
    </p>
  )
}

function ContactFields({ data }: { data: Record<string, string> }) {
  const order = ['location', 'email', 'phone', 'linkedin']
  const sorted = [
    ...order.filter((k) => data[k]),
    ...Object.keys(data).filter((k) => !order.includes(k)),
  ]

  return (
    <div className="space-y-4">
      {sorted.map((key) => (
        <ContactField key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={data[key]} />
      ))}
    </div>
  )
}

export default function Contact({ contact }: { contact?: ContactData }) {
  const [passcode, setPasscode] = useState('')
  const [revealed, setRevealed] = useState<RevealContactResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // No contact data at all
  if (!contact) return <p className="text-text-muted text-sm text-center">No contact information available.</p>

  // Plain contact — show directly
  if (!contact.encrypted) {
    const data = contact.data as Record<string, string>
    if (!data || Object.keys(data).length === 0) return null

    return (
      <div className="max-w-md mx-auto text-center">
        <ContactFields data={data} />
      </div>
    )
  }

  const handleReveal = async () => {
    if (!passcode.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reveal-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      })
      if (!res.ok) {
        setError(res.status === 401 ? 'Incorrect passcode' : 'Something went wrong')
        return
      }
      setRevealed(await res.json())
    } catch {
      setError('Unable to connect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div key="form" className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-text-muted text-sm mb-5">Enter the passcode to reveal personal information.</p>
            <div className="flex gap-2">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReveal()}
                placeholder="Passcode"
                aria-label="Contact passcode"
                className="flex-1 px-4 py-2.5 text-text-primary placeholder:text-text-muted/40 rounded-lg focus:outline-none transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              />
              <motion.button
                onClick={handleReveal}
                disabled={loading}
                className="relative px-5 py-2.5 font-medium disabled:opacity-50 cursor-pointer text-sm rounded-lg overflow-hidden"
                style={{
                  background: 'rgba(0,212,255,0.06)',
                  border: '1px solid rgba(0,212,255,0.3)',
                  color: '#00d4ff',
                }}
                whileHover={{
                  borderColor: 'rgba(0,212,255,0.8)',
                  boxShadow: '0 0 25px rgba(0,212,255,0.15)',
                }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? '...' : 'Reveal'}
              </motion.button>
            </div>
            {error && (
              <motion.p className="mt-3 text-xs text-red-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {error}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div key="revealed" className="text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ContactFields data={revealed as Record<string, string>} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
