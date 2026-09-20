import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Phone, User, Car, FileText } from 'lucide-react'
import { useProfile } from '@/hooks/useProfiles'
import { useDriverVehicles, useUpdateVehicle } from '@/hooks/useVehicles'
import { useAuth } from '@/lib/auth'
import { ROLE_COLORS, MODEL_CATEGORY_LABELS, MODEL_CATEGORY_COLORS } from '@/lib/types'
import { DocumentUpload } from '@/components/profile/DocumentUpload'
import { LocationEditor } from '@/components/profile/LocationEditor'

export default function ProfileDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { profile, loading: profileLoading } = useProfile(id)
  const { vehicles, loading: vehiclesLoading } = useDriverVehicles(id)
  const { updateVehicle } = useUpdateVehicle()

  // Force re-render when documents update
  const [, setRefreshKey] = useState(0)
  const forceRefresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  if (profileLoading || vehiclesLoading) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton-box" style={{ height: 220 }} />
          <div className="skeleton-box" style={{ height: 180 }} />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="page-container">
        <div className="empty-view-card">
          <p>Profile not found in directory</p>
          <button
            className="btn-primary-apple"
            onClick={() => navigate(-1)}
            style={{ marginTop: '16px' }}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const roleColor = ROLE_COLORS[profile.role]
  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="page-container">
      {/* Back Link */}
      <div>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            color: 'var(--muted-foreground)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            padding: '4px 0',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </button>
      </div>

      {/* Apple ID Style Hero Card */}
      <div className="profile-hero-card">
        <div className="profile-avatar-giant">
          {initials}
        </div>
        <h1 className="profile-hero-title">{profile.full_name}</h1>
        <span className={`role-pill-badge ${roleColor.bg} ${roleColor.text}`}>
          {profile.role}
        </span>

        {profile.phone_number && (
          <div className="hero-actions-row">
            <a
              href={`tel:${profile.phone_number.replace(/\s/g, '')}`}
              className="call-hero-btn"
              id="profile-call-btn"
            >
              <Phone size={16} strokeWidth={2.4} />
              <span>Call {profile.phone_number}</span>
            </a>
          </div>
        )}
      </div>

      {/* Assigned Vehicles Section */}
      {vehicles.length > 0 && (
        <div className="profile-detail-section">
          <div className="section-title-row">
            <Car size={18} className="text-primary" />
            <span>Assigned Fleet Vehicle ({vehicles.length})</span>
          </div>

          {vehicles.map((vehicle) => {
            const catColors = MODEL_CATEGORY_COLORS[vehicle.model_category]
            return (
              <div key={vehicle.id} className="vehicle-edit-card">
                {/* Plate & Category Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="auto-plate">
                    <span className="plate-flag">DZ</span>
                    <span className="plate-number" style={{ fontSize: '1rem' }}>
                      {vehicle.plate_number}
                    </span>
                  </div>

                  <span className={`cat-pill-indicator ${catColors.bg} ${catColors.text} ${catColors.border}`}>
                    {MODEL_CATEGORY_LABELS[vehicle.model_category]}
                  </span>
                </div>

                {/* Location Editor */}
                <div>
                  <span className="field-label" style={{ display: 'block', marginBottom: '6px' }}>
                    Current Location & Deployment
                  </span>
                  <LocationEditor
                    currentLocation={vehicle.current_location}
                    readOnly={!isAdmin}
                    onSave={async (newLocation) => {
                      await updateVehicle(vehicle.id, { current_location: newLocation })
                    }}
                  />
                </div>

                {/* Vehicle Documentation Vault */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} className="text-muted-foreground" />
                    <span className="field-label">Official Documentation Vault</span>
                  </div>

                  <DocumentUpload
                    vehicleId={vehicle.id}
                    docType="libre"
                    label="Libre (Vehicle Logbook)"
                    currentUrl={vehicle.libre_document_url}
                    fileName={vehicle.libre_file_name}
                    fileSize={vehicle.libre_file_size}
                    uploadDate={vehicle.libre_upload_date}
                    readOnly={!isAdmin}
                    onUploadComplete={(url) => {
                      vehicle.libre_document_url = url
                      forceRefresh()
                    }}
                    onDeleteComplete={forceRefresh}
                  />

                  <DocumentUpload
                    vehicleId={vehicle.id}
                    docType="insurance"
                    label="Third-Party Insurance"
                    currentUrl={vehicle.insurance_document_url}
                    fileName={vehicle.insurance_file_name}
                    fileSize={vehicle.insurance_file_size}
                    uploadDate={vehicle.insurance_upload_date}
                    readOnly={!isAdmin}
                    onUploadComplete={(url) => {
                      vehicle.insurance_document_url = url
                      forceRefresh()
                    }}
                    onDeleteComplete={forceRefresh}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* No vehicles assigned info */}
      {vehicles.length === 0 && (
        <div className="profile-detail-section">
          <div className="section-title-row">
            <User size={18} className="text-muted-foreground" />
            <span>Profile Information</span>
          </div>
          <div className="empty-view-card">
            <p>No vehicles assigned to this contact record.</p>
          </div>
        </div>
      )}
    </div>
  )
}
