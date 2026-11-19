import { notFound } from 'next/navigation'
import { getAuthContext } from '@/lib/server/getAuthContext'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight, Calendar, Clock, User, MapPin, Scissors, CreditCard, MessageSquare } from 'lucide-react'
import { CancelAppointmentButton } from '@/components/dashboard/CancelAppointmentButton'

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending:         { label: 'انتظار',     bg: '#fffbeb', color: '#d97706' },
  payment_pending: { label: 'بانتظار دفع', bg: '#fef9c3', color: '#a16207' },
  confirmed:       { label: 'مؤكد',       bg: '#eff6ff', color: '#2563eb' },
  assigned:        { label: 'تعيين',       bg: '#f5f3ff', color: '#7c3aed' },
  on_the_way:      { label: 'في الطريق',   bg: '#fff7ed', color: '#ea580c' },
  in_progress:     { label: 'جارٍ',        bg: '#fff7ed', color: '#ea580c' },
  completed:       { label: 'مكتمل',      bg: '#f0fdf4', color: '#16a34a' },
  cancelled:       { label: 'ملغي',        bg: '#fef2f2', color: '#dc2626' },
  no_show:         { label: 'غياب',        bg: '#f3f4f6', color: '#6b7280' },
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: 'نقداً',
  online: 'أونلاين',
  deposit: 'مقدم',
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: 'معلق',
  paid: 'مدفوع',
  partial: 'جزئي',
  refunded: 'مسترد',
  failed: 'فشل',
}

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { tenantId, admin } = await getAuthContext()

  const { data: appt } = await admin
    .from('appointments')
    .select(`
      id, booking_number, scheduled_date, scheduled_start, scheduled_end,
      status, total_price, discount_amount, travel_fee, vat_amount, final_price,
      payment_method, payment_status, deposit_amount, notes, cancellation_reason,
      cancelled_by, cancelled_at, completed_at, created_at,
      customer:customers(name, phone, email),
      employee:employees(name_ar, phone),
      address:customer_addresses(district_ar, city_ar, street_ar, notes),
      services:appointment_services(id, service_name_ar, price, duration_minutes),
      history:appointment_status_history(id, old_status, new_status, note, created_at)
    `)
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (!appt) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = appt as any
  const cfg = STATUS_CONFIG[a.status] || { label: a.status, bg: '#f5f5f5', color: '#666' }
  const canCancel = ['pending', 'confirmed', 'assigned', 'payment_pending'].includes(a.status)

  // Sort history newest first
  const history = [...(a.history || [])].sort(
    (x: { created_at: string }, y: { created_at: string }) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
      {/* Back + Header */}
      <div>
        <Link
          href="/dashboard/appointments"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#888', textDecoration: 'none', marginBottom: 12 }}
        >
          <ArrowRight size={14} />
          العودة للمواعيد
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
              موعد {a.booking_number}
            </h1>
            <p style={{ fontSize: 12, color: '#aaa', margin: '4px 0 0' }}>
              {new Date(a.created_at).toLocaleDateString('ar-SA')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              backgroundColor: cfg.bg, color: cfg.color,
            }}>
              {cfg.label}
            </span>
            {canCancel && <CancelAppointmentButton appointmentId={a.id} />}
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <Section>
        <Row icon={<Calendar size={16} />} label="التاريخ">
          {new Date(a.scheduled_date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Row>
        <Row icon={<Clock size={16} />} label="الوقت">
          {a.scheduled_start?.slice(0, 5)} – {a.scheduled_end?.slice(0, 5)}
        </Row>
      </Section>

      {/* Customer */}
      <Section title="العميلة">
        <Row icon={<User size={16} />} label="الاسم">{a.customer?.name || '—'}</Row>
        <Row icon={null} label="الجوال">{a.customer?.phone || '—'}</Row>
        <Row icon={null} label="البريد">{a.customer?.email || '—'}</Row>
      </Section>

      {/* Address */}
      <Section title="العنوان">
        <Row icon={<MapPin size={16} />} label="الحي">
          {a.address?.district_ar || '—'}
          {a.address?.city_ar ? `, ${a.address.city_ar}` : ''}
        </Row>
        {a.address?.street_ar && (
          <Row icon={null} label="الشارع">{a.address.street_ar}</Row>
        )}
        {a.address?.notes && (
          <Row icon={null} label="ملاحظات">{a.address.notes}</Row>
        )}
      </Section>

      {/* Employee */}
      {a.employee?.name_ar && (
        <Section title="الموظفة">
          <Row icon={<User size={16} />} label="الاسم">{a.employee.name_ar}</Row>
          {a.employee?.phone && (
            <Row icon={null} label="الجوال">{a.employee.phone}</Row>
          )}
        </Section>
      )}

      {/* Services */}
      <Section title="الخدمات">
        {a.services?.map((s: { id: string; service_name_ar: string; price: number; duration_minutes: number }) => (
          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scissors size={14} style={{ color: '#C2847A', flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: '#1a1a1a' }}>{s.service_name_ar}</span>
              <span style={{ fontSize: 11, color: '#aaa' }}>{s.duration_minutes} دقيقة</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{formatCurrency(s.price)}</span>
          </div>
        ))}
      </Section>

      {/* Pricing */}
      <Section title="المبلغ">
        <Row icon={<CreditCard size={16} />} label="المجموع الفرعي">{formatCurrency(a.total_price)}</Row>
        {Number(a.discount_amount) > 0 && (
          <Row icon={null} label="الخصم">- {formatCurrency(a.discount_amount)}</Row>
        )}
        {Number(a.travel_fee) > 0 && (
          <Row icon={null} label="رسوم التنقل">{formatCurrency(a.travel_fee)}</Row>
        )}
        {Number(a.vat_amount) > 0 && (
          <Row icon={null} label="الضريبة">{formatCurrency(a.vat_amount)}</Row>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, marginTop: 4, borderTop: '1px solid #f0f0f0' }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>الإجمالي</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#C2847A' }}>{formatCurrency(a.final_price)}</span>
        </div>
        <Row icon={null} label="طريقة الدفع">{PAYMENT_METHOD_LABEL[a.payment_method] || a.payment_method || '—'}</Row>
        <Row icon={null} label="حالة الدفع">{PAYMENT_STATUS_LABEL[a.payment_status] || a.payment_status || '—'}</Row>
        {Number(a.deposit_amount) > 0 && (
          <Row icon={null} label="المقدم المدفوع">{formatCurrency(a.deposit_amount)}</Row>
        )}
      </Section>

      {/* Notes */}
      {a.notes && (
        <Section title="ملاحظات">
          <Row icon={<MessageSquare size={16} />} label="">{a.notes}</Row>
        </Section>
      )}

      {/* Cancellation info */}
      {a.status === 'cancelled' && a.cancellation_reason && (
        <Section title="سبب الإلغاء">
          <Row icon={null} label="السبب">{a.cancellation_reason}</Row>
          {a.cancelled_by && (
            <Row icon={null} label="بواسطة">{{ customer: 'العميلة', salon: 'الصالون', system: 'النظام' }[a.cancelled_by as string] || a.cancelled_by}</Row>
          )}
        </Section>
      )}

      {/* Status History */}
      {history.length > 0 && (
        <Section title="سجل الحالة">
          {history.map((h: { id: string; old_status: string | null; new_status: string; note: string | null; created_at: string }) => {
            const newCfg = STATUS_CONFIG[h.new_status] || { label: h.new_status, color: '#666' }
            const oldCfg = h.old_status ? (STATUS_CONFIG[h.old_status] || { label: h.old_status, color: '#aaa' }) : null
            return (
              <div key={h.id} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                <div style={{ fontSize: 11, color: '#aaa', minWidth: 80, paddingTop: 2 }}>
                  {new Date(h.created_at).toLocaleDateString('ar-SA')}
                </div>
                <div>
                  <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {oldCfg && <span style={{ color: oldCfg.color }}>{oldCfg.label}</span>}
                    {oldCfg && <span style={{ color: '#ccc' }}>←</span>}
                    <span style={{ fontWeight: 600, color: newCfg.color }}>{newCfg.label}</span>
                  </div>
                  {h.note && <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{h.note}</p>}
                </div>
              </div>
            )
          })}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: '16px 20px' }}>
      {title && <h2 style={{ fontSize: 14, fontWeight: 600, color: '#888', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</h2>}
      {children}
    </div>
  )
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 13, flexShrink: 0 }}>
        {icon}
        {label}
      </div>
      <div style={{ fontSize: 14, color: '#1a1a1a', textAlign: 'left' }}>{children}</div>
    </div>
  )
}
