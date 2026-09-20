// ============================================
// Reset Password Page
// ============================================

import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '@/lib/auth'
import { Car, Eye, EyeOff, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const result = await updatePassword(password)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)
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
          <p>Choose a new, strong password to secure your account and restore access to your fleet.</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Set New Password</h2>
            <p>Please enter your new password below</p>
          </div>

          {success ? (
            <div className="auth-success-card">
              <CheckCircle2 size={44} className="auth-success-icon" />
              <h3>Password updated!</h3>
              <p>Your password has been changed successfully. Redirecting you to sign in...</p>
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
                <label htmlFor="reset-new-password">New Password</label>
                <div className="auth-password-wrapper">
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    autoComplete="new-password"
                    autoFocus
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="reset-confirm-password">Confirm New Password</label>
                <input
                  id="reset-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
                id="update-password-submit"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="auth-spinner" />
                    Updating password...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Update Password
                  </>
                )}
              </button>
            </form>
          )}

          <div className="auth-footer-text">
            Already know your password?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
