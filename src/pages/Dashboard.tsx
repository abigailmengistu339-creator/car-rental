import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Car,
  Users,
  Search,
  X,
  Plus,
  LayoutGrid,
  List,
  Download,
  Command,
} from 'lucide-react'
import { VehicleCategorySection } from '@/components/vehicles/VehicleCategorySection'
import { VehicleTableView } from '@/components/vehicles/VehicleTableView'
import { useVehicles } from '@/hooks/useVehicles'
import { useProfiles } from '@/hooks/useProfiles'
import { useAuth } from '@/lib/auth'
import { ModelCategory, UserRole } from '@/lib/types'

function getGreeting(): { text: string; emoji: string; sub: string } {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good morning', emoji: '☀️', sub: 'Ready to manage your fleet today?' }
  if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️', sub: 'Your fleet status is looking great.' }
  if (hour < 21) return { text: 'Good evening', emoji: '🌆', sub: 'Here\'s your fleet at a glance.' }
  return { text: 'Good night', emoji: '🌙', sub: 'Wrapping up? Here\'s your fleet summary.' }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { vehicles } = useVehicles()
  const { profiles } = useProfiles()
  const { isAdmin, user } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory | 'ALL'>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const totalVehicles = vehicles.length
  const totalDrivers = profiles.filter((p) => p.role === UserRole.Driver).length
  const missingDocsCount = vehicles.filter(
    (v) => !v.libre_document_url || !v.insurance_document_url
  ).length
  const compliantCount = totalVehicles - missingDocsCount
  const complianceRate = totalVehicles > 0 ? Math.round((compliantCount / totalVehicles) * 100) : 100

  // Category counts
  const cat76Count = vehicles.filter((v) => v.model_category === ModelCategory.Market76).length
  const cat78Count = vehicles.filter((v) => v.model_category === ModelCategory.Market78).length
  const cat79Count = vehicles.filter((v) => v.model_category === ModelCategory.Pickup79).length
  const cat105Count = vehicles.filter((v) => v.model_category === ModelCategory.Series105).length

  // Filter vehicles for Table View
  const filteredVehiclesForTable = vehicles.filter((v) => {
    if (selectedCategory !== 'ALL' && v.model_category !== selectedCategory) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      v.plate_number.toLowerCase().includes(q) ||
      (v.driver?.full_name && v.driver.full_name.toLowerCase().includes(q)) ||
      (v.current_location && v.current_location.toLowerCase().includes(q))
    )
  })

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = ['Plate Number', 'Category', 'Operational Status', 'Driver Name', 'Driver Phone', 'Location', 'Libre (Logbook)', 'Insurance Status']
    const rows = vehicles.map((v) => [
      `"${v.plate_number}"`,
      `"${v.model_category}"`,
      `"${v.operational_status || 'Available'}"`,
      `"${v.driver?.full_name || 'Unassigned'}"`,
      `"${v.driver?.phone_number || ''}"`,
      `"${v.current_location || ''}"`,
      `"${v.libre_document_url ? 'Verified' : 'Missing'}"`,
      `"${v.insurance_document_url ? 'Active' : 'Missing'}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `fleet_audit_report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Open Command Palette
  const openCommandPalette = () => {
    window.dispatchEvent(new Event('open-command-palette'))
  }

  // SVG Circular Gauge calculations
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (complianceRate / 100) * circumference

  const greeting = getGreeting()
  const userName = user?.email?.split('@')[0] || 'there'

  return (
    <div className="page-container">
      {/* Greeting Banner */}
      <div className="greeting-banner">
        <div className="greeting-text">
          <h2>{greeting.text}, {userName}</h2>
          <p>{greeting.sub}</p>
        </div>
        <span className="greeting-emoji">{greeting.emoji}</span>
      </div>

      {/* Top Header & Quick Action Row */}
      <div className="dash-header">
        <div className="dash-title-group">
          <h1>Fleet Overview</h1>
          <p>Real-time vehicle telemetry, driver allocation & documentation compliance</p>
        </div>

        <div className="dash-actions-row">
          {/* Spotlight Quick Search */}
          <div className="search-spotlight">
            <Search size={16} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search plate, driver, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="dashboard-search-input"
            />
            {searchQuery ? (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            ) : (
              <button
                onClick={openCommandPalette}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--muted-foreground)',
                  cursor: 'pointer',
                }}
                title="Open Command Palette (⌘K)"
              >
                <Command size={11} />
                <span>K</span>
              </button>
            )}
          </div>

          {/* Admin Actions: Export Report & Add Vehicle */}
          {isAdmin && (
            <>
              <button
                className="btn-primary-apple"
                style={{
                  background: 'var(--card)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  boxShadow: 'none',
                }}
                onClick={handleExportCSV}
                title="Export full fleet audit report to CSV"
                id="export-csv-btn"
              >
                <Download size={15} />
                <span>Export CSV</span>
              </button>

              <button
                className="btn-primary-apple"
                onClick={() => navigate('/add')}
                id="add-vehicle-btn"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Add Vehicle</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Apple Health / macOS Style Widget Metrics */}
      <div className="widgets-grid">
        {/* Widget 1: Fleet Volume */}
        <div className="widget-card">
          <div className="widget-top">
            <span className="widget-label">Total Fleet</span>
            <div className="widget-icon-pill widget-icon-amber">
              <Car size={18} strokeWidth={2.2} />
            </div>
          </div>
          <div className="widget-val-row">
            <span className="widget-value">{totalVehicles}</span>
            <span className="widget-meta">Vehicles Online</span>
          </div>
          <div className="widget-sub">
            <span className="widget-chip">{cat76Count} Market 76</span>
            <span className="widget-chip">{cat78Count} Market 78</span>
            <span className="widget-chip">{cat79Count} Pickup 79</span>
          </div>
        </div>

        {/* Widget 2: Driver Allocation */}
        <div className="widget-card">
          <div className="widget-top">
            <span className="widget-label">Active Drivers</span>
            <div className="widget-icon-pill widget-icon-emerald">
              <Users size={18} strokeWidth={2.2} />
            </div>
          </div>
          <div className="widget-val-row">
            <span className="widget-value">{totalDrivers}</span>
            <span className="widget-meta">100% Assigned</span>
          </div>
          <div className="widget-sub">
            <span className="widget-chip widget-chip-success">Full Coverage</span>
            <span className="widget-chip">All in Service</span>
          </div>
        </div>

        {/* Widget 3: Executive Compliance Circular Gauge */}
        <div className="widget-card">
          <div className="widget-top">
            <span className="widget-label">Executive Compliance</span>
            {/* Circular SVG Ring */}
            <div style={{ position: 'relative', width: '64px', height: '64px' }}>
              <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="var(--muted)"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke={complianceRate >= 80 ? 'var(--success)' : 'var(--warning)'}
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  color: 'var(--foreground)',
                }}
              >
                {complianceRate}%
              </div>
            </div>
          </div>
          <div className="widget-val-row">
            <span className="widget-meta">{compliantCount} of {totalVehicles} Verified</span>
          </div>
          <div className="widget-sub">
            {missingDocsCount > 0 ? (
              <span className="widget-chip widget-chip-danger">{missingDocsCount} Missing Docs</span>
            ) : (
              <span className="widget-chip widget-chip-success">100% Compliant</span>
            )}
            <span className="widget-chip">Libre & Insurance</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Category Tabs & View Switcher (Grid vs Table) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Category Filter Tabs */}
        <div className="role-segmented-tabs" role="tablist" style={{ flex: 1, minWidth: '280px' }}>
          <button
            className={`role-tab-btn ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
            id="cat-tab-all"
          >
            All Categories ({totalVehicles})
          </button>
          <button
            className={`role-tab-btn ${selectedCategory === ModelCategory.Market76 ? 'active' : ''}`}
            onClick={() => setSelectedCategory(ModelCategory.Market76)}
            id="cat-tab-76"
          >
            76 Mark II ({cat76Count})
          </button>
          <button
            className={`role-tab-btn ${selectedCategory === ModelCategory.Market78 ? 'active' : ''}`}
            onClick={() => setSelectedCategory(ModelCategory.Market78)}
            id="cat-tab-78"
          >
            78 Long Base ({cat78Count})
          </button>
          <button
            className={`role-tab-btn ${selectedCategory === ModelCategory.Pickup79 ? 'active' : ''}`}
            onClick={() => setSelectedCategory(ModelCategory.Pickup79)}
            id="cat-tab-79"
          >
            79 Pick Up ({cat79Count})
          </button>
          <button
            className={`role-tab-btn ${selectedCategory === ModelCategory.Series105 ? 'active' : ''}`}
            onClick={() => setSelectedCategory(ModelCategory.Series105)}
            id="cat-tab-105"
          >
            105 Series ({cat105Count})
          </button>
        </div>

        {/* View Switcher (Grid vs Compact Table) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '3px',
          }}
        >
          <button
            onClick={() => setViewMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            id="view-grid-btn"
          >
            <LayoutGrid size={14} />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: viewMode === 'table' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'table' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            id="view-table-btn"
          >
            <List size={14} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Main Content: Either Collapsible Category Sections OR Compact Table View */}
      {viewMode === 'grid' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(selectedCategory === 'ALL' || selectedCategory === ModelCategory.Market76) && (
            <VehicleCategorySection
              category={ModelCategory.Market76}
              searchQuery={searchQuery}
            />
          )}
          {(selectedCategory === 'ALL' || selectedCategory === ModelCategory.Market78) && (
            <VehicleCategorySection
              category={ModelCategory.Market78}
              searchQuery={searchQuery}
            />
          )}
          {(selectedCategory === 'ALL' || selectedCategory === ModelCategory.Pickup79) && (
            <VehicleCategorySection
              category={ModelCategory.Pickup79}
              searchQuery={searchQuery}
            />
          )}
          {(selectedCategory === 'ALL' || selectedCategory === ModelCategory.Series105) && (
            <VehicleCategorySection
              category={ModelCategory.Series105}
              searchQuery={searchQuery}
            />
          )}
        </div>
      ) : (
        <VehicleTableView vehicles={filteredVehiclesForTable} />
      )}
    </div>
  )
}
