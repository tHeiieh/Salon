'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div dir="rtl" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#f9f9f9', fontFamily: 'system-ui',
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 16, padding: 32, maxWidth: 480,
        border: '1px solid #f0f0f0', textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>
          حدث خطأ في لوحة التحكم
        </h2>
        <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px', direction: 'ltr', textAlign: 'left', background: '#f5f5f5', padding: '8px 12px', borderRadius: 8, wordBreak: 'break-all' }}>
          {error.message || 'Unknown error'}
        </p>
        {error.digest && (
          <p style={{ fontSize: 11, color: '#999', margin: '0 0 16px', direction: 'ltr' }}>
            Digest: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            backgroundColor: '#C2847A', color: '#fff', fontSize: 14,
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  )
}
