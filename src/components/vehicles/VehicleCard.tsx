import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Copy,
  Check,
  Pencil,
  Trash2,
} from 'lucide-react'
import type { VehicleWithDriver } from '@/lib/types'
import { OperationalStatus } from '@/lib/types'
import { useAuth } from '@/lib/auth'
import { useDeleteVehicle } from '@/hooks/useVehicles'
import { useToast } from '@/hooks/useToast'
import { EditVehicleModal } from './EditVehicleModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface VehicleCardProps {
  vehicle: VehicleWithDriver
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { deleteVehicle, loading: deleting } = useDeleteVehicle()
  const { success, error } = useToast()

  const [copiedPlate, setCopiedPlate] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const hasLibre = !!vehicle.libre_document_url
  const hasInsurance = !!vehicle.insurance_document_url
  const opStatus = vehicle.operational_status || OperationalStatus.Available

  const handleClick = () => {
    if (vehicle.driver) {
      navigate(`/profile/${vehicle.driver.id}`)
    }
  }

  const handleCopyPlate = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(vehicle.plate_number)
    setCopiedPlate(true)
    setTimeout(() => setCopiedPlate(false), 1500)
  }

  const handleDelete = async () => {
    const ok = await deleteVehicle(vehicle.id)
    if (ok) {
      success(`Vehicle ${vehicle.plate_number} deleted successfully.`)
      setDeleteModalOpen(false)
    } else {
      error('Failed to delete vehicle.')
    }
  }

  // Format initials
  const initials = vehicle.driver
    ? vehicle.driver.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??'

  return (
    <>
      <div
        className="vehicle-card-pro"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleClick()
        }}
        id={`vehicle-card-${vehicle.id}`}
      >
        {/* Registration Plate & Open Hint */}
        <div className="plate-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="auto-plate">
              <span className="plate-flag">DZ</span>
              <span className="plate-number">{vehicle.plate_number}</span>
            </div>

            {/* Quick Copy Plate Action */}
            <button
              onClick={handleCopyPlate}
              style={{
                background: 'transparent',
                border: 'none',
                color: copiedPlate ? 'var(--success)' : 'var(--muted-foreground)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 150ms ease',
              }}
              title={copiedPlate ? 'Plate copied to clipboard!' : 'Copy plate number'}
            >
              {copiedPlate ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          {/* Operational Status & Admin Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                background:
                  opStatus === OperationalStatus.InRoute
                    ? 'var(--success-bg)'
                    : opStatus === OperationalStatus.Available
                    ? 'rgba(59, 130, 246, 0.12)'
                    : 'var(--warning-bg)',
                color:
                  opStatus === OperationalStatus.InRoute
                    ? 'var(--success)'
                    : opStatus === OperationalStatus.Available
                    ? '#3b82f6'
                    : 'var(--warning)',
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: 'currentColor',
                }}
              />
              <span>{opStatus}</span>
            </span>

            {/* Admin Edit & Delete Actions */}
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditModalOpen(true)
                  }}
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Edit Vehicle"
                  aria-label="Edit Vehicle"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteModalOpen(true)
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    color: 'var(--color-danger, #ef4444)',
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Delete Vehicle"
                  aria-label="Delete Vehicle"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}

            <div className="card-open-hint">
              <ChevronRight size={18} />
            </div>
          </div>
        </div>

        {/* Driver Information */}
        {vehicle.driver ? (
          <div className="driver-block">
            <div className="avatar-initials">{initials}</div>
            <div className="driver-text">
              <span className="driver-title">{vehicle.driver.full_name}</span>
              {vehicle.driver.phone_number && (
                <a
                  href={`tel:${vehicle.driver.phone_number.replace(/\s/g, '')}`}
                  className="tap-to-call-pill"
                  onClick={(e) => e.stopPropagation()}
                  id={`call-${vehicle.id}`}
                  title={`Call ${vehicle.driver.full_name}`}
                >
                  <Phone size={11} strokeWidth={2.4} />
                  <span>{vehicle.driver.phone_number}</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="driver-block">
            <div className="avatar-initials" style={{ opacity: 0.5 }}>—</div>
            <div className="driver-text">
              <span className="driver-title" style={{ opacity: 0.6 }}>Unassigned Driver</span>
            </div>
          </div>
        )}

        {/* Location */}
        {vehicle.current_location && (
          <div className="location-row">
            <MapPin size={13} />
            <span>{vehicle.current_location}</span>
          </div>
        )}

        {/* Document Status Badges */}
        <div className="card-docs-row">
          <div className={`doc-chip ${hasLibre ? 'doc-chip-valid' : 'doc-chip-missing'}`}>
            {hasLibre ? <CheckCircle2 size={11} strokeWidth={2.5} /> : <AlertCircle size={11} strokeWidth={2.5} />}
            <span>{hasLibre ? 'Libre OK' : 'No Libre'}</span>
          </div>
          <div className={`doc-chip ${hasInsurance ? 'doc-chip-valid' : 'doc-chip-missing'}`}>
            {hasInsurance ? <CheckCircle2 size={11} strokeWidth={2.5} /> : <AlertCircle size={11} strokeWidth={2.5} />}
            <span>
              {hasInsurance
                ? vehicle.insurance_expiry_days
                  ? `Insurance (${vehicle.insurance_expiry_days}d left)`
                  : 'Insurance OK'
                : 'No Insurance'}
            </span>
          </div>
        </div>
      </div>

      {/* In-App Edit Modal */}
      {isAdmin && (
        <EditVehicleModal
          isOpen={editModalOpen}
          vehicle={vehicle}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => setEditModalOpen(false)}
        />
      )}

      {/* In-App Confirm Delete Modal */}
      {isAdmin && (
        <ConfirmModal
          isOpen={deleteModalOpen}
          title="Delete Vehicle"
          message={`Are you sure you want to delete vehicle "${vehicle.plate_number}"? This will remove it from the fleet directory. This action cannot be undone.`}
          confirmLabel="Delete Vehicle"
          isDestructive
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}
    </>
  )
}
