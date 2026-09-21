import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Car,
  Loader2,
  Phone,
  Edit2,
  UserMinus,
  RefreshCw,
  AlertCircle,
  UserPlus,
} from 'lucide-react'
import type { VehicleWithDriver } from '@/lib/types'
import { ModelCategory, OperationalStatus, MODEL_CATEGORY_LABELS, UserRole } from '@/lib/types'
import { useUpdateVehicle } from '@/hooks/useVehicles'
import { useProfiles, useCreateProfile, useUpdateProfile } from '@/hooks/useProfiles'
import { useToast } from '@/hooks/useToast'

interface EditVehicleModalProps {
  isOpen: boolean
  vehicle: VehicleWithDriver | null
  onClose: () => void
  onSuccess?: () => void
}

type DriverMode = 'assigned' | 'select' | 'new'

export function EditVehicleModal({
  isOpen,
  vehicle,
  onClose,
  onSuccess,
}: EditVehicleModalProps) {
  const { updateVehicle, loading: updatingVehicle } = useUpdateVehicle()
  const { profiles: drivers, loading: driversLoading } = useProfiles(UserRole.Driver)
  const { createProfile, loading: creatingProfile } = useCreateProfile()
  const { updateProfile, loading: updatingProfile } = useUpdateProfile()
  const { success, error } = useToast()

  const [plateNumber, setPlateNumber] = useState('')
  const [modelCategory, setModelCategory] = useState<ModelCategory>(ModelCategory.Market76)
  const [driverId, setDriverId] = useState<string>('')
  const [currentLocation, setCurrentLocation] = useState('')
  const [operationalStatus, setOperationalStatus] = useState<OperationalStatus>(OperationalStatus.Available)

  // Driver management states
  const [driverMode, setDriverMode] = useState<DriverMode>('select')
  const [editCurrentDriver, setEditCurrentDriver] = useState(false)
  const [editedDriverName, setEditedDriverName] = useState('')
  const [editedDriverPhone, setEditedDriverPhone] = useState('')
  const [newDriverName, setNewDriverName] = useState('')
  const [newDriverPhone, setNewDriverPhone] = useState('')

  // Merge vehicle.driver with drivers list to guarantee it is displayed without async flicker
  const allDrivers = useMemo(() => {
    const list = [...drivers]
    if (vehicle?.driver && !list.some((d) => d.id === vehicle.driver?.id)) {
      list.unshift(vehicle.driver)
    }
    return list
  }, [drivers, vehicle?.driver])

  const assignedDriver = useMemo(() => {
    if (!driverId) return null
    return allDrivers.find((d) => d.id === driverId) || vehicle?.driver || null
  }, [driverId, allDrivers, vehicle?.driver])

  useEffect(() => {
    if (vehicle) {
      setPlateNumber(vehicle.plate_number || '')
      setModelCategory(vehicle.model_category || ModelCategory.Market76)
      const currentDriverId = vehicle.driver_id || ''
      setDriverId(currentDriverId)
      setCurrentLocation(vehicle.current_location || '')
      setOperationalStatus(vehicle.operational_status || OperationalStatus.Available)

      setDriverMode(currentDriverId ? 'assigned' : 'select')
      setEditCurrentDriver(false)
      if (vehicle.driver) {
        setEditedDriverName(vehicle.driver.full_name || '')
        setEditedDriverPhone(vehicle.driver.phone_number || '')
      } else {
        setEditedDriverName('')
        setEditedDriverPhone('')
      }
      setNewDriverName('')
      setNewDriverPhone('')
    }
  }, [vehicle])

  if (!isOpen || !vehicle) return null

  const isSubmitting = updatingVehicle || creatingProfile || updatingProfile

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plateNumber.trim()) return

    let finalDriverId: string | null = driverId || null

    // 1. Create new driver if in 'new' mode
    if (driverMode === 'new') {
      if (!newDriverName.trim()) {
        error('Please enter the driver full name or switch to select existing.')
        return
      }
      const created = await createProfile({
        full_name: newDriverName.trim(),
        phone_number: newDriverPhone.trim() || '',
        role: UserRole.Driver,
      })
      if (!created) {
        error('Failed to register new driver contact.')
        return
      }
      finalDriverId = created.id
    }

    // 2. Update existing driver details if edited in 'assigned' mode
    if (driverMode === 'assigned' && editCurrentDriver && assignedDriver) {
      if (
        editedDriverName.trim() &&
        (editedDriverName.trim() !== assignedDriver.full_name ||
          editedDriverPhone.trim() !== (assignedDriver.phone_number || ''))
      ) {
        await updateProfile(assignedDriver.id, {
          full_name: editedDriverName.trim(),
          phone_number: editedDriverPhone.trim(),
        })
      }
    }

    // 3. Update vehicle
    const ok = await updateVehicle(vehicle.id, {
      plate_number: plateNumber.trim(),
      model_category: modelCategory,
      driver_id: finalDriverId,
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

  const initials = assignedDriver?.full_name
    ? assignedDriver.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

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
        if (e.target === e.currentTarget && !isSubmitting) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-vehicle-title"
        style={{
          width: '100%',
          maxWidth: '540px',
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
          disabled={isSubmitting}
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
              placeholder="e.g. 03-A65000"
              required
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              <option value={OperationalStatus.Available}>Available</option>
              <option value={OperationalStatus.InRoute}>In Route</option>
              <option value={OperationalStatus.Maintenance}>Maintenance</option>
            </select>
          </div>

          {/* =========================================================
              ASSIGNED DRIVER SECTION (ENHANCED & EDITABLE)
             ========================================================= */}
          <div className="field-group" style={{ background: 'var(--muted)', padding: '14px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label className="field-label" style={{ margin: 0 }}>Assigned Driver</label>

              {/* Mode Toggles */}
              {driverMode === 'assigned' && assignedDriver ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setEditCurrentDriver(!editCurrentDriver)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0,
                    }}
                  >
                    <Edit2 size={12} />
                    <span>{editCurrentDriver ? 'Done Editing' : 'Edit Driver Info'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDriverMode('select')
                      setEditCurrentDriver(false)
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--muted-foreground)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0,
                    }}
                  >
                    <RefreshCw size={12} />
                    <span>Change</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '4px', background: 'var(--card)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => setDriverMode('select')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: 'none',
                      background: driverMode === 'select' ? 'var(--primary)' : 'transparent',
                      color: driverMode === 'select' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}
                  >
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setDriverMode('new')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: 'none',
                      background: driverMode === 'new' ? 'var(--primary)' : 'transparent',
                      color: driverMode === 'new' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <UserPlus size={11} />
                    <span>+ New Driver</span>
                  </button>
                </div>
              )}
            </div>

            {/* Case 1: Driver Currently Assigned */}
            {driverMode === 'assigned' && assignedDriver && (
              <div>
                {!editCurrentDriver ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>
                          {assignedDriver.full_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={11} />
                          <span>{assignedDriver.phone_number || 'No phone recorded'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDriverId('')
                        setDriverMode('select')
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        background: 'rgba(239, 68, 68, 0.08)',
                        color: 'var(--color-danger, #ef4444)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Unassign this driver from this vehicle"
                    >
                      <UserMinus size={12} />
                      <span>Unassign</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--card)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div>
                      <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
                        Driver Full Name *
                      </label>
                      <input
                        type="text"
                        className="apple-input"
                        style={{ width: '100%', padding: '8px 12px', fontSize: '0.8125rem' }}
                        value={editedDriverName}
                        onChange={(e) => setEditedDriverName(e.target.value)}
                        placeholder="Driver full name"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
                        Driver Phone Number
                      </label>
                      <input
                        type="tel"
                        className="apple-input"
                        style={{ width: '100%', padding: '8px 12px', fontSize: '0.8125rem' }}
                        value={editedDriverPhone}
                        onChange={(e) => setEditedDriverPhone(e.target.value)}
                        placeholder="e.g. 0911 00 00 00"
                      />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>
                      Saving will update this driver's details in the contacts directory.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Case 2: Select Existing Driver */}
            {driverMode === 'select' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select
                  id="edit-driver"
                  className="apple-select"
                  style={{ width: '100%' }}
                  value={driverId}
                  onChange={(e) => {
                    const val = e.target.value
                    setDriverId(val)
                    if (val) {
                      setDriverMode('assigned')
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <option value="">— No Driver Assigned —</option>
                  {allDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({d.phone_number || 'No phone'})
                    </option>
                  ))}
                </select>

                {allDrivers.length === 0 && !driversLoading && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'rgba(245, 158, 11, 0.08)',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      color: 'var(--foreground)',
                    }}
                  >
                    <AlertCircle size={14} color="var(--primary)" />
                    <span style={{ flex: 1 }}>No other drivers registered in directory yet.</span>
                    <button
                      type="button"
                      onClick={() => setDriverMode('new')}
                      style={{
                        background: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      + Add New Driver
                    </button>
                  </div>
                )}

                {allDrivers.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setDriverMode('new')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '2px 0',
                      }}
                    >
                      Driver not in list? Register new driver →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Case 3: Create and Assign New Driver Inline */}
            {driverMode === 'new' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  background: 'var(--card)',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--foreground)' }}>
                    Register & Assign New Driver
                  </span>
                  <button
                    type="button"
                    onClick={() => setDriverMode('select')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--muted-foreground)',
                      fontSize: '0.6875rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
                    Driver Full Name *
                  </label>
                  <input
                    type="text"
                    className="apple-input"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.8125rem' }}
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    placeholder="e.g. Abebe Kebede"
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
                    Driver Phone Number
                  </label>
                  <input
                    type="tel"
                    className="apple-input"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.8125rem' }}
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    placeholder="e.g. 0911 234 567"
                  />
                </div>

                <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>
                  This driver will be created in your directory with the "Driver" role and automatically linked to this vehicle upon saving.
                </p>
              </div>
            )}
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
              placeholder="e.g. Addis Ababa"
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
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
              disabled={isSubmitting || !plateNumber.trim() || (driverMode === 'new' && !newDriverName.trim())}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isSubmitting && <Loader2 size={15} className="auth-spinner" />}
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
