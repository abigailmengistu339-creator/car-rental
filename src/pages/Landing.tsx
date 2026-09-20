// ============================================
// Landing Page — Premium Fleet Directory Hero
// ============================================

import { useNavigate } from 'react-router'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import {
  Car,
  Shield,
  BarChart3,
  FileCheck,
  ArrowRight,
  Zap,
  Globe,
  Lock,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react'
import { useEffect, useState } from 'react'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { resolvedTheme, toggleTheme } = useTheme()

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const features = [
    {
      icon: Car,
      title: 'Fleet Tracking',
      description: 'Monitor your entire fleet in real-time with categorized views, instant search, and detailed vehicle profiles.',
      gradient: 'feature-gradient-amber',
    },
    {
      icon: FileCheck,
      title: 'Document Vault',
      description: 'Securely upload and manage Libre (logbook) and insurance documents with automatic compliance tracking.',
      gradient: 'feature-gradient-emerald',
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Track compliance rates, fleet distribution, and operational status with live dashboard widgets.',
      gradient: 'feature-gradient-blue',
    },
    {
      icon: Shield,
      title: 'Role-Based Security',
      description: 'Admin and viewer roles ensure the right people have the right access. Full audit trail included.',
      gradient: 'feature-gradient-purple',
    },
  ]

  const stats = [
    { value: 500, suffix: '+', label: 'Vehicles Managed' },
    { value: 99, suffix: '%', label: 'Uptime SLA' },
    { value: 50, suffix: 'K+', label: 'Documents Processed' },
    { value: 24, suffix: '/7', label: 'Support Coverage' },
  ]

  return (
    <div className="landing-page">
      {/* Floating background orbs */}
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-brand" onClick={() => navigate('/')}>
            <div className="landing-brand-icon">
              <Car size={20} strokeWidth={2.2} />
            </div>
            <span className="landing-brand-text">Fleet Directory</span>
            <span className="landing-brand-badge">PRO</span>
          </div>

          <div className="landing-nav-actions">
            <button
              className="landing-theme-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="landing-btn-ghost"
              onClick={() => navigate('/login')}
              id="landing-sign-in"
            >
              Sign In
            </button>
            <button
              className="landing-btn-primary"
              onClick={() => navigate('/signup')}
              id="landing-get-started"
            >
              Get Started
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <Zap size={14} />
            <span>Enterprise Fleet Management Platform</span>
          </div>

          <h1 className="landing-hero-title">
            Manage Your Fleet
            <br />
            <span className="landing-hero-accent">With Precision</span>
          </h1>

          <p className="landing-hero-subtitle">
            The all-in-one platform for vehicle tracking, document compliance,
            and operational intelligence. Built for fleet operators who demand excellence.
          </p>

          <div className="landing-hero-cta">
            <button
              className="landing-btn-primary landing-btn-lg"
              onClick={() => navigate('/signup')}
              id="hero-get-started"
            >
              Start Free Trial
              <ChevronRight size={18} />
            </button>
            <button
              className="landing-btn-outline landing-btn-lg"
              onClick={() => navigate('/login')}
              id="hero-sign-in"
            >
              Sign In to Dashboard
            </button>
          </div>

          <div className="landing-hero-trust">
            <div className="landing-trust-avatars">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="landing-trust-avatar" style={{ '--i': i } as React.CSSProperties}>
                  {String.fromCodePoint(0x1F464)}
                </div>
              ))}
            </div>
            <span className="landing-trust-text">
              Trusted by <strong>200+</strong> fleet operators worldwide
            </span>
          </div>
        </div>

        {/* Hero Visual — Dashboard Preview Card */}
        <div className="landing-hero-visual">
          <div className="landing-dashboard-card">
            <div className="landing-dash-header">
              <div className="landing-dash-dots">
                <span /><span /><span />
              </div>
              <span className="landing-dash-title">Fleet Overview</span>
            </div>
            <div className="landing-dash-content">
              <div className="landing-dash-stat-row">
                <div className="landing-dash-stat">
                  <span className="landing-dash-stat-value">8</span>
                  <span className="landing-dash-stat-label">Active Vehicles</span>
                </div>
                <div className="landing-dash-stat">
                  <span className="landing-dash-stat-value">92%</span>
                  <span className="landing-dash-stat-label">Compliance</span>
                </div>
                <div className="landing-dash-stat">
                  <span className="landing-dash-stat-value">12</span>
                  <span className="landing-dash-stat-label">Contacts</span>
                </div>
              </div>
              <div className="landing-dash-bars">
                <div className="landing-dash-bar">
                  <span>76 Market</span>
                  <div className="landing-dash-bar-track">
                    <div className="landing-dash-bar-fill" style={{ width: '38%' }} />
                  </div>
                </div>
                <div className="landing-dash-bar">
                  <span>78 Market</span>
                  <div className="landing-dash-bar-track">
                    <div className="landing-dash-bar-fill bar-fill-emerald" style={{ width: '38%' }} />
                  </div>
                </div>
                <div className="landing-dash-bar">
                  <span>79 Pickup</span>
                  <div className="landing-dash-bar-track">
                    <div className="landing-dash-bar-fill bar-fill-blue" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats">
        {stats.map((stat, i) => (
          <div key={i} className="landing-stat-item">
            <div className="landing-stat-value">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </div>
            <div className="landing-stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-section-header">
          <span className="landing-section-badge">Features</span>
          <h2 className="landing-section-title">
            Everything You Need to
            <br />
            <span className="landing-hero-accent">Run Your Fleet</span>
          </h2>
          <p className="landing-section-desc">
            From real-time tracking to document management, we've built every tool
            fleet operators need — so you can focus on what matters.
          </p>
        </div>

        <div className="landing-features-grid">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div key={i} className={`landing-feature-card ${feature.gradient}`}>
                <div className="landing-feature-icon">
                  <Icon size={24} strokeWidth={1.8} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Security Section */}
      <section className="landing-security">
        <div className="landing-security-inner">
          <div className="landing-security-content">
            <span className="landing-section-badge">Enterprise Security</span>
            <h2>
              Built for Teams
              <br />
              <span className="landing-hero-accent">That Take Security Seriously</span>
            </h2>
            <p>
              Role-based access control, encrypted document storage, and complete audit trails.
              Your fleet data stays protected with enterprise-grade security.
            </p>
            <div className="landing-security-checks">
              {[
                'Admin & viewer role separation',
                'Encrypted document uploads',
                'Row-level security on all data',
                'Secure authentication with Supabase',
              ].map((item, i) => (
                <div key={i} className="landing-security-check">
                  <Lock size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="landing-security-visual">
            <div className="landing-shield-container">
              <Shield size={80} strokeWidth={1} />
              <Globe size={32} className="landing-shield-globe" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <h2>Ready to Streamline Your Fleet?</h2>
        <p>Join hundreds of fleet operators who trust Fleet Directory to manage their operations.</p>
        <div className="landing-cta-buttons">
          <button
            className="landing-btn-primary landing-btn-lg"
            onClick={() => navigate('/signup')}
          >
            Get Started Free
            <ArrowRight size={18} />
          </button>
          <button
            className="landing-btn-ghost landing-btn-lg"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <Car size={18} />
            <span>Fleet Directory</span>
          </div>
          <span className="landing-footer-copy">
            © {new Date().getFullYear()} Fleet Directory. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  )
}
