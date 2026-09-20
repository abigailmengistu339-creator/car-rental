import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Search, X, Plus } from 'lucide-react'
import { ContactCard } from '@/components/contacts/ContactCard'
import { useProfiles } from '@/hooks/useProfiles'
import { useAuth } from '@/lib/auth'
import { UserRole } from '@/lib/types'

export default function Contacts() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [activeRole, setActiveRole] = useState<UserRole | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')
  const { profiles, loading } = useProfiles(activeRole)

  // Get all counts
  const { profiles: allProfiles } = useProfiles()
  const driverCount = allProfiles.filter((p) => p.role === UserRole.Driver).length
  const clientCount = allProfiles.filter((p) => p.role === UserRole.Client).length
  const vendorCount = allProfiles.filter((p) => p.role === UserRole.Vendor).length

  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles
    const q = searchQuery.toLowerCase()
    return profiles.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        (p.phone_number && p.phone_number.toLowerCase().includes(q))
    )
  }, [profiles, searchQuery])

  return (
    <div className="page-container">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-title-group">
          <h1>Directory & Contacts</h1>
          <p>Direct communication channels, driver profiles, and client directory</p>
        </div>

        <div className="dash-actions-row">
          {/* Spotlight Search */}
          <div className="search-spotlight">
            <Search size={16} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="contacts-search"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {isAdmin && (
            <button
              className="btn-primary-apple"
              onClick={() => navigate('/add')}
              id="add-contact-btn"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Contact</span>
            </button>
          )}
        </div>
      </div>

      {/* Apple-Style Role Segmented Filter */}
      <div className="role-segmented-tabs" role="tablist">
        <button
          className={`role-tab-btn ${activeRole === undefined ? 'active' : ''}`}
          onClick={() => setActiveRole(undefined)}
          id="tab-all"
        >
          All ({allProfiles.length})
        </button>
        <button
          className={`role-tab-btn ${activeRole === UserRole.Driver ? 'active' : ''}`}
          onClick={() => setActiveRole(UserRole.Driver)}
          id="tab-drivers"
        >
          Drivers ({driverCount})
        </button>
        <button
          className={`role-tab-btn ${activeRole === UserRole.Client ? 'active' : ''}`}
          onClick={() => setActiveRole(UserRole.Client)}
          id="tab-clients"
        >
          Clients ({clientCount})
        </button>
        <button
          className={`role-tab-btn ${activeRole === UserRole.Vendor ? 'active' : ''}`}
          onClick={() => setActiveRole(UserRole.Vendor)}
          id="tab-vendors"
        >
          Vendors ({vendorCount})
        </button>
      </div>

      {/* Contacts Grid */}
      <div className="contacts-grid">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-box" style={{ height: 80 }} />
          ))
        ) : filteredProfiles.length === 0 ? (
          <div className="empty-view-card" style={{ gridColumn: '1 / -1' }}>
            <p>No contacts found matching your search</p>
          </div>
        ) : (
          filteredProfiles.map((profile) => (
            <ContactCard key={profile.id} profile={profile} />
          ))
        )}
      </div>
    </div>
  )
}
