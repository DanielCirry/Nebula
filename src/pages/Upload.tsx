import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { PortfolioData } from '../../shared/types'

export default function Upload() {
  const [adminPassword, setAdminPassword] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const [authStatus, setAuthStatus] = useState<{ hasAdminPassword: boolean; hasPersonalPasscode: boolean } | null>(null)
  const [hasPortfolio, setHasPortfolio] = useState(false)
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)


  // Edit state
  const [editSection, setEditSection] = useState<string | null>(null)
  const [editJson, setEditJson] = useState('')
  const [editStatus, setEditStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const fetchData = () => {
    fetch('/api/data').then(r => {
      if (r.ok) return r.json()
      return null
    }).then((data: PortfolioData | null) => {
      if (data) {
        setHasPortfolio(true)
        setPortfolio(data)
      }
    }).catch(() => {})
  }

  const fetchAuthStatus = () => {
    fetch('/api/auth-status')
      .then(r => r.json())
      .then(data => {
        setAuthStatus(data)
        setHasPortfolio(true)
      })
      .catch(() => setHasPortfolio(false))
  }

  useEffect(() => {
    fetchData()
    fetchAuthStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setStatus('uploading')
    setErrorMsg('')

    const formData = new FormData()
    formData.append('file', file)
    if (adminPassword) formData.append('adminPassword', adminPassword)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const msg = res.status === 401 ? 'Invalid admin password' : 'Upload failed'
        setErrorMsg(msg)
        setStatus('error')
        return
      }

      setStatus('success')
      setTimeout(() => { navigate('/'); window.location.href = '/' }, 800)
    } catch {
      setErrorMsg('Unable to connect')
      setStatus('error')
    }
  }

  const handleEdit = (section: string) => {
    if (!portfolio) return
    setEditSection(section)
    setEditJson(JSON.stringify((portfolio as any)[section], null, 2))
    setEditStatus('idle')
  }

  const handleSaveEdit = async () => {
    if (!editSection) return
    setEditStatus('saving')
    try {
      const parsed = JSON.parse(editJson)
      const res = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword, data: { [editSection]: parsed } }),
      })
      if (!res.ok) { setEditStatus('error'); return }
      setPortfolio(prev => prev ? { ...prev, [editSection]: parsed } : prev)
      setEditStatus('saved')
      setTimeout(() => setEditSection(null), 1000)
    } catch {
      setEditStatus('error')
    }
  }

  const editableSections = portfolio
    ? ['profile', 'skills', 'experience', 'education', 'projects', 'other'].filter(
        s => (portfolio as any)[s] !== undefined
      )
    : []

  const inputClass = 'w-full px-4 py-2.5 rounded-lg glass text-text-primary placeholder:text-text-muted focus:outline-none transition-colors'
  const btnSecondary = 'w-full py-2.5 rounded-lg border border-border text-text-secondary hover:border-accent/40 hover:text-accent transition-colors cursor-pointer text-sm'
  const btnSmall = 'px-4 py-2 rounded-lg bg-accent text-bg font-medium hover:bg-accent/80 transition-colors cursor-pointer text-sm'

  return (
    <div className="min-h-screen overflow-y-auto px-6 py-12">
      <div className="w-full max-w-md mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors text-xs mb-6"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Portfolio
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-accent">Upload CV</h1>
        <p className="text-text-muted text-sm mb-8">
          Upload a DOCX file to generate your portfolio site.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {authStatus?.hasAdminPassword && (
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Admin Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className={inputClass}
                placeholder="Required — portfolio is password-protected"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">CV File (.docx or .pdf)</label>
            <input ref={fileRef} type="file" accept=".docx,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full px-4 py-8 rounded-lg border-2 border-dashed border-border hover:border-accent/30 transition-colors text-center"
            >
              {file ? <span className="text-text-primary">{file.name}</span> : <span className="text-text-muted">Click to select a .docx or .pdf file</span>}
            </button>
          </div>

          <button
            type="submit"
            disabled={status === 'uploading' || !file}
            className="w-full py-3 rounded-lg bg-accent text-bg font-medium hover:bg-accent/80 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {status === 'uploading' ? 'Processing...' : status === 'success' ? 'Done!' : 'Upload & Generate'}
          </button>

          {errorMsg && <p className="text-sm text-red-400 text-center">{errorMsg}</p>}
          {status === 'success' && <p className="text-sm text-accent text-center">Portfolio generated! Redirecting...</p>}
        </form>

        {/* Post-upload management */}
        {hasPortfolio && (
          <div className="mt-12 space-y-4 pb-12">
            {/* Edit Sections */}
            {portfolio && (
              <div>
                <p className="text-sm text-text-secondary mb-2">Edit Sections</p>
                <div className="grid grid-cols-2 gap-2">
                  {editableSections.map(section => (
                    <button key={section} onClick={() => handleEdit(section)}
                      className={`${btnSecondary} capitalize`}>
                      {section}
                    </button>
                  ))}
                </div>

                {editSection && (
                  <div className="mt-4 p-4 rounded-lg glass">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-accent capitalize">{editSection}</h3>
                      <button onClick={() => setEditSection(null)} className="text-xs text-text-muted hover:text-text-secondary">Close</button>
                    </div>
                    <textarea value={editJson} onChange={e => setEditJson(e.target.value)} rows={16}
                      className={`${inputClass} text-xs font-mono resize-y`} />
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={handleSaveEdit} disabled={editStatus === 'saving'} className={btnSmall}>
                        {editStatus === 'saving' ? 'Saving...' : editStatus === 'saved' ? 'Saved!' : 'Save'}
                      </button>
                      {editStatus === 'error' && <span className="text-xs text-red-400">Failed — check JSON syntax</span>}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
