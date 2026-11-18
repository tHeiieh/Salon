'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Calendar, MapPin, User, RotateCcw, Share2 } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
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
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'center' }}>
      {/* Success */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', marginBottom: 16,
          backgroundColor: `${primaryColor}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <CheckCircle size={40} style={{ color: primaryColor }} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>تم الحجز بنجاح! 🎉</h2>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>
          سيتم التواصل معك قريباً لتأكيد الموعد
        </p>
      </div>

      {/* Booking Details */}
      <div style={{ backgroundColor: '#fff', borderRadius: 20, border: '1px solid #f0f0f0', padding: 20, textAlign: 'right' }}>
        {appointment && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 12, borderRadius: 12, marginBottom: 16,
            backgroundColor: `${primaryColor}08`,
          }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>رقم الحجز</span>
            <span style={{ fontWeight: 700, color: primaryColor }}>{appointment.booking_number}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Services */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
              ✨
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>الخدمات</p>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', margin: '2px 0 0' }}>
                {state.selectedServices.map(s => s.name_ar).join(' • ')}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          {state.selectedDate && state.selectedTime && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Calendar size={16} style={{ color: '#6b7280' }} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>الموعد</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', margin: '2px 0 0' }}>
                  {formatDate(state.selectedDate, 'PPP')} - {formatTime(state.selectedTime)}
                </p>
              </div>
            </div>
          )}

          {/* Address */}
          {address && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={16} style={{ color: '#6b7280' }} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>العنوان</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', margin: '2px 0 0' }}>
                  {address.district_ar}، {address.city_ar}
                  {address.street && ` - ${address.street}`}
                </p>
              </div>
            </div>
          )}

          {/* Employee */}
          {state.selectedEmployee && state.selectedEmployee !== 'any' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={16} style={{ color: '#6b7280' }} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>المتخصصة</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', margin: '2px 0 0' }}>
                  {typeof state.selectedEmployee === 'object' ? state.selectedEmployee.name_ar : ''}
                </p>
              </div>
            </div>
          )}

          {/* Payment Total */}
          {appointment && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>الإجمالي</span>
              <span style={{ fontWeight: 700, fontSize: 17, color: primaryColor }}>
                {formatCurrency(appointment.final_price)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Policy */}
      <div style={{ padding: 16, backgroundColor: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a', textAlign: 'right' }}>
        <p style={{ fontSize: 12, color: '#92400e', margin: 0 }}>
          ⚡ يمكنك إلغاء الموعد مجاناً خلال {tenant.cancellation_hours} ساعة من وقت الموعد
        </p>
      </div>

      {/* WhatsApp */}
      {tenant.whatsapp && (
        <a
          href={`https://wa.me/${tenant.whatsapp?.replace(/\D/g, '')}?text=مرحباً، لدي استفسار عن حجزي`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: 12, borderRadius: 12,
            backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
            color: '#16a34a', fontSize: 13, fontWeight: 500, textDecoration: 'none',
          }}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          </svg>
          تواصلي معنا عبر واتساب
        </a>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onNewBooking}
          style={{
            flex: 1, height: 48, borderRadius: 12, border: '1px solid #e5e7eb',
            backgroundColor: '#fff', color: '#374151', fontSize: 14, fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <RotateCcw size={16} />
          حجز جديد
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `حجز ${tenant.name_ar}`,
                text: `تم حجز موعدي في ${tenant.name_ar}`,
                url: window.location.href,
              })
            }
          }}
          style={{
            flex: 1, height: 48, borderRadius: 12, border: 'none',
            backgroundColor: primaryColor, color: '#fff', fontSize: 14, fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Share2 size={16} />
          مشاركة
        </button>
      </div>
    </div>
  )
}
