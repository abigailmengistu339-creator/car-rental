import { useState, useEffect } from 'react'
import { X, User, Loader2 } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { UserRole } from '@/lib/types'
import { useUpdateProfile } from '@/hooks/useProfiles'
import { useToast } from '@/hooks/useToast'

interface EditContactModalProps {
  isOpen: boolean
  profile: Profile | null
  onClose: () => void
  onSuccess?: () => void
}

export function EditContactModal({
  isOpen,
  profile,
  onClose,
  onSuccess,
}: EditContactModalProps) {
  const { updateProfile, loading } = useUpdateProfile()
  const { success, error } = useToast()

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.Driver)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhoneNumber(profile.phone_number || '')
      setRole(profile.role || UserRole.Driver)
    }
  }, [profile])

  if (!isOpen || !profile) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) return

    const ok = await updateProfile(profile.id, {
      full_name: fullName.trim(),
      phone_number: phoneNumber.trim() || null,
      role,
    })

    if (ok) {
      success('Contact updated successfully!')
      if (onSuccess) onSuccess()
      onClose()
    } else {
      error('Failed to update contact.')
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
        aria-labelledby="edit-contact-title"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          animation: 'scale-up 180ms cubic-bezier(0.16, 1, 0.3, 1)',
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <User size={22} />
          </div>
          <div>
            <h3
              id="edit-contact-title"
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--foreground)',
                letterSpacing: '-0.02em',
              }}
            >
              Edit Contact
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
              Update contact information and operational role
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Full Name */}
          <div className="field-group">
            <label className="field-label" htmlFor="edit-name">Full Name *</label>
            <input
              id="edit-name"
              type="text"
              className="apple-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Mourad Belkacem"
              required
              disabled={loading}
            />
          </div>

          {/* Phone Number */}
          <div className="field-group">
            <label className="field-label" htmlFor="edit-phone">Phone Number</label>
            <input
              id="edit-phone"
              type="tel"
              className="apple-input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+213 555 0100"
              disabled={loading}
            />
          </div>

          {/* Role */}
          <div className="field-group">
            <label className="field-label" htmlFor="edit-role">Role Designation *</label>
            <select
              id="edit-role"
              className="apple-select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={loading}
            >
              <option value={UserRole.Driver}>Driver</option>
              <option value={UserRole.Client}>Client</option>
              <option value={UserRole.Vendor}>Maintenance Vendor</option>
            </select>
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
              disabled={loading || !fullName.trim()}
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
