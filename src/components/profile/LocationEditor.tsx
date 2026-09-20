import { useState } from 'react'
import { MapPin, Check, X, Pencil } from 'lucide-react'

interface LocationEditorProps {
  currentLocation: string
  readOnly?: boolean
  onSave: (newLocation: string) => Promise<void>
}

export function LocationEditor({ currentLocation, readOnly = false, onSave }: LocationEditorProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentLocation)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave(value)
    setSaving(false)
    setEditing(false)
  }

  const handleCancel = () => {
    setValue(currentLocation)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="inline-loc-box">
        <div className="loc-text">
          <MapPin size={16} className="text-primary" />
          <span>{currentLocation || 'No current location assigned'}</span>
        </div>
        {!readOnly && (
          <button
            className="loc-edit-trigger"
            onClick={() => setEditing(true)}
            title="Update vehicle location"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="inline-loc-box">
      <div className="loc-input-group">
        <MapPin size={16} className="text-primary" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="loc-input"
          placeholder="e.g. Bab Ezzouar, Algiers"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
        />
        <button
          className="loc-btn loc-btn-save"
          onClick={handleSave}
          disabled={saving}
          title="Save location"
        >
          <Check size={15} strokeWidth={2.5} />
        </button>
        <button
          className="loc-btn loc-btn-cancel"
          onClick={handleCancel}
          title="Cancel"
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
