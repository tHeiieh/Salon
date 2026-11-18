'use client'

import { useState } from 'react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import type { AppointmentRow } from '@/app/(employee)/portal/page'

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'نقداً',
  online: 'بطاقة',
  deposit: 'عربون',
}

const UPDATABLE_STATUSES = ['confirmed', 'assigned', 'in_progress']

const NEXT_STATUS: Record<string, { status: string; label: string }> = {
  confirmed:   { status: 'in_progress', label: 'بدء الخدمة' },
  assigned:    { status: 'in_progress', label: 'بدء الخدمة' },
  in_progress: { status: 'completed',   label: 'إنهاء الخدمة' },
}

interface Props {
  appointment: AppointmentRow
  statusConfig: Record<string, { label: string; bg: string; color: string }>
  highlight?: boolean
}

export function EmployeeAppointmentCard({ appointment: initial, statusConfig, highlight }: Props) {
  const [appointment, setAppointment] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cfg = statusConfig[appointment.status] || { label: appointment.status, bg: '#f5f5f5', color: '#666' }
  const nextAction = NEXT_STATUS[appointment.status]

  async function updateStatus() {
    if (!nextAction) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/appointments/${appointment.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextAction.status }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'فشل التحديث')
        return
      }
      setAppointment(prev => ({ ...prev, status: nextAction.status }))
    } catch {
      setError('تعذر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: 16,
      border: highlight ? '2px solid #C2847A' : '1px solid #f0f0f0',
      padding: 16,
      boxShadow: highlight ? '0 4px 16px rgba(194,132,122,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            {appointment.customers?.name || 'عميلة'}
          </p>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }} dir="ltr">
            {appointment.customers?.phone}
          </p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
          backgroundColor: cfg.bg, color: cfg.color,
        }}>
          {cfg.label}
        </span>
      </div>

      {/* Services */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px' }}>الخدمات</p>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
          {appointment.appointment_services.map(s => s.service_name_ar).join(' • ')}
        </p>
      </div>

      {/* Date + Time + Payment */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {formatDate(appointment.scheduled_date, 'PPP')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {formatTime(appointment.scheduled_start)} - {formatTime(appointment.scheduled_end)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {formatCurrency(appointment.final_price)} · {PAYMENT_LABELS[appointment.payment_method] || appointment.payment_method}
        </div>
      </div>

      {/* Booking number */}
      <p style={{ fontSize: 11, color: '#d1d5db', margin: '0 0 12px', fontFamily: 'monospace' }}>
        #{appointment.booking_number}
      </p>

      {/* Action button */}
      {nextAction && (
        <div>
          {error && (
            <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 8 }}>{error}</p>
          )}
          <button
            onClick={updateStatus}
            disabled={loading}
            style={{
              width: '100%', height: 44, borderRadius: 12, border: 'none',
              backgroundColor: appointment.status === 'in_progress' ? '#16a34a' : '#C2847A',
              color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {loading ? 'جارٍ التحديث...' : nextAction.label}
          </button>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
