import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Phone,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react'
import type { VehicleWithDriver } from '@/lib/types'
import { MODEL_CATEGORY_LABELS, MODEL_CATEGORY_COLORS, OperationalStatus } from '@/lib/types'

interface VehicleTableViewProps {
  vehicles: VehicleWithDriver[]
}

export function VehicleTableView({ vehicles }: VehicleTableViewProps) {
  const navigate = useNavigate()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<'plate' | 'driver' | 'category'>('plate')
  const [sortAsc, setSortAsc] = useState(true)

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const sortedVehicles = [...vehicles].sort((a, b) => {
    let comp = 0
    if (sortField === 'plate') {
      comp = a.plate_number.localeCompare(b.plate_number)
    } else if (sortField === 'driver') {
      const nameA = a.driver?.full_name || ''
      const nameB = b.driver?.full_name || ''
      comp = nameA.localeCompare(nameB)
    } else if (sortField === 'category') {
      comp = a.model_category.localeCompare(b.model_category)
    }
    return sortAsc ? comp : -comp
  })

  const toggleSort = (field: 'plate' | 'driver' | 'category') => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
            <th
              style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--muted-foreground)', cursor: 'pointer' }}
              onClick={() => toggleSort('plate')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>PLATE / REGISTRATION</span>
                <ArrowUpDown size={12} />
              </div>
            </th>
            <th
              style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--muted-foreground)', cursor: 'pointer' }}
              onClick={() => toggleSort('category')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>CATEGORY</span>
                <ArrowUpDown size={12} />
              </div>
            </th>
            <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--muted-foreground)' }}>
              STATUS
            </th>
            <th
              style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--muted-foreground)', cursor: 'pointer' }}
              onClick={() => toggleSort('driver')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>ASSIGNED DRIVER</span>
                <ArrowUpDown size={12} />
              </div>
            </th>
            <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--muted-foreground)' }}>
              LOCATION
            </th>
            <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--muted-foreground)' }}>
              LIBRE (LOGBOOK)
            </th>
            <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--muted-foreground)' }}>
              INSURANCE
            </th>
            <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--muted-foreground)', textAlign: 'right' }}>
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedVehicles.map((vehicle) => {
            const catColors = MODEL_CATEGORY_COLORS[vehicle.model_category]
            const hasLibre = !!vehicle.libre_document_url
            const hasInsurance = !!vehicle.insurance_document_url
            const opStatus = vehicle.operational_status || OperationalStatus.Available

            return (
              <tr
                key={vehicle.id}
                style={{
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'background 120ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                onClick={() => {
                  if (vehicle.driver) navigate(`/profile/${vehicle.driver.id}`)
                }}
              >
                {/* Plate */}
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="auto-plate">
                      <span className="plate-flag">DZ</span>
                      <span className="plate-number" style={{ fontSize: '0.8125rem' }}>
                        {vehicle.plate_number}
                      </span>
                    </div>
                    <button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedId === `plate-${vehicle.id}` ? 'var(--success)' : 'var(--muted-foreground)',
                        cursor: 'pointer',
                        padding: '3px',
                      }}
                      onClick={(e) => handleCopy(vehicle.plate_number, `plate-${vehicle.id}`, e)}
                      title="Copy Plate Number"
                    >
                      {copiedId === `plate-${vehicle.id}` ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </td>

                {/* Category */}
                <td style={{ padding: '14px 18px' }}>
                  <span className={`cat-pill-indicator ${catColors.bg} ${catColors.text} ${catColors.border}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                    {MODEL_CATEGORY_LABELS[vehicle.model_category]}
                  </span>
                </td>

                {/* Operational Telemetry */}
                <td style={{ padding: '14px 18px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
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
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'currentColor',
                      }}
                    />
                    <span>{opStatus}</span>
                  </span>
                </td>

                {/* Driver */}
                <td style={{ padding: '14px 18px' }}>
                  {vehicle.driver ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="avatar-initials" style={{ width: '28px', height: '28px', fontSize: '0.6875rem' }}>
                        {vehicle.driver.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{vehicle.driver.full_name}</span>
                        {vehicle.driver.phone_number && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>
                            {vehicle.driver.phone_number}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--muted-foreground)', fontStyle: 'italic' }}>Unassigned</span>
                  )}
                </td>

                {/* Location */}
                <td style={{ padding: '14px 18px', color: 'var(--muted-foreground)' }}>
                  {vehicle.current_location || '—'}
                </td>

                {/* Libre */}
                <td style={{ padding: '14px 18px' }}>
                  <span className={`doc-chip ${hasLibre ? 'doc-chip-valid' : 'doc-chip-missing'}`}>
                    {hasLibre ? <CheckCircle2 size={11} strokeWidth={2.5} /> : <AlertCircle size={11} strokeWidth={2.5} />}
                    <span>{hasLibre ? 'Verified' : 'Missing'}</span>
                  </span>
                </td>

                {/* Insurance */}
                <td style={{ padding: '14px 18px' }}>
                  <span className={`doc-chip ${hasInsurance ? 'doc-chip-valid' : 'doc-chip-missing'}`}>
                    {hasInsurance ? <CheckCircle2 size={11} strokeWidth={2.5} /> : <AlertCircle size={11} strokeWidth={2.5} />}
                    <span>{hasInsurance ? (vehicle.insurance_expiry_days ? `${vehicle.insurance_expiry_days}d left` : 'Active') : 'Missing'}</span>
                  </span>
                </td>

                {/* Actions */}
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    {vehicle.driver?.phone_number && (
                      <a
                        href={`tel:${vehicle.driver.phone_number.replace(/\s/g, '')}`}
                        className="call-pill-btn"
                        style={{ width: '30px', height: '30px', borderRadius: '8px' }}
                        onClick={(e) => e.stopPropagation()}
                        title={`Call ${vehicle.driver.full_name}`}
                      >
                        <Phone size={13} strokeWidth={2.4} />
                      </a>
                    )}
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
