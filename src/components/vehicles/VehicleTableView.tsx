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
  Pencil,
  Trash2,
} from 'lucide-react'
import type { VehicleWithDriver } from '@/lib/types'
import { MODEL_CATEGORY_LABELS, MODEL_CATEGORY_COLORS, OperationalStatus } from '@/lib/types'
import { useAuth } from '@/lib/auth'
import { useDeleteVehicle } from '@/hooks/useVehicles'
import { useToast } from '@/hooks/useToast'
import { EditVehicleModal } from './EditVehicleModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface VehicleTableViewProps {
  vehicles: VehicleWithDriver[]
}

export function VehicleTableView({ vehicles }: VehicleTableViewProps) {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { deleteVehicle, loading: deleting } = useDeleteVehicle()
  const { success, error } = useToast()

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<'plate' | 'driver' | 'category'>('plate')
  const [sortAsc, setSortAsc] = useState(true)

  // Edit / Delete state
  const [editingVehicle, setEditingVehicle] = useState<VehicleWithDriver | null>(null)
  const [deletingVehicle, setDeletingVehicle] = useState<VehicleWithDriver | null>(null)

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleDelete = async () => {
    if (!deletingVehicle) return
    const ok = await deleteVehicle(deletingVehicle.id)
    if (ok) {
      success(`Vehicle ${deletingVehicle.plate_number} deleted successfully.`)
      setDeletingVehicle(null)
    } else {
      error('Failed to delete vehicle.')
    }
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
    <>
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
                        onClick={(e) => handleCopy(vehicle.plate_number, `plate-${vehicle.id}`, e)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedId === `plate-${vehicle.id}` ? 'var(--success)' : 'var(--muted-foreground)',
                          cursor: 'pointer',
                          padding: '3px',
                          borderRadius: '4px',
                        }}
                        title="Copy plate"
                      >
                        {copiedId === `plate-${vehicle.id}` ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: '14px 18px' }}>
                    <span className={`cat-pill-indicator ${catColors.bg} ${catColors.text} ${catColors.border}`} style={{ fontSize: '0.75rem' }}>
                      {MODEL_CATEGORY_LABELS[vehicle.model_category]}
                    </span>
                  </td>

                  {/* Operational Status */}
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
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
                  </td>

                  {/* Driver */}
                  <td style={{ padding: '14px 18px' }}>
                    {vehicle.driver ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                          }}
                        >
                          {vehicle.driver.full_name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--foreground)' }}>{vehicle.driver.full_name}</span>
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

                      {/* Admin Edit Action */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingVehicle(vehicle)
                          }}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--muted)',
                            color: 'var(--foreground)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title="Edit Vehicle"
                          aria-label="Edit Vehicle"
                        >
                          <Pencil size={13} />
                        </button>
                      )}

                      {/* Admin Delete Action */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeletingVehicle(vehicle)
                          }}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '8px',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--color-danger, #ef4444)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title="Delete Vehicle"
                          aria-label="Delete Vehicle"
                        >
                          <Trash2 size={13} />
                        </button>
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

      {/* In-App Edit Modal */}
      {isAdmin && (
        <EditVehicleModal
          isOpen={!!editingVehicle}
          vehicle={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onSuccess={() => setEditingVehicle(null)}
        />
      )}

      {/* In-App Confirm Delete Modal */}
      {isAdmin && (
        <ConfirmModal
          isOpen={!!deletingVehicle}
          title="Delete Vehicle"
          message={`Are you sure you want to delete vehicle "${deletingVehicle?.plate_number}"? This will remove it from the fleet directory. This action cannot be undone.`}
          confirmLabel="Delete Vehicle"
          isDestructive
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeletingVehicle(null)}
        />
      )}
    </>
  )
}
