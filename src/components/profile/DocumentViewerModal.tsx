import { useState, useEffect } from 'react'
import { X, Download, ZoomIn, ZoomOut, RotateCcw, ExternalLink } from 'lucide-react'

interface DocumentViewerModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  fileUrl: string | null
  fileName?: string
  fileSize?: string
  uploadDate?: string
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  title,
  fileUrl,
  fileName,
  fileSize,
  uploadDate,
}: DocumentViewerModalProps) {
  const [zoom, setZoom] = useState(1)

  // Reset zoom and handle ESC key
  useEffect(() => {
    if (isOpen) {
      setZoom(1)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !fileUrl) return null

  const isPdf = fileUrl.includes('application/pdf') || (fileName && fileName.toLowerCase().endsWith('.pdf'))
  const isSvg = fileUrl.startsWith('data:image/svg+xml')

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5))
  const handleReset = () => setZoom(1)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'fade-in 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fade-in-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 22px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)' }}>
              {title}
            </h3>
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>
              <span>{fileName || 'Document File'}</span>
              {fileSize && <span>· {fileSize}</span>}
              {uploadDate && <span>· {uploadDate}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Zoom Controls (for images/SVGs) */}
            {(!isPdf || isSvg) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--muted)',
                  borderRadius: '10px',
                  padding: '2px',
                  border: '1px solid var(--border)',
                }}
              >
                <button
                  onClick={handleZoomOut}
                  style={{ background: 'transparent', border: 'none', padding: '6px', color: 'var(--foreground)', cursor: 'pointer' }}
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={handleReset}
                  style={{ background: 'transparent', border: 'none', padding: '6px', color: 'var(--foreground)', cursor: 'pointer' }}
                  title="Reset Zoom"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={handleZoomIn}
                  style={{ background: 'transparent', border: 'none', padding: '6px', color: 'var(--foreground)', cursor: 'pointer' }}
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            )}

            {/* Direct Download */}
            <a
              href={fileUrl}
              download={fileName || 'document.png'}
              className="btn-primary-apple"
              style={{ padding: '7px 14px', fontSize: '0.75rem' }}
              title="Download File"
            >
              <Download size={14} />
              <span>Download</span>
            </a>

            {/* Open Raw in New Tab */}
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--foreground)',
                cursor: 'pointer',
              }}
              title="Open full resolution in new tab"
            >
              <ExternalLink size={15} />
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--foreground)',
                cursor: 'pointer',
              }}
              title="Close Preview (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body / Document Preview Canvas */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--background)',
            minHeight: '440px',
          }}
        >
          {isPdf && !isSvg ? (
            <iframe
              src={fileUrl}
              title={title}
              sandbox="allow-same-origin"
              style={{
                width: '100%',
                height: '600px',
                border: 'none',
                borderRadius: '12px',
              }}
            />
          ) : (
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 150ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={fileUrl}
                alt={title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '68vh',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-md)',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
