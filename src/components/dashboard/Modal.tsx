'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  title: string
  onClose: () => void
  children: React.ReactNode
  maxWidth?: number
}

export function Modal({ title, onClose, children, maxWidth = 480 }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        backgroundColor: '#fff', borderRadius: 16,
        width: '100%', maxWidth, maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#888', display: 'flex', padding: 4, borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}

export const inputStyle: React.CSSProperties = {
  width: '100%', height: 44, borderRadius: 10,
  border: '1.5px solid #e5e5e5', padding: '0 12px',
  fontSize: 14, color: '#1a1a1a', backgroundColor: '#fafafa',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}

export const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#3d2820', marginBottom: 6,
}

export function FormActions({
  onCancel, loading, submitLabel,
}: { onCancel: () => void; loading: boolean; submitLabel: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
      <button
        type="submit"
        disabled={loading}
        style={{
          flex: 1, height: 44, borderRadius: 10, border: 'none',
          backgroundImage: loading
            ? 'linear-gradient(135deg,#d4a89e,#d4a89e)'
            : 'linear-gradient(135deg,#C2847A,#b06470)',
          color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'جارٍ الحفظ...' : submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        style={{
          width: 90, height: 44, borderRadius: 10,
          border: '1.5px solid #e5e5e5', backgroundColor: '#fff',
          fontSize: 14, color: '#666', cursor: 'pointer',
        }}
      >
        إلغاء
      </button>
    </div>
  )
}
