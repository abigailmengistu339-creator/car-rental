// ============================================
// Sign Up Page
// ============================================

import { useState, useMemo } from 'react'
import { useNavigate, Link, Navigate } from 'react-router'
import { useAuth } from '@/lib/auth'
import { Car, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp, user } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  // Password strength calculation
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' }
    let s = 0
    if (password.length >= 8) s += 1
    if (/[A-Z]/.test(password)) s += 1
    if (/[0-9]/.test(password)) s += 1
    if (/[^A-Za-z0-9]/.test(password)) s += 1

    if (s <= 1) return { score: 1, label: 'Weak', color: 'var(--color-danger, #ef4444)' }
    if (s === 2) return { score: 2, label: 'Fair', color: 'var(--color-warning, #f59e0b)' }
    if (s === 3) return { score: 3, label: 'Good', color: '#3b82f6' }
    return { score: 4, label: 'Strong', color: 'var(--color-success, #10b981)' }
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const result = await signUp(email.trim(), password, fullName.trim())
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 1200)
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
          <p>Join the next generation of fleet operations. Seamless compliance, instant driver assignments, and deep visibility.</p>
          <div className="auth-brand-features">
            <div className="auth-brand-feature">
              <span className="auth-brand-feature-dot" />
              Instant fleet onboarding
            </div>
            <div className="auth-brand-feature">
              <span className="auth-brand-feature-dot" />
              Real-time driver & vehicle sync
            </div>
            <div className="auth-brand-feature">
              <span className="auth-brand-feature-dot" />
              End-to-end document compliance
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Create an account</h2>
            <p>Get started with Fleet Directory today</p>
          </div>

          {success ? (
            <div className="auth-success-card">
              <CheckCircle2 size={40} className="auth-success-icon" />
              <h3>Account created successfully!</h3>
              <p>Redirecting you to your fleet dashboard...</p>
              <div className="auth-spinner-bar">
                <div className="auth-spinner-bar-fill" />
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
                <label htmlFor="signup-name">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Cooper"
                  autoComplete="name"
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="signup-email">Email Address</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="signup-password">Password</label>
                <div className="auth-password-wrapper">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    autoComplete="new-password"
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
                {password && (
                  <div className="password-strength-container">
                    <div className="password-strength-bars">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className="password-strength-bar"
                          style={{
                            backgroundColor:
                              step <= strength.score ? strength.color : 'var(--color-surface-hover, #333)',
                          }}
                        />
                      ))}
                    </div>
                    <span className="password-strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="signup-confirm-password">Confirm Password</label>
                <input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
                id="signup-submit"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="auth-spinner" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create Account
                  </>
                )}
              </button>
            </form>
          )}

          <div className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>

          <Link to="/" className="auth-back-link">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
