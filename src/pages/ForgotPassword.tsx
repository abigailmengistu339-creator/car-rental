// ============================================
// Forgot Password Page
// ============================================

import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/lib/auth'
import { Car, KeyRound, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    const result = await resetPassword(email.trim())
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSubmitted(true)
    }
  }

  return (
    <div className="auth-page">
      {/* Left Panel — Branding */}
      <div className="auth-brand-panel">
        <div className="auth-brand-bg-orb auth-orb-1" />
        <div className="auth-brand-bg-orb auth-orb-2" />
        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <Car size={32} strokeWidth={2} />
          </div>
          <h1>Fleet Directory</h1>
          <p>Recover access to your account quickly and securely. We'll send you a password reset link.</p>
          <div className="auth-brand-features">
            <div className="auth-brand-feature">
              <span className="auth-brand-feature-dot" />
              End-to-end encrypted recovery
            </div>
            <div className="auth-brand-feature">
              <span className="auth-brand-feature-dot" />
              Quick 15-minute reset window
            </div>
            <div className="auth-brand-feature">
              <span className="auth-brand-feature-dot" />
              Role & session protected
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Reset Password</h2>
            <p>Enter your registered email address and we'll send you recovery instructions.</p>
          </div>

          {submitted ? (
            <div className="auth-success-card">
              <CheckCircle2 size={44} className="auth-success-icon" />
              <h3>Check your email</h3>
              <p>
                We've sent a password reset link to <strong>{email}</strong> if an account exists for this address.
              </p>
              <div className="auth-actions-group">
                <button
                  type="button"
                  className="auth-secondary-btn"
                  onClick={() => {
                    setSubmitted(false)
                    setEmail('')
                  }}
                >
                  Try another email
                </button>
                <Link to="/login" className="auth-primary-btn-link">
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="auth-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="reset-email">Email Address</label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
                id="reset-submit"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="auth-spinner" />
                    Sending link...
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          )}

          <div className="auth-footer-text">
            Remembered your password?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>

          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
