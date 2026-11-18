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
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>اختاري الموعد</h2>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>متى يناسبك؟</p>
      </div>

      {/* Employee Selection */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 12 }}>اختاري المتخصصة</h3>
        <div className="custom-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          <button
            onClick={() => setSelectedEmployee('any')}
            style={{
              flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: 12, borderRadius: 20, border: '2px solid', cursor: 'pointer', minWidth: 72,
              background: 'none',
              ...(selectedEmployee === 'any'
                ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                : { borderColor: 'transparent', backgroundColor: '#fff' }),
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(194,132,122,0.2) 0%, rgba(212,169,106,0.2) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>
              🌸
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#1a1a1a' }}>أي متخصصة</span>
          </button>

          {employees.map(emp => (
            <button
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: 12, borderRadius: 20, border: '2px solid', cursor: 'pointer', minWidth: 72,
                background: 'none',
                ...(selectedEmployee !== 'any' && (selectedEmployee as Employee).id === emp.id
                  ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                  : { borderColor: 'transparent', backgroundColor: '#fff' }),
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
                {emp.photo_url ? (
                  <Image src={emp.photo_url} alt={emp.name_ar} width={48} height={48} style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👩</div>
                )}
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#1a1a1a', textAlign: 'center' }}>{emp.name_ar}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 12 }}>اختاري التاريخ</h3>
        <div className="custom-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          {dates.map(date => {
            const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                style={{
                  flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '12px 16px', borderRadius: 20, border: '2px solid', cursor: 'pointer',
                  minWidth: 64, transition: 'all 0.15s', background: 'none',
                  ...(isSelected
                    ? { borderColor: primaryColor, backgroundColor: primaryColor, color: '#fff' }
                    : { borderColor: 'transparent', backgroundColor: '#fff', color: '#1a1a1a' }),
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>
                  {format(date, 'EEE', { locale: ar })}
                </span>
                <span style={{ fontSize: 20, fontWeight: 800 }}>{format(date, 'd')}</span>
                {isToday && <span style={{ fontSize: 10, opacity: 0.8 }}>اليوم</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 12 }}>اختاري الوقت</h3>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="shimmer" style={{ height: 48, borderRadius: 12 }} />
              ))}
            </div>
          ) : availableSlots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
              <Calendar size={40} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ fontSize: 13, margin: 0 }}>لا توجد مواعيد متاحة في هذا اليوم</p>
              <p style={{ fontSize: 11, marginTop: 4 }}>جربي تاريخاً آخر</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {availableSlots.map(slot => {
                const isSelected = selectedSlot?.time === slot.time
                return (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      height: 48, borderRadius: 12, fontSize: 13, fontWeight: 500,
                      border: '2px solid', cursor: 'pointer', transition: 'all 0.15s',
                      ...(isSelected
                        ? { borderColor: primaryColor, backgroundColor: primaryColor, color: '#fff' }
                        : { borderColor: '#e5e7eb', backgroundColor: '#fff', color: '#1a1a1a' }),
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
          width: '100%', height: 48, borderRadius: 12, border: 'none',
          backgroundColor: !selectedDate || !selectedSlot ? '#d1d5db' : primaryColor,
          color: '#fff', fontSize: 15, fontWeight: 600,
          cursor: !selectedDate || !selectedSlot ? 'not-allowed' : 'pointer',
        }}
      >
        تأكيد الموعد والمتابعة
      </button>
    </div>
  )
}
