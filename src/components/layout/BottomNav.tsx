import { useLocation, useNavigate } from 'react-router'
import { LayoutDashboard, Users, PlusCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/contacts', label: 'Contacts', icon: Users },
    ...(isAdmin ? [{ path: '/add', label: 'Add New', icon: PlusCircle }] : []),
  ]

  return (
    <nav className="mobile-dock" aria-label="Mobile Navigation">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        const Icon = item.icon
        return (
          <button
            key={item.path}
            id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            onClick={() => navigate(item.path)}
            className={`mobile-dock-btn ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            <span className="mobile-dock-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
