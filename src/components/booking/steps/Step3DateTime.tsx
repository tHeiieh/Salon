'use client'

import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { formatTime } from '@/lib/utils'
import type { TenantProfile, Employee, BookingState, TimeSlot } from '@/types'
import { addDays, format, startOfDay } from 'date-fns'
import { ar } from 'date-fns/locale'
import Image from 'next/image'

interface Props {
  tenant: TenantProfile
  state: BookingState
  updateState: (u: Partial<BookingState>) => void
  onNext: () => void
  employees: Employee[]
  primaryColor: string
}

function generateDates(count = 14): Date[] {
  const today = startOfDay(new Date())
  return Array.from({ length: count }, (_, i) => addDays(today, i))
}

export function Step3DateTime({ tenant, state, updateState, onNext, employees, primaryColor }: Props) {
  const p = primaryColor
  const [dates] = useState(generateDates())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | 'any'>('any')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedDate) return
    setLoading(true)
    setSlots([])
    setSelectedSlot(null)

    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const params = new URLSearchParams({
      tenantId: state.tenantId,
      date: dateStr,
      serviceIds: state.selectedServices.map(s => s.id).join(','),
    })
    if (selectedEmployee !== 'any') {
      params.set('employeeId', selectedEmployee.id)
    }

    fetch(`/api/appointments/availability?${params}`)
      .then(r => r.json())
      .then(d => setSlots(d.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }, [selectedDate, selectedEmployee, state.tenantId, state.selectedServices])

  function handleNext() {
    if (!selectedDate || !selectedSlot) return
    updateState({
      selectedDate: format(selectedDate, 'yyyy-MM-dd'),
      selectedTime: selectedSlot.time,
      selectedEmployee: selectedEmployee === 'any'
        ? employees.find(e => e.id === selectedSlot.employeeId)
        : selectedEmployee,
    })
    onNext()
  }

  const availableSlots = slots.filter(s => s.available)

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 16, height: 1, background: p }} />
          <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>STEP 3</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1a0f0a', margin: 0, letterSpacing: '-0.02em' }}>اختاري الموعد</h2>
        <p style={{ color: '#a89080', fontSize: 12, marginTop: 4, fontWeight: 600 }}>متى يناسبك؟</p>
      </div>

      {/* Employee Selection */}
      {employees.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#a89080', margin: '0 0 10px', letterSpacing: '0.03em' }}>المتخصصة</p>
          <div className="custom-scrollbar" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            <button
              onClick={() => setSelectedEmployee('any')}
              style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '10px 14px', borderRadius: 4, cursor: 'pointer', border: 'none', fontFamily: 'inherit', minWidth: 72,
                backgroundColor: selectedEmployee === 'any' ? '#1a0f0a' : '#faf8f5',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(194,132,122,0.2) 0%, rgba(212,169,106,0.2) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#C2847A" strokeWidth="1.5" />
                  <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke="#C2847A" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: selectedEmployee === 'any' ? '#fff' : '#6b5040', textAlign: 'center' }}>
                أي متخصصة
              </span>
            </button>

            {employees.map(emp => {
              const isActive = selectedEmployee !== 'any' && (selectedEmployee as Employee).id === emp.id
              return (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  style={{
                    flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '10px 14px', borderRadius: 4, cursor: 'pointer', border: 'none', fontFamily: 'inherit', minWidth: 72,
                    backgroundColor: isActive ? '#1a0f0a' : '#faf8f5',
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f0ede9', flexShrink: 0 }}>
                    {emp.photo_url ? (
                      <Image src={emp.photo_url} alt={emp.name_ar} width={44} height={44} style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="4" fill="#C2847A" fillOpacity="0.3" stroke="#C2847A" strokeWidth="1.5" />
                          <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke="#C2847A" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? '#fff' : '#6b5040', textAlign: 'center' }}>
                    {emp.name_ar}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Date Selection */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#a89080', margin: '0 0 10px', letterSpacing: '0.03em' }}>التاريخ</p>
        <div className="custom-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {dates.map(date => {
            const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                style={{
                  flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
                  minWidth: 58, fontFamily: 'inherit',
                  backgroundColor: isSelected ? '#1a0f0a' : '#faf8f5',
                  color: isSelected ? '#fff' : '#1a0f0a',
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.7 }}>
                  {format(date, 'EEE', { locale: ar })}
                </span>
                <span style={{ fontSize: 20, fontWeight: 900 }}>{format(date, 'd')}</span>
                {isToday && <span style={{ fontSize: 9, fontWeight: 700, color: p, marginTop: 1 }}>اليوم</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#a89080', margin: '0 0 10px', letterSpacing: '0.03em' }}>الوقت</p>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="shimmer" style={{ height: 46, borderRadius: 4 }} />
              ))}
            </div>
          ) : availableSlots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#a89080' }}>
              <Calendar size={32} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
              <p style={{ fontSize: 13, margin: 0, fontWeight: 600 }}>لا توجد مواعيد في هذا اليوم</p>
              <p style={{ fontSize: 11, marginTop: 4, color: '#c0a090' }}>جربي تاريخاً آخر</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {availableSlots.map(slot => {
                const isSelected = selectedSlot?.time === slot.time
                return (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      height: 46, borderRadius: 4, fontSize: 14, fontWeight: 800,
                      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      backgroundColor: isSelected ? '#1a0f0a' : '#faf8f5',
                      color: isSelected ? '#fff' : '#1a0f0a',
                    }}
                  >
                    {formatTime(slot.time)}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={!selectedDate || !selectedSlot}
        style={{
          width: '100%', height: 50, borderRadius: 999, border: 'none',
          backgroundColor: !selectedDate || !selectedSlot ? 'rgba(26,15,10,0.1)' : '#1a0f0a',
          color: !selectedDate || !selectedSlot ? '#a89080' : '#fff',
          fontSize: 14, fontWeight: 800,
          cursor: !selectedDate || !selectedSlot ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.02em',
        }}
      >
        تأكيد الموعد والمتابعة
      </button>
    </div>
  )
}
