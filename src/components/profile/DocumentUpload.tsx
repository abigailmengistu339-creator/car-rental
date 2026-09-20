import { useState, useRef } from 'react'
import { Upload, CheckCircle2, AlertCircle, Eye, Download, Trash2, Loader2, FileText } from 'lucide-react'
import { useUploadDocument } from '@/hooks/useVehicles'
import { DocumentViewerModal } from './DocumentViewerModal'

interface DocumentUploadProps {
  vehicleId: string
  docType: 'libre' | 'insurance'
  label: string
  currentUrl: string | null
  fileName?: string
  fileSize?: string
  uploadDate?: string
  readOnly?: boolean
  onUploadComplete: (url: string) => void
  onDeleteComplete?: () => void
}

export function DocumentUpload({
  vehicleId,
  docType,
  label,
  currentUrl,
  fileName,
  fileSize,
  uploadDate,
  readOnly = false,
  onUploadComplete,
  onDeleteComplete,
}: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadDocument, deleteDocument, uploading } = useUploadDocument()

  const hasDocument = !!currentUrl

  const handleFile = async (file: File) => {
    const url = await uploadDocument(vehicleId, file, docType)
    if (url) {
      onUploadComplete(url)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to remove this ${label}?`)) {
      await deleteDocument(vehicleId, docType)
      if (onDeleteComplete) onDeleteComplete()
    }
  }

  return (
    <>
      <div className="doc-box">
        {/* Header Status Row */}
        <div className="doc-box-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {hasDocument ? (
              <CheckCircle2 size={16} className="text-success" strokeWidth={2.4} />
            ) : (
              <AlertCircle size={16} className="text-destructive" strokeWidth={2.4} />
            )}
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{label}</span>
          </div>

          <span className={`doc-chip ${hasDocument ? 'doc-chip-valid' : 'doc-chip-missing'}`}>
            {hasDocument ? 'Uploaded & Verified' : 'Missing / Required'}
          </span>
        </div>

        {/* Existing File Info & Actions Bar */}
        {hasDocument && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: 'var(--muted)',
              border: '1px solid var(--border)',
              marginTop: '4px',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <FileText size={18} className="text-primary" />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--foreground)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {fileName || `${docType}_document.pdf`}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>
                  {fileSize || 'Standard Verified Doc'} {uploadDate && `· ${uploadDate}`}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Preview Button */}
              <button
                className="btn-primary-apple"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  background: 'var(--card)',
                  color: 'var(--foreground)',
                  boxShadow: 'none',
                  border: '1px solid var(--border)',
                }}
                onClick={() => setViewerOpen(true)}
                title="Preview document in app"
                id={`preview-${docType}-${vehicleId}`}
              >
                <Eye size={13} />
                <span>View</span>
              </button>

              {/* Direct Download Link */}
              <a
                href={currentUrl}
                download={fileName || 'document.png'}
                className="btn-primary-apple"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  background: 'var(--card)',
                  color: 'var(--foreground)',
                  boxShadow: 'none',
                  border: '1px solid var(--border)',
                }}
                title="Download document"
              >
                <Download size={13} />
              </a>

              {/* Delete Button (admin only) */}
              {!readOnly && (
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '8px',
                    background: 'var(--destructive-bg)',
                    border: '1px solid var(--destructive-border)',
                    color: 'var(--destructive)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Delete document"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Drag & Drop Upload Zone (hidden if read-only) */}
        {!readOnly && (
          <div
            className={`doc-dropzone-apple ${dragActive ? 'drag-active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            {uploading ? (
              <>
                <Loader2 size={22} className="animate-spin text-primary" />
                <span className="dropzone-label">Reading & saving document...</span>
              </>
            ) : (
              <>
                <Upload size={20} className="text-muted-foreground" />
                <span className="dropzone-label">
                  {hasDocument ? 'Tap or drop a file to replace document' : 'Drop official document here or tap to upload'}
                </span>
                <span className="dropzone-hint">Supports PDF, PNG, JPG, WebP up to 10MB</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* View-only placeholder if no document exists */}
        {readOnly && !hasDocument && (
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'var(--muted)',
              border: '1px dashed var(--border)',
              textAlign: 'center',
              fontSize: '0.8125rem',
              color: 'var(--muted-foreground)',
            }}
          >
            No document on file (read-only mode)
          </div>
        )}
      </div>

      {/* In-App Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={`${label} Preview`}
        fileUrl={currentUrl}
        fileName={fileName}
        fileSize={fileSize}
        uploadDate={uploadDate}
      />
    </>
  )
}
