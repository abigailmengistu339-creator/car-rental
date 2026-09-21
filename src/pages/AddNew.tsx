import { useState } from 'react'
import { useNavigate } from 'react-router'
import { UserPlus, Car } from 'lucide-react'
import { useCreateProfile } from '@/hooks/useProfiles'
import { useCreateVehicle } from '@/hooks/useVehicles'
import { useProfiles } from '@/hooks/useProfiles'
import { UserRole, ModelCategory, MODEL_CATEGORY_LABELS } from '@/lib/types'
import { useToast } from '@/hooks/useToast'

type FormTab = 'contact' | 'vehicle'

export default function AddNew() {
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState<FormTab>('contact')

  return (
    <div className="page-container">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-title-group">
          <h1>New Entry</h1>
          <p>Register a new contact or add a vehicle to the operational fleet</p>
        </div>
      </div>

      {/* Segmented Switcher */}
      <div className="role-segmented-tabs" style={{ maxWidth: 420, margin: '0 auto' }}>
        <button
          className={`role-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
          id="tab-add-contact"
        >
          <UserPlus size={16} />
          <span>New Contact</span>
        </button>
        <button
          className={`role-tab-btn ${activeTab === 'vehicle' ? 'active' : ''}`}
          onClick={() => setActiveTab('vehicle')}
          id="tab-add-vehicle"
        >
          <Car size={16} />
          <span>New Vehicle</span>
        </button>
      </div>

      {activeTab === 'contact' ? (
        <ContactForm
          onSuccess={() => {
            success('Contact registered successfully!')
            setTimeout(() => navigate('/contacts'), 1000)
          }}
          onError={() => error('Failed to create contact')}
        />
      ) : (
        <VehicleForm
          onSuccess={() => {
            success('Vehicle added to fleet successfully!')
            setTimeout(() => navigate('/dashboard'), 1000)
          }}
          onError={() => error('Failed to add vehicle')}
        />
      )}
    </div>
  )
}

// ---- Contact Form ----
function ContactForm({
  onSuccess,
  onError,
}: {
  onSuccess: () => void
  onError: () => void
}) {
  const { createProfile, loading } = useCreateProfile()
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    role: UserRole.Driver,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.full_name.trim()) return
    const result = await createProfile(formData)
    if (result) {
      onSuccess()
    } else {
      onError()
    }
  }

  return (
    <form className="form-card-apple" onSubmit={handleSubmit}>
      <div className="field-group">
        <label className="field-label" htmlFor="full_name">Full Name *</label>
        <input
          id="full_name"
          type="text"
          className="apple-input"
          placeholder="e.g. Mourad Belkacem"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="phone_number">Phone Number</label>
        <input
          id="phone_number"
          type="tel"
          className="apple-input"
          placeholder="+213 555 0100"
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="role">Role Designation *</label>
        <select
          id="role"
          className="apple-select"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
        >
          <option value={UserRole.Driver}>Driver</option>
          <option value={UserRole.Client}>Client</option>
          <option value={UserRole.Vendor}>Maintenance Vendor</option>
        </select>
      </div>

      <button
        type="submit"
        className="btn-primary-apple"
        style={{ width: '100%', padding: '12px', marginTop: '8px' }}
        disabled={loading || !formData.full_name.trim()}
      >
        {loading ? 'Registering...' : 'Register Contact'}
      </button>
    </form>
  )
}

// ---- Vehicle Form ----
// ---- Vehicle Form ----
function VehicleForm({
  onSuccess,
  onError,
}: {
  onSuccess: () => void
  onError: () => void
}) {
  const { createVehicle, loading: creatingVehicle } = useCreateVehicle()
  const { createProfile, loading: creatingProfile } = useCreateProfile()
  const { profiles: drivers, loading: driversLoading } = useProfiles(UserRole.Driver)
  const { error: toastError } = useToast()

  const [driverMode, setDriverMode] = useState<'select' | 'new'>('select')
  const [newDriverName, setNewDriverName] = useState('')
  const [newDriverPhone, setNewDriverPhone] = useState('')

  const [formData, setFormData] = useState({
    plate_number: '',
    model_category: ModelCategory.Market76,
    driver_id: '' as string | null,
    current_location: '',
    libre_document_url: null as string | null,
    insurance_document_url: null as string | null,
  })

  const isSubmitting = creatingVehicle || creatingProfile

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.plate_number.trim()) return

    let finalDriverId = formData.driver_id || null

    if (driverMode === 'new') {
      if (!newDriverName.trim()) {
        toastError('Please enter the driver full name or switch to select existing.')
        return
      }
      const created = await createProfile({
        full_name: newDriverName.trim(),
        phone_number: newDriverPhone.trim() || '',
        role: UserRole.Driver,
      })
      if (!created) {
        toastError('Failed to create driver contact.')
        return
      }
      finalDriverId = created.id
    }

    const result = await createVehicle({
      ...formData,
      driver_id: finalDriverId,
    })
    if (result) {
      onSuccess()
    } else {
      onError()
    }
  }

  return (
    <form className="form-card-apple" onSubmit={handleSubmit}>
      <div className="field-group">
        <label className="field-label" htmlFor="plate_number">License Plate Number *</label>
        <input
          id="plate_number"
          type="text"
          className="apple-input"
          placeholder="e.g. 03-A65000"
          value={formData.plate_number}
          onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="model_category">Vehicle Model Category *</label>
        <select
          id="model_category"
          className="apple-select"
          value={formData.model_category}
          onChange={(e) => setFormData({ ...formData, model_category: e.target.value as ModelCategory })}
          disabled={isSubmitting}
        >
          {Object.values(ModelCategory).map((cat) => (
            <option key={cat} value={cat}>
              {MODEL_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {/* Assigned Driver Section */}
      <div className="field-group" style={{ background: 'var(--muted)', padding: '14px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label className="field-label" style={{ margin: 0 }}>Assign Initial Driver</label>
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
              }}
            >
              <UserPlus size={11} />
              <span>+ New Driver</span>
            </button>
          </div>
        </div>

        {driverMode === 'select' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <select
              id="driver_id"
              className="apple-select"
              style={{ width: '100%' }}
              value={formData.driver_id || ''}
              onChange={(e) => setFormData({ ...formData, driver_id: e.target.value || null })}
              disabled={isSubmitting}
            >
              <option value="">— No Driver Assigned —</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.full_name} ({driver.phone_number || 'No phone'})
                </option>
              ))}
            </select>
            {drivers.length === 0 && !driversLoading && (
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                No drivers registered yet. Click <strong>+ New Driver</strong> above to create one now.
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--card)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
                Driver Full Name *
              </label>
              <input
                type="text"
                className="apple-input"
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.8125rem' }}
                placeholder="e.g. Abebe Kebede"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
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
                placeholder="e.g. 0911 234 567"
                value={newDriverPhone}
                onChange={(e) => setNewDriverPhone(e.target.value)}
              />
            </div>
            <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>
              This driver will be created in your directory with the "Driver" role and automatically linked to this vehicle.
            </p>
          </div>
        )}
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="current_location">Current Location</label>
        <input
          id="current_location"
          type="text"
          className="apple-input"
          placeholder="e.g. Addis Ababa"
          value={formData.current_location}
          onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
          disabled={isSubmitting}
        />
      </div>

      <button
        type="submit"
        className="btn-primary-apple"
        style={{ width: '100%', padding: '12px', marginTop: '8px' }}
        disabled={isSubmitting || !formData.plate_number.trim() || (driverMode === 'new' && !newDriverName.trim())}
      >
        {isSubmitting ? 'Adding Vehicle...' : 'Add Vehicle to Fleet'}
      </button>
    </form>
  )
}
