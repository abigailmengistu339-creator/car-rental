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
function VehicleForm({
  onSuccess,
  onError,
}: {
  onSuccess: () => void
  onError: () => void
}) {
  const { createVehicle, loading } = useCreateVehicle()
  const { profiles: drivers } = useProfiles(UserRole.Driver)
  const [formData, setFormData] = useState({
    plate_number: '',
    model_category: ModelCategory.Market76,
    driver_id: '' as string | null,
    current_location: '',
    libre_document_url: null as string | null,
    insurance_document_url: null as string | null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.plate_number.trim()) return
    const result = await createVehicle({
      ...formData,
      driver_id: formData.driver_id || null,
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
          placeholder="e.g. 00176-101-16"
          value={formData.plate_number}
          onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
          required
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="model_category">Vehicle Model Category *</label>
        <select
          id="model_category"
          className="apple-select"
          value={formData.model_category}
          onChange={(e) => setFormData({ ...formData, model_category: e.target.value as ModelCategory })}
        >
          {Object.values(ModelCategory).map((cat) => (
            <option key={cat} value={cat}>
              {MODEL_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="driver_id">Assign Initial Driver</label>
        <select
          id="driver_id"
          className="apple-select"
          value={formData.driver_id || ''}
          onChange={(e) => setFormData({ ...formData, driver_id: e.target.value || null })}
        >
          <option value="">— No Driver Assigned —</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.full_name} ({driver.phone_number || 'No phone'})
            </option>
          ))}
        </select>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="current_location">Current Location</label>
        <input
          id="current_location"
          type="text"
          className="apple-input"
          placeholder="e.g. Bab Ezzouar, Algiers"
          value={formData.current_location}
          onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
        />
      </div>

      <button
        type="submit"
        className="btn-primary-apple"
        style={{ width: '100%', padding: '12px', marginTop: '8px' }}
        disabled={loading || !formData.plate_number.trim()}
      >
        {loading ? 'Adding Vehicle...' : 'Add Vehicle to Fleet'}
      </button>
    </form>
  )
}
