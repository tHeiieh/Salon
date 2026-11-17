'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/utils'
import type { TenantProfile, Employee, BookingState, TimeSlot } from '@/types'
import { addDays, format, isBefore, startOfDay } from 'date-fns'
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
    <div className="space-y-6 page-enter">
      <div>
        <h2 className="text-2xl font-bold text-foreground">اختاري الموعد</h2>
        <p className="text-muted-foreground text-sm mt-1">متى يناسبك؟</p>
      </div>

      {/* Employee Selection */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">اختاري المتخصصة</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setSelectedEmployee('any')}
            className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all min-w-[72px]`}
            style={selectedEmployee === 'any'
              ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
              : { borderColor: 'transparent', backgroundColor: 'white' }
            }
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl">
              🌸
            </div>
            <span className="text-xs font-medium text-foreground">أي متخصصة</span>
          </button>
          {employees.map(emp => (
            <button
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all min-w-[72px]`}
              style={selectedEmployee !== 'any' && (selectedEmployee as Employee).id === emp.id
                ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                : { borderColor: 'transparent', backgroundColor: 'white' }
              }
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                {emp.photo_url ? (
                  <Image src={emp.photo_url} alt={emp.name_ar} width={48} height={48} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">👩</div>
                )}
              </div>
              <span className="text-xs font-medium text-foreground text-center">{emp.name_ar}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">اختاري التاريخ</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {dates.map(date => {
            const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all min-w-[64px]`}
                style={isSelected
                  ? { borderColor: primaryColor, backgroundColor: primaryColor, color: 'white' }
                  : { borderColor: 'transparent', backgroundColor: 'white', color: 'inherit' }
                }
              >
                <span className="text-xs font-medium opacity-80">
                  {format(date, 'EEE', { locale: ar })}
                </span>
                <span className="text-xl font-bold">{format(date, 'd')}</span>
                {isToday && <span className="text-xs opacity-80">اليوم</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">اختاري الوقت</h3>
          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl shimmer" />
              ))}
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا توجد مواعيد متاحة في هذا اليوم</p>
              <p className="text-xs mt-1">جربي تاريخاً آخر</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map(slot => {
                const isSelected = selectedSlot?.time === slot.time
                return (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedSlot(slot)}
                    className={`h-12 rounded-xl text-sm font-medium border-2 transition-all`}
                    style={isSelected
                      ? { borderColor: primaryColor, backgroundColor: primaryColor, color: 'white' }
                      : { borderColor: 'hsl(var(--border))', backgroundColor: 'white' }
                    }
                  >
                    {formatTime(slot.time)}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <Button
        className="w-full rounded-xl h-12 text-base"
        style={{ backgroundColor: primaryColor }}
        disabled={!selectedDate || !selectedSlot}
        onClick={handleNext}
      >
        تأكيد الموعد والمتابعة
      </Button>
    </div>
  )
}
