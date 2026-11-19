'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle } from 'lucide-react'

export function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCancel(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'فشل الإلغاء')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      title="إلغاء الموعد"
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '5px 10px', borderRadius: 8, border: '1px solid #fecaca',
        backgroundColor: '#fff5f5', color: '#dc2626', fontSize: 12,
        cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
        opacity: loading ? 0.6 : 1, flexShrink: 0,
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#fef2f2')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff5f5')}
    >
      <XCircle size={13} />
      {loading ? 'جارٍ...' : 'إلغاء'}
    </button>
  )
}
