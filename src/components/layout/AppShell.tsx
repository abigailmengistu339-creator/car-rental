import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { BottomNav } from './BottomNav'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { Car, LayoutDashboard, Users, PlusCircle, Sun, Moon, LogOut } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { useAuth } from '@/lib/auth'
import { useVehicles } from '@/hooks/useVehicles'
import { useProfiles } from '@/hooks/useProfiles'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { resolvedTheme, setTheme, toggleTheme } = useTheme()
  const { user, isAdmin, signOut } = useAuth()
  const { vehicles } = useVehicles()
  const { profiles } = useProfiles()

  const totalVehicles = vehicles.length
  const totalContacts = profiles.length
  const compliantVehicles = vehicles.filter((v) => v.libre_document_url && v.insurance_document_url).length
  const compliancePercent = totalVehicles > 0 ? Math.round((compliantVehicles / totalVehicles) * 100) : 100

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, count: totalVehicles },
    { path: '/contacts', label: 'Contacts', icon: Users, count: totalContacts },
    ...(isAdmin ? [{ path: '/add', label: 'Add New', icon: PlusCircle }] : []),
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      {/* Unified Desktop Sidebar */}
      <aside className="app-sidebar" aria-label="Desktop Sidebar">
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-emblem" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <Car size={20} strokeWidth={2.2} />
          </div>
          <div className="brand-info">
            <div className="brand-title-row">
              <span className="brand-title" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                Fleet Directory
              </span>
              <span className="brand-badge">PRO</span>
            </div>
            <span className="brand-sub">Enterprise Operations</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Management</span>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                id={`sidebar-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <div className="sidebar-link-content">
                  <Icon size={18} className="sidebar-link-icon" strokeWidth={isActive ? 2.4 : 1.8} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="sidebar-counter">{item.count}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer: Health Widget, Theme Switcher & User Profile */}
        <div className="sidebar-footer">
          <div className="sidebar-status-card">
            <div className="status-header">
              <span>System Status</span>
              <div className="pulse-dot" title="Live operational" />
            </div>
            <div className="status-value-row">
              <span className="status-main">Docs Compliance</span>
              <span className="status-tag">{compliancePercent}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${compliancePercent}%` }} />
            </div>
          </div>

          {/* Apple Segmented Theme Toggle */}
          <div className="segmented-toggle" role="group" aria-label="Theme selector">
            <button
              className={`segmented-toggle-btn ${resolvedTheme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
              id="theme-light-btn"
            >
              <Sun size={14} />
              <span>Light</span>
            </button>
            <button
              className={`segmented-toggle-btn ${resolvedTheme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
              id="theme-dark-btn"
            >
              <Moon size={14} />
              <span>Dark</span>
            </button>
          </div>

          {/* Authenticated User & Sign Out Widget */}
          {user && (
            <div className="sidebar-user-footer">
              <div className="sidebar-user-info">
                <div className="sidebar-user-avatar">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="sidebar-user-text">
                  <span className="sidebar-user-email" title={user.email}>
                    {user.email}
                  </span>
                  <div>
                    <span className={isAdmin ? 'role-badge-admin' : 'role-badge-user'}>
                      {isAdmin ? 'Admin' : 'Viewer'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="sidebar-signout-btn"
                onClick={handleSignOut}
                title="Sign Out"
                aria-label="Sign Out"
                id="sidebar-signout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sticky Header */}
      <header className="mobile-header">
        <div className="mobile-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-emblem" style={{ width: 32, height: 32, borderRadius: 10 }}>
            <Car size={16} strokeWidth={2.2} />
          </div>
          <span className="mobile-brand-title">Fleet Directory</span>
        </div>
        <div className="mobile-actions">
          {user && (
            <span className={isAdmin ? 'role-badge-admin' : 'role-badge-user'}>
              {isAdmin ? 'Admin' : 'Viewer'}
            </span>
          )}
          <button
            className="icon-toggle-btn"
            onClick={toggleTheme}
            id="mobile-theme-toggle"
            aria-label="Toggle Theme"
          >
            {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user && (
            <button
              className="icon-toggle-btn"
              onClick={handleSignOut}
              id="mobile-signout"
              aria-label="Sign Out"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        {children}
      </main>

      {/* Mobile Floating Dock */}
      <BottomNav />

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  )
}
