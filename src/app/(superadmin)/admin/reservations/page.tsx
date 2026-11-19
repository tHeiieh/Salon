import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Calendar, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function ReservationsPage() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const [
    { count: total },
    { count: pending },
    { count: confirmed },
    { count: completed },
    { count: cancelled },
    { data: recent },
  ] = await Promise.all([
    admin.from('appointments').select('id', { count: 'exact', head: true }),
    admin.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('appointments').select('id', { count: 'exact', head: true }).in('status', ['confirmed', 'assigned', 'in_progress']),
    admin.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    admin.from('appointments').select('id', { count: 'exact', head: true }).in('status', ['cancelled', 'rejected']),
    admin.from('appointments')
      .select('id, booking_number, status, scheduled_date, final_price, tenant_id, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  const stats = [
    { label: 'إجمالي الحجوزات', value: total || 0, icon: Calendar, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'قيد الانتظار', value: pending || 0, icon: Clock, color: '#d97706', bg: '#fef3c7' },
    { label: 'نشطة', value: confirmed || 0, icon: TrendingUp, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'مكتملة', value: completed || 0, icon: CheckCircle, color: '#16a34a', bg: '#dcfce7' },
    { label: 'ملغية', value: cancelled || 0, icon: XCircle, color: '#dc2626', bg: '#fee2e2' },
  ]

  const statusAr: Record<string, string> = {
    pending: 'قيد الانتظار', confirmed: 'مؤكد', assigned: 'معين', in_progress: 'جارٍ',
    completed: 'مكتمل', cancelled: 'ملغي', rejected: 'مرفوض',
  }
  const statusColor: Record<string, { bg: string; color: string }> = {
    pending: { bg: '#fef9c3', color: '#a16207' },
    confirmed: { bg: '#dbeafe', color: '#1d4ed8' },
    assigned: { bg: '#ede9fe', color: '#6d28d9' },
    in_progress: { bg: '#fce7f3', color: '#be185d' },
    completed: { bg: '#dcfce7', color: '#16a34a' },
    cancelled: { bg: '#fee2e2', color: '#dc2626' },
    rejected: { bg: '#f4f4f5', color: '#71717a' },
  }

  return (
    <div dir="rtl">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={20} style={{ color: '#C2847A' }} /> مراقبة الحجوزات
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>إحصائيات الحجوزات على مستوى المنصة</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0',
            padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, margin: '2px 0 0', color: '#1a1a1a' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent appointments */}
      <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5', backgroundColor: '#fafafa' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>آخر الحجوزات على المنصة</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', padding: '10px 20px', backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
          {['رقم الحجز', 'الحالة', 'المبلغ', 'التاريخ'].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>{h}</span>
          ))}
        </div>
        {(recent || []).map((a: { id: string; booking_number: string; status: string; scheduled_date: string; final_price: number; created_at: string }) => {
          const sc = statusColor[a.status] || { bg: '#f4f4f5', color: '#71717a' }
          return (
            <div key={a.id} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
              padding: '12px 20px', borderBottom: '1px solid #f9f9f9', alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }} dir="ltr">{a.booking_number}</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, display: 'inline-block', backgroundColor: sc.bg, color: sc.color }}>
                {statusAr[a.status] || a.status}
              </span>
              <span style={{ fontSize: 13, color: '#1a1a1a' }}>{formatCurrency(a.final_price)}</span>
              <span style={{ fontSize: 12, color: '#888' }}>{new Date(a.scheduled_date || a.created_at).toLocaleDateString('ar-SA')}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
