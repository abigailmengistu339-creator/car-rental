import { useNavigate } from 'react-router'
import { Car, Compass, ArrowLeft, LayoutDashboard } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--background)',
        color: 'var(--foreground)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '40px 32px',
          borderRadius: '24px',
          background: 'var(--card-bg)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'rgba(217, 119, 6, 0.12)',
            color: 'var(--primary)',
            marginBottom: '20px',
          }}
        >
          <Compass size={32} strokeWidth={2.2} />
        </div>

        <div
          style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: 'var(--primary)',
            marginBottom: '8px',
          }}
        >
          404
        </div>

        <h1
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            marginBottom: '10px',
            letterSpacing: '-0.02em',
          }}
        >
          Page Not Found
        </h1>

        <p
          style={{
            fontSize: '0.925rem',
            color: 'var(--muted-foreground)',
            marginBottom: '28px',
            lineHeight: 1.5,
          }}
        >
          The fleet coordinates you requested don't exist or have been moved to another terminal.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'inherit',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary-apple"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              cursor: 'pointer',
            }}
          >
            <LayoutDashboard size={16} />
            <span>Fleet Dashboard</span>
          </button>
        </div>

        <div
          style={{
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--muted-foreground)',
            fontSize: '0.8rem',
          }}
        >
          <Car size={14} />
          <span>Fleet Directory PRO &copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  )
}
