import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import {
  Search,
  Car,
  Users,
  PlusCircle,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react'
import { useVehicles } from '@/hooks/useVehicles'
import { useProfiles } from '@/hooks/useProfiles'
import { useTheme } from '@/lib/theme'
import { useAuth } from '@/lib/auth'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { vehicles } = useVehicles()
  const { profiles } = useProfiles()
  const { setTheme } = useTheme()
  const { isAdmin } = useAuth()

  // Listen for Cmd+K / Ctrl+K and custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    const handleCustomOpen = () => setIsOpen(true)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-command-palette', handleCustomOpen)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-command-palette', handleCustomOpen)
    }
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Build searchable items
  interface CommandItem {
    id: string
    title: string
    subtitle?: string
    category: 'Navigation' | 'Actions' | 'Vehicles' | 'Drivers'
    icon: React.ComponentType<{ size: number; className?: string }>
    action: () => void
  }

  const items: CommandItem[] = [
    {
      id: 'nav-dash',
      title: 'Dashboard Overview',
      subtitle: 'Fleet status and vehicle categories',
      category: 'Navigation',
      icon: Car,
      action: () => navigate('/dashboard'),
    },
    {
      id: 'nav-contacts',
      title: 'Directory & Contacts',
      subtitle: 'Manage drivers, clients, and vendors',
      category: 'Navigation',
      icon: Users,
      action: () => navigate('/contacts'),
    },
    ...(isAdmin
      ? [
          {
            id: 'nav-add',
            title: 'Add New Record',
            subtitle: 'Register new vehicle or driver',
            category: 'Navigation' as const,
            icon: PlusCircle,
            action: () => navigate('/add'),
          },
        ]
      : []),
    {
      id: 'act-dark',
      title: 'Switch to Dark Mode',
      subtitle: 'Apple Obsidian Theme',
      category: 'Actions',
      icon: Moon,
      action: () => setTheme('dark'),
    },
    {
      id: 'act-light',
      title: 'Switch to Light Mode',
      subtitle: 'Apple Ceramic Snow Theme',
      category: 'Actions',
      icon: Sun,
      action: () => setTheme('light'),
    },
  ]

  // Add vehicles
  vehicles.forEach((v) => {
    items.push({
      id: `v-${v.id}`,
      title: `Vehicle: ${v.plate_number}`,
      subtitle: `${v.driver ? `Driver: ${v.driver.full_name}` : 'Unassigned'} · ${v.current_location || 'No location'}`,
      category: 'Vehicles',
      icon: Car,
      action: () => {
        if (v.driver) navigate(`/profile/${v.driver.id}`)
        else navigate('/dashboard')
      },
    })
  })

  // Add drivers
  profiles.forEach((p) => {
    items.push({
      id: `p-${p.id}`,
      title: `${p.full_name} (${p.role})`,
      subtitle: p.phone_number || 'No phone recorded',
      category: 'Drivers',
      icon: Users,
      action: () => navigate(`/profile/${p.id}`),
    })
  })

  const filteredItems = items.filter((item) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    )
  })

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => (i + 1) % Math.max(1, filteredItems.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => (i - 1 + filteredItems.length) % Math.max(1, filteredItems.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = filteredItems[selectedIndex]
      if (selected) {
        selected.action()
        setIsOpen(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 20px 20px',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'fade-in 0.15s ease',
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
          animation: 'fade-in-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <Search size={18} className="text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands, plate numbers, drivers..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--foreground)',
              fontSize: '1rem',
              fontWeight: 500,
            }}
            id="command-palette-input"
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              borderRadius: '6px',
              background: 'var(--muted)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--muted-foreground)',
            }}
          >
            <span>ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? 'color-mix(in srgb, var(--primary) 14%, var(--muted))' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    item.action()
                    setIsOpen(false)
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isSelected ? 'var(--primary)' : 'var(--muted)',
                        color: isSelected ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 120ms ease',
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 600 : 500,
                          color: 'var(--foreground)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            color: 'var(--muted-foreground)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--muted-foreground)',
                        background: 'var(--muted)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight size={14} className="text-primary" />}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 18px',
            borderTop: '1px solid var(--border)',
            fontSize: '0.6875rem',
            color: 'var(--muted-foreground)',
            backgroundColor: 'var(--muted)',
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>Spotlight Command</span>
        </div>
      </div>
    </div>
  )
}
