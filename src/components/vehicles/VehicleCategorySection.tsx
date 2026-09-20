import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { VehicleCard } from './VehicleCard'
import { useVehicles } from '@/hooks/useVehicles'
import { type ModelCategory, MODEL_CATEGORY_LABELS, MODEL_CATEGORY_COLORS } from '@/lib/types'

interface VehicleCategorySectionProps {
  category: ModelCategory
  searchQuery?: string
}

export function VehicleCategorySection({ category, searchQuery = '' }: VehicleCategorySectionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const { vehicles, loading } = useVehicles(category)
  const colors = MODEL_CATEGORY_COLORS[category]
  const label = MODEL_CATEGORY_LABELS[category]

  // Filter vehicles by search query (plate, driver name, location)
  const filteredVehicles = vehicles.filter((v) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      v.plate_number.toLowerCase().includes(q) ||
      (v.driver?.full_name && v.driver.full_name.toLowerCase().includes(q)) ||
      (v.current_location && v.current_location.toLowerCase().includes(q))
    )
  })

  const missingDocs = vehicles.filter(
    (v) => !v.libre_document_url || !v.insurance_document_url
  ).length

  // If searching and this category has no matches, don't show empty block if other categories match
  if (searchQuery.trim() && filteredVehicles.length === 0) {
    return null
  }

  return (
    <div className="category-section-box" id={`category-box-${category}`}>
      <button
        className="category-header-btn"
        onClick={() => setIsOpen(!isOpen)}
        id={`category-${category}`}
        aria-expanded={isOpen}
      >
        <div className="cat-header-left">
          <div className={`cat-pill-indicator ${colors.bg} ${colors.text} ${colors.border}`}>
            <div className="cat-dot-pulse" />
            <span>{label}</span>
          </div>
          <span className={`cat-count-pill ${colors.text}`}>
            {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'}
          </span>
        </div>

        <div className="cat-header-right">
          {missingDocs > 0 && (
            <span className="badge-missing-alert">
              <AlertCircle size={12} strokeWidth={2.4} />
              <span>{missingDocs} missing docs</span>
            </span>
          )}
          <div className="cat-chevron">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="category-content-area">
          {loading ? (
            <div className="vehicles-grid">
              {[1, 2].map((i) => (
                <div key={i} className="skeleton-box" style={{ height: 160 }} />
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="empty-view-card">
              <p>No vehicles match your criteria in this category</p>
            </div>
          ) : (
            <div className="vehicles-grid">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
