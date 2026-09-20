import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Phone, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { ROLE_COLORS } from '@/lib/types'
import { useAuth } from '@/lib/auth'
import { useDeleteProfile } from '@/hooks/useProfiles'
import { useToast } from '@/hooks/useToast'
import { EditContactModal } from './EditContactModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface ContactCardProps {
  profile: Profile
}

export function ContactCard({ profile }: ContactCardProps) {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { deleteProfile, loading: deleting } = useDeleteProfile()
  const { success, error } = useToast()

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const roleColor = ROLE_COLORS[profile.role]

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleDelete = async () => {
    const ok = await deleteProfile(profile.id)
    if (ok) {
      success(`Contact "${profile.full_name}" deleted successfully.`)
      setDeleteModalOpen(false)
    } else {
      error('Failed to delete contact.')
    }
  }

  return (
    <>
      <div
        className="contact-card-apple"
        onClick={() => navigate(`/profile/${profile.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') navigate(`/profile/${profile.id}`)
        }}
        id={`contact-card-${profile.id}`}
      >
        <div className="contact-card-left">
          <div className="contact-avatar-apple">
            {initials}
          </div>
          <div className="contact-info-col">
            <span className="contact-name-title">{profile.full_name}</span>
            <span className={`role-pill-badge ${roleColor.bg} ${roleColor.text}`}>
              {profile.role}
            </span>
          </div>
        </div>

        <div className="contact-card-right">
          {profile.phone_number && (
            <a
              href={`tel:${profile.phone_number.replace(/\s/g, '')}`}
              className="call-pill-btn"
              onClick={(e) => e.stopPropagation()}
              id={`call-contact-${profile.id}`}
              title={`Call ${profile.full_name}`}
            >
              <Phone size={15} strokeWidth={2.4} />
            </a>
          )}

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
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Edit Contact"
                aria-label="Edit Contact"
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
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Delete Contact"
                aria-label="Delete Contact"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}

          <ChevronRight size={18} className="text-muted-foreground" />
        </div>
      </div>

      {/* In-App Edit Modal */}
      {isAdmin && (
        <EditContactModal
          isOpen={editModalOpen}
          profile={profile}
          onClose={() => setEditModalOpen(false)}
        />
      )}

      {/* In-App Confirm Delete Modal */}
      {isAdmin && (
        <ConfirmModal
          isOpen={deleteModalOpen}
          title="Delete Contact"
          message={`Are you sure you want to delete "${profile.full_name}"? This contact record will be permanently removed. This action cannot be undone.`}
          confirmLabel="Delete Contact"
          isDestructive
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}
    </>
  )
}
