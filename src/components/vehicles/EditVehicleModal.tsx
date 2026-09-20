import { useState, useEffect } from 'react'
import { X, Car, Loader2 } from 'lucide-react'
import type { VehicleWithDriver } from '@/lib/types'
import { ModelCategory, OperationalStatus, MODEL_CATEGORY_LABELS, UserRole } from '@/lib/types'
import { useUpdateVehicle } from '@/hooks/useVehicles'
import { useProfiles } from '@/hooks/useProfiles'
import { useToast } from '@/hooks/useToast'

interface EditVehicleModalProps {
  isOpen: boolean
  vehicle: VehicleWithDriver | null
  onClose: () => void
  onSuccess?: () => void
}

export function EditVehicleModal({
  isOpen,
  vehicle,
  onClose,
  onSuccess,
}: EditVehicleModalProps) {
  const { updateVehicle, loading } = useUpdateVehicle()
  const { profiles: drivers } = useProfiles(UserRole.Driver)
  const { success, error } = useToast()

  const [plateNumber, setPlateNumber] = useState('')
  const [modelCategory, setModelCategory] = useState<ModelCategory>(ModelCategory.Market76)
  const [driverId, setDriverId] = useState<string>('')
  const [currentLocation, setCurrentLocation] = useState('')
  const [operationalStatus, setOperationalStatus] = useState<OperationalStatus>(OperationalStatus.Available)

  useEffect(() => {
    if (vehicle) {
      setPlateNumber(vehicle.plate_number || '')
      setModelCategory(vehicle.model_category || ModelCategory.Market76)
      setDriverId(vehicle.driver_id || '')
      setCurrentLocation(vehicle.current_location || '')
      setOperationalStatus(vehicle.operational_status || OperationalStatus.Available)
    }
  }, [vehicle])

  if (!isOpen || !vehicle) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plateNumber.trim()) return

    const ok = await updateVehicle(vehicle.id, {
      plate_number: plateNumber.trim(),
      model_category: modelCategory,
      driver_id: driverId || null,
      current_location: currentLocation.trim(),
      operational_status: operationalStatus,
    })

    if (ok) {
      success('Vehicle updated successfully!')
      if (onSuccess) onSuccess()
      onClose()
    } else {
      error('Failed to update vehicle.')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fade-in 150ms ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-vehicle-title"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          animation: 'scale-up 180ms cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--muted-foreground)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Title Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.12)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Car size={22} />
          </div>
          <div>
            <h3
              id="edit-vehicle-title"
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--foreground)',
                letterSpacing: '-0.02em',
              }}
            >
              Edit Vehicle
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
              Update registration plate, category, driver assignment and telemetry
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* License Plate */}
          <div className="field-group">
            <label className="field-label" htmlFor="edit-plate">License Plate Number *</label>
            <input
              id="edit-plate"
              type="text"
              className="apple-input"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="e.g. 00176-101-16"
              required
              disabled={loading}
            />
          </div>

          {/* Model Category */}
          <div className="field-group">
            <label className="field-label" htmlFor="edit-category">Model Category *</label>
            <select
              id="edit-category"
              className="apple-select"
              value={modelCategory}
              onChange={(e) => setModelCategory(e.target.value as ModelCategory)}
              disabled={loading}
            >
              {Object.values(ModelCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {MODEL_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Operational Status */}
          <div className="field-group">
            <label className="field-label" htmlFor="edit-op-status">Operational Status</label>
            <select
              id="edit-op-status"
              className="apple-select"
              value={operationalStatus}
              onChange={(e) => setOperationalStatus(e.target.value as OperationalStatus)}
              disabled={loading}
            >
              <option value={OperationalStatus.Available}>Available</option>
              <option value={OperationalStatus.InRoute}>In Route</option>
              <option value={OperationalStatus.Maintenance}>Maintenance</option>
            </select>
          </div>

          {/* Assigned Driver */}
          <div className="field-group">
            <label className="field-label" htmlFor="edit-driver">Assigned Driver</label>
            <select
              id="edit-driver"
              className="apple-select"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              disabled={loading}
            >
              <option value="">— No Driver Assigned —</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} ({d.phone_number || 'No phone'})
                </option>
              ))}
            </select>
          </div>

          {/* Base Location */}
          <div className="field-group">
            <label className="field-label" htmlFor="edit-location">Base Location / Hub</label>
            <input
              id="edit-location"
              type="text"
              className="apple-input"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              placeholder="e.g. Bab Ezzouar, Algiers"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--foreground)',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-apple"
              disabled={loading || !plateNumber.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {loading && <Loader2 size={15} className="auth-spinner" />}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
