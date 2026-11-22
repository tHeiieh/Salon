'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Appointment {
  id: string
  booking_number?: string
  scheduled_date: string
  scheduled_start: string
  scheduled_end?: string
  status: string
  final_price?: number
  customer?: { name?: string; phone?: string } | null
  employee?: { id?: string; name_ar?: string } | null
  services?: Array<{ service_name_ar?: string }>
}

interface Employee {
  id: string
  name_ar: string
}

interface Props {
  appointments: Appointment[]
  employees: Employee[]
}

const STATUS_COLOR: Record<string, { bg: string; border: string; text: string }> = {
  pending:     { bg: '#fffbeb', border: '#fbbf24', text: '#d97706' },
  confirmed:   { bg: '#eff6ff', border: '#60a5fa', text: '#2563eb' },
  assigned:    { bg: '#f5f3ff', border: '#a78bfa', text: '#7c3aed' },
  in_progress: { bg: '#fff7ed', border: '#fb923c', text: '#ea580c' },
  completed:   { bg: '#f0fdf4', border: '#4ade80', text: '#16a34a' },
  cancelled:   { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' },
}

const p = '#C2847A'

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7) // 7am–9pm
const SLOT_H = 56 // px per hour

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function localDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function CalendarClient({ appointments, employees }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(localDateStr(new Date()))

  function prev() {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    setSelectedDate(localDateStr(d))
  }
  function next() {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    setSelectedDate(localDateStr(d))
  }

  const dayAppts = appointments.filter(a => a.scheduled_date === selectedDate)

  // Which employees have appointments today (or show all if none)
  const activeEmpIds = new Set(dayAppts.map(a => a.employee?.id).filter(Boolean))
  const shownEmps = employees.length > 0
    ? employees.filter(e => activeEmpIds.size === 0 || activeEmpIds.has(e.id))
    : []
  // If no employees at all, show an "unassigned" column
  const cols: Array<{ id: string | null; name: string }> =
    shownEmps.length > 0
      ? shownEmps.map(e => ({ id: e.id, name: e.name_ar }))
      : [{ id: null, name: 'غير معين' }]

  // Map appointments to columns
  function apptsByEmp(empId: string | null) {
    return dayAppts.filter(a =>
      empId === null ? !a.employee?.id : a.employee?.id === empId
    )
  }

  const dateLabel = new Date(selectedDate + 'T12:00:00').toLocaleDateString('ar-SA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const totalH = HOURS.length * SLOT_H
  const colW = Math.max(140, Math.floor((cols.length > 0 ? 800 / cols.length : 800)))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 20, height: 1, background: p }} />
            <span style={{ color: p, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em' }}>CALENDAR</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#1a0f0a', letterSpacing: '-0.02em' }}>
            {dateLabel}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={prev} style={{ width: 32, height: 32, borderRadius: 999, border: '1px solid rgba(26,15,10,0.1)', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={16} style={{ color: '#6b5040' }} />
          </button>
          <button onClick={() => setSelectedDate(localDateStr(new Date()))} style={{ padding: '0 14px', height: 32, borderRadius: 999, border: '1px solid rgba(26,15,10,0.1)', backgroundColor: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#6b5040', fontFamily: 'inherit' }}>
            اليوم
          </button>
          <button onClick={next} style={{ width: 32, height: 32, borderRadius: 999, border: '1px solid rgba(26,15,10,0.1)', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={16} style={{ color: '#6b5040' }} />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ backgroundColor: '#fff', border: '1px solid rgba(26,15,10,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        {/* Column headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(26,15,10,0.08)' }}>
          {/* Time gutter */}
          <div style={{ width: 52, flexShrink: 0, borderLeft: '1px solid rgba(26,15,10,0.06)' }} />
          {cols.map(col => (
            <div key={col.id ?? 'unassigned'} style={{
              flex: 1, minWidth: colW, padding: '12px 10px', textAlign: 'center',
              borderLeft: '1px solid rgba(26,15,10,0.06)',
            }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#1a0f0a' }}>{col.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#a89080' }}>
                {apptsByEmp(col.id).length} مواعيد
              </p>
            </div>
          ))}
        </div>

        {/* Scrollable body */}
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
          <div style={{ display: 'flex', minWidth: 52 + cols.length * colW }}>
            {/* Time gutter */}
            <div style={{ width: 52, flexShrink: 0, position: 'relative', height: totalH }}>
              {HOURS.map(h => (
                <div key={h} style={{
                  position: 'absolute', top: (h - 7) * SLOT_H, left: 0, right: 0,
                  height: SLOT_H, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                  paddingRight: 8, paddingTop: 4,
                }}>
                  <span style={{ fontSize: 10, color: '#a89080', fontWeight: 600 }}>
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Employee columns */}
            {cols.map(col => {
              const colAppts = apptsByEmp(col.id)
              return (
                <div key={col.id ?? 'unassigned'} style={{
                  flex: 1, minWidth: colW, position: 'relative', height: totalH,
                  borderLeft: '1px solid rgba(26,15,10,0.06)',
                }}>
                  {/* Hour lines */}
                  {HOURS.map(h => (
                    <div key={h} style={{
                      position: 'absolute', top: (h - 7) * SLOT_H, left: 0, right: 0, height: SLOT_H,
                      borderBottom: '1px solid rgba(26,15,10,0.04)',
                    }} />
                  ))}

                  {/* Appointments */}
                  {colAppts.map(appt => {
                    const startMins = toMinutes(appt.scheduled_start)
                    const endMins = appt.scheduled_end
                      ? toMinutes(appt.scheduled_end)
                      : startMins + 60
                    const topOffset = (startMins - 7 * 60) / 60 * SLOT_H
                    const height = Math.max(32, (endMins - startMins) / 60 * SLOT_H - 2)

                    if (topOffset < 0 || topOffset > totalH) return null

                    const sc = STATUS_COLOR[appt.status] || { bg: '#f5f5f5', border: '#ccc', text: '#666' }
                    return (
                      <a
                        key={appt.id}
                        href={`/dashboard/appointments/${appt.id}`}
                        style={{
                          position: 'absolute', top: topOffset + 1, left: 4, right: 4,
                          height, borderRadius: 6,
                          backgroundColor: sc.bg,
                          borderRight: `3px solid ${sc.border}`,
                          padding: '4px 6px',
                          overflow: 'hidden', textDecoration: 'none',
                          display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                          boxShadow: '0 1px 3px rgba(26,15,10,0.06)',
                        }}
                      >
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: sc.text, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {appt.scheduled_start.slice(0, 5)} · {appt.customer?.name || 'عميل'}
                        </p>
                        {height > 42 && (
                          <p style={{ margin: '1px 0 0', fontSize: 10, color: '#6b5040', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {appt.services?.map(s => s.service_name_ar).join(', ')}
                          </p>
                        )}
                        {height > 60 && appt.final_price ? (
                          <p style={{ margin: '2px 0 0', fontSize: 10, fontWeight: 700, color: p }}>
                            {appt.final_price} ر.س
                          </p>
                        ) : null}
                      </a>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {dayAppts.length === 0 && (
        <p style={{ textAlign: 'center', color: '#a89080', fontSize: 13, margin: '8px 0 0' }}>
          لا توجد مواعيد في هذا اليوم
        </p>
      )}
    </div>
  )
}
