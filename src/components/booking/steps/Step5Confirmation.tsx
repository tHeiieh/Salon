'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Calendar, MapPin, User, Clock, Share2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, formatTime, APPOINTMENT_STATUS_AR } from '@/lib/utils'
import type { TenantProfile, Appointment, BookingState } from '@/types'

interface Props {
  bookingId: string
  tenant: TenantProfile
  state: BookingState
  primaryColor: string
  onNewBooking: () => void
}

export function Step5Confirmation({ bookingId, tenant, state, primaryColor, onNewBooking }: Props) {
  const [appointment, setAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    fetch(`/api/appointments/${bookingId}`)
      .then(r => r.json())
      .then(d => setAppointment(d.appointment))
      .catch(() => {})
  }, [bookingId])

  const address = state.newAddress || state.address

  return (
    <div className="space-y-6 page-enter text-center">
      {/* Success Icon */}
      <div className="flex flex-col items-center pt-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <CheckCircle className="w-10 h-10" style={{ color: primaryColor }} />
        </div>
        <h2 className="text-2xl font-bold text-foreground">تم الحجز بنجاح! 🎉</h2>
        <p className="text-muted-foreground text-sm mt-2">
          سيتم التواصل معك قريباً لتأكيد الموعد
        </p>
      </div>

      {/* Booking Details */}
      <div className="bg-white rounded-2xl border border-border/50 p-5 text-right space-y-4">
        {appointment && (
          <div
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ backgroundColor: `${primaryColor}08` }}
          >
            <span className="text-sm text-muted-foreground">رقم الحجز</span>
            <span className="font-bold text-foreground" style={{ color: primaryColor }}>
              {appointment.booking_number}
            </span>
          </div>
        )}

        <div className="space-y-3">
          {/* Services */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              ✨
            </div>
            <div>
              <p className="text-xs text-muted-foreground">الخدمات</p>
              <p className="text-sm font-medium text-foreground">
                {state.selectedServices.map(s => s.name_ar).join(' • ')}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          {state.selectedDate && state.selectedTime && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الموعد</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(state.selectedDate, 'PPP')} - {formatTime(state.selectedTime)}
                </p>
              </div>
            </div>
          )}

          {/* Address */}
          {address && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">العنوان</p>
                <p className="text-sm font-medium text-foreground">
                  {address.district_ar}، {address.city_ar}
                  {address.street && ` - ${address.street}`}
                </p>
              </div>
            </div>
          )}

          {/* Employee */}
          {state.selectedEmployee && state.selectedEmployee !== 'any' && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">المتخصصة</p>
                <p className="text-sm font-medium text-foreground">
                  {typeof state.selectedEmployee === 'object' ? state.selectedEmployee.name_ar : ''}
                </p>
              </div>
            </div>
          )}

          {/* Payment */}
          {appointment && (
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">الإجمالي</span>
              <span className="font-bold text-lg" style={{ color: primaryColor }}>
                {formatCurrency(appointment.final_price)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-right">
        <p className="text-xs text-amber-800">
          ⚡ يمكنك إلغاء الموعد مجاناً خلال {tenant.cancellation_hours} ساعة من وقت الموعد
        </p>
      </div>

      {/* WhatsApp Support */}
      {tenant.whatsapp && (
        <a
          href={`https://wa.me/${tenant.whatsapp?.replace(/\D/g, '')}?text=مرحباً، لدي استفسار عن حجزي`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          </svg>
          تواصلي معنا عبر واتساب
        </a>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 rounded-xl"
          onClick={onNewBooking}
        >
          <RotateCcw className="w-4 h-4" />
          حجز جديد
        </Button>
        <Button
          className="flex-1 rounded-xl"
          style={{ backgroundColor: primaryColor }}
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `حجز ${tenant.name_ar}`,
                text: `تم حجز موعدي في ${tenant.name_ar}`,
                url: window.location.href,
              })
            }
          }}
        >
          <Share2 className="w-4 h-4" />
          مشاركة
        </Button>
      </div>
    </div>
  )
}
