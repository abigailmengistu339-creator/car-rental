import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Phone, User, Car, FileText, Pencil, Trash2 } from 'lucide-react'
import { useProfile, useDeleteProfile } from '@/hooks/useProfiles'
import { useDriverVehicles, useUpdateVehicle, useDeleteVehicle } from '@/hooks/useVehicles'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/hooks/useToast'
import { ROLE_COLORS, MODEL_CATEGORY_LABELS, MODEL_CATEGORY_COLORS, type VehicleWithDriver } from '@/lib/types'
import { DocumentUpload } from '@/components/profile/DocumentUpload'
import { LocationEditor } from '@/components/profile/LocationEditor'
import { EditContactModal } from '@/components/contacts/EditContactModal'
import { EditVehicleModal } from '@/components/vehicles/EditVehicleModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export default function ProfileDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { profile, loading: profileLoading } = useProfile(id)
  const { vehicles, loading: vehiclesLoading } = useDriverVehicles(id)
  const { updateVehicle } = useUpdateVehicle()
  const { deleteVehicle, loading: deletingVehicle } = useDeleteVehicle()
  const { deleteProfile, loading: deletingProfile } = useDeleteProfile()
  const { success, error } = useToast()

  // Modals state
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<VehicleWithDriver | null>(null)
  const [deletingVehicleItem, setDeletingVehicleItem] = useState<VehicleWithDriver | null>(null)

  // Force re-render when documents update
  const [, setRefreshKey] = useState(0)
  const forceRefresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const handleDeleteProfile = async () => {
    if (!profile) return
    const ok = await deleteProfile(profile.id)
    if (ok) {
      success(`Profile for "${profile.full_name}" deleted.`)
      navigate('/contacts', { replace: true })
    } else {
      error('Failed to delete profile.')
    }
  }

  const handleDeleteVehicle = async () => {
    if (!deletingVehicleItem) return
    const ok = await deleteVehicle(deletingVehicleItem.id)
    if (ok) {
      success(`Vehicle "${deletingVehicleItem.plate_number}" deleted.`)
      setDeletingVehicleItem(null)
      forceRefresh()
    } else {
      error('Failed to delete vehicle.')
    }
  }

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

        <div className="hero-actions-row">
          {profile.phone_number && (
            <a
              href={`tel:${profile.phone_number.replace(/\s/g, '')}`}
              className="call-hero-btn"
              id="profile-call-btn"
            >
              <Phone size={16} strokeWidth={2.4} />
              <span>Call {profile.phone_number}</span>
            </a>
          )}

          {/* Admin Edit & Delete Actions for Profile */}
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn-primary-apple"
                style={{
                  background: 'var(--card)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  boxShadow: 'none',
                  padding: '9px 14px',
                }}
                onClick={() => setEditProfileOpen(true)}
                title="Edit Contact"
              >
                <Pencil size={15} />
                <span>Edit Contact</span>
              </button>

              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--color-danger, #ef4444)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => setDeleteProfileOpen(true)}
                title="Delete Contact"
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
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
                {/* Plate, Category Bar & Admin Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

                  {/* Admin Vehicle Actions */}
                  {isAdmin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setEditingVehicle(vehicle)}
                        style={{
                          background: 'var(--muted)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--foreground)',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Pencil size={13} />
                        <span>Edit Vehicle</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingVehicleItem(vehicle)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '8px',
                          color: 'var(--color-danger, #ef4444)',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
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

      {/* In-App Edit Contact Modal */}
      {isAdmin && (
        <EditContactModal
          isOpen={editProfileOpen}
          profile={profile}
          onClose={() => setEditProfileOpen(false)}
          onSuccess={forceRefresh}
        />
      )}

      {/* In-App Confirm Delete Contact Modal */}
      {isAdmin && (
        <ConfirmModal
          isOpen={deleteProfileOpen}
          title="Delete Contact"
          message={`Are you sure you want to delete "${profile.full_name}"? All associations with assigned vehicles will be unlinked. This action cannot be undone.`}
          confirmLabel="Delete Contact"
          isDestructive
          loading={deletingProfile}
          onConfirm={handleDeleteProfile}
          onCancel={() => setDeleteProfileOpen(false)}
        />
      )}

      {/* In-App Edit Vehicle Modal */}
      {isAdmin && (
        <EditVehicleModal
          isOpen={!!editingVehicle}
          vehicle={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onSuccess={forceRefresh}
        />
      )}

      {/* In-App Confirm Delete Vehicle Modal */}
      {isAdmin && (
        <ConfirmModal
          isOpen={!!deletingVehicleItem}
          title="Delete Vehicle"
          message={`Are you sure you want to delete vehicle "${deletingVehicleItem?.plate_number}"? This will remove it from the fleet directory. This action cannot be undone.`}
          confirmLabel="Delete Vehicle"
          isDestructive
          loading={deletingVehicle}
          onConfirm={handleDeleteVehicle}
          onCancel={() => setDeletingVehicleItem(null)}
        />
      )}
    </div>
  )
}
