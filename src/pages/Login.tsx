// ============================================
// Login Page
// ============================================

import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router'
import { useAuth } from '@/lib/auth'
import { Car, Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, user } = useAuth()
  const { success: showSuccess } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    const result = await signIn(email.trim(), password)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      showSuccess('Welcome back!')
      navigate('/dashboard', { replace: true })
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
          <p>Enterprise fleet management, document compliance, and operational intelligence — all in one platform.</p>
          <div className="auth-brand-features">
            <div className="auth-brand-feature">
              <span className="auth-brand-feature-dot" />
              Real-time vehicle tracking
            </div>
            <div className="auth-brand-feature">
              <span className="auth-brand-feature-dot" />
              Secure document vault
            </div>
            <div className="auth-brand-feature">
              <span className="auth-brand-feature-dot" />
              Role-based access control
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to access your fleet dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <div className="auth-field-header">
                <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="auth-forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div className="auth-password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="auth-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Create one
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
