import { useNavigate } from 'react-router'
import { Phone, ChevronRight } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { ROLE_COLORS } from '@/lib/types'

interface ContactCardProps {
  profile: Profile
}

export function ContactCard({ profile }: ContactCardProps) {
  const navigate = useNavigate()
  const roleColor = ROLE_COLORS[profile.role]

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
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
        <ChevronRight size={18} className="text-muted-foreground" />
      </div>
    </div>
  )
}
