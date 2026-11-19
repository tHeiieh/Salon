import { createClient as createAdminClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Building2, Phone, Mail, Globe, CreditCard, Users, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
      <span style={{ fontSize: 12, color: '#aaa', minWidth: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#1a1a1a', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function Card({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #f5f5f5', backgroundColor: '#fafafa' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#1a1a1a' }}>{title}</h3>
      </div>
      <div style={{ padding: '4px 20px 16px' }}>{children}</div>
    </div>
  )
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: '#dcfce7', color: '#16a34a', label: 'نشط' },
  trial: { bg: '#fef9c3', color: '#a16207', label: 'تجريبي' },
  suspended: { bg: '#fee2e2', color: '#dc2626', label: 'موقوف' },
  pending: { bg: '#e0f2fe', color: '#0369a1', label: 'قيد المراجعة' },
  cancelled: { bg: '#f4f4f5', color: '#71717a', label: 'ملغي' },
}

export default async function SalonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const [
    { data: tenant },
    { data: profile },
    { data: subscription },
    { count: employeeCount },
    { count: serviceCount },
    { count: appointmentCount },
    { count: customerCount },
  ] = await Promise.all([
    admin.from('tenants').select('*').eq('id', id).single(),
    admin.from('tenant_profiles').select('*').eq('tenant_id', id).single(),
    admin.from('tenant_subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('tenant_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    admin.from('employees').select('id', { count: 'exact', head: true }).eq('tenant_id', id),
    admin.from('services').select('id', { count: 'exact', head: true }).eq('tenant_id', id),
    admin.from('appointments').select('id', { count: 'exact', head: true }).eq('tenant_id', id),
    admin.from('customers').select('id', { count: 'exact', head: true }).eq('tenant_id', id),
  ])

  if (!tenant) notFound()

  const sc = STATUS_BADGE[tenant.status] || STATUS_BADGE.cancelled
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = subscription as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = profile as any

  return (
    <div dir="rtl" style={{ maxWidth: 900 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: '#888' }}>
        <Link href="/admin/salons" style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowRight size={14} style={{ transform: 'scaleX(-1)' }} /> الصالونات
        </Link>
        <span>/</span>
        <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{p?.name_ar || tenant.slug}</span>
      </div>

      {/* Header */}
      <div style={{
        backgroundColor: '#fff', borderRadius: 16, border: '1px solid #f0f0f0',
        padding: '24px 24px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16, flexShrink: 0,
          backgroundImage: 'linear-gradient(135deg,rgba(194,132,122,0.2),rgba(176,100,112,0.2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Building2 size={26} style={{ color: '#C2847A' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{p?.name_ar || tenant.slug}</h1>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
              backgroundColor: sc.bg, color: sc.color,
            }}>{sc.label}</span>
          </div>
          <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }} dir="ltr">{tenant.slug}</p>
          {p?.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#aaa', marginTop: 4 }} dir="ltr">
              <Phone size={11} /> {p.phone}
              {p.email && <><span style={{ margin: '0 6px' }}>·</span><Mail size={11} /> {p.email}</>}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <Link href={`/book/${tenant.slug}`} target="_blank">
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', borderRadius: 9,
              border: '1.5px solid #e5e5e5', backgroundColor: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#555',
            }}>
              <Globe size={13} /> فتح صفحة الصالون
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'الموظفات', value: employeeCount || 0, icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'الخدمات', value: serviceCount || 0, icon: CreditCard, color: '#0ea5e9', bg: '#f0f9ff' },
          { label: 'الحجوزات الكلية', value: appointmentCount || 0, icon: Calendar, color: '#d97706', bg: '#fef3c7' },
          { label: 'العملاء', value: customerCount || 0, icon: Users, color: '#16a34a', bg: '#dcfce7' },
        ].map(s => (
          <div key={s.label} style={{
            backgroundColor: '#fff', borderRadius: 12, border: '1px solid #f0f0f0',
            padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Salon Info */}
        <Card title="معلومات الصالون">
          <InfoRow label="الاسم (عربي)" value={p?.name_ar} />
          <InfoRow label="الاسم (إنجليزي)" value={p?.name_en} />
          <InfoRow label="الهاتف" value={p?.phone} />
          <InfoRow label="البريد الإلكتروني" value={p?.email} />
          <InfoRow label="الواتساب" value={p?.whatsapp} />
          <InfoRow label="رابط الحجز" value={tenant.slug} />
          <InfoRow label="تاريخ التسجيل" value={new Date(tenant.created_at).toLocaleDateString('ar-SA')} />
        </Card>

        {/* Subscription */}
        <Card title="الاشتراك الحالي">
          {sub ? (
            <>
              <InfoRow label="الخطة" value={sub.plan?.name_ar} />
              <InfoRow label="الحالة" value={
                sub.status === 'active' ? 'نشط' :
                sub.status === 'trial' ? 'تجريبي' :
                sub.status === 'cancelled' ? 'ملغي' : sub.status
              } />
              <InfoRow label="دورة الفوترة" value={sub.billing_cycle === 'monthly' ? 'شهري' : 'سنوي'} />
              <InfoRow label="المبلغ" value={formatCurrency(sub.billing_cycle === 'monthly' ? sub.plan?.price_monthly || 0 : sub.plan?.price_yearly || 0)} />
              <InfoRow label="بداية الفترة" value={new Date(sub.current_period_start).toLocaleDateString('ar-SA')} />
              <InfoRow label="نهاية الفترة" value={new Date(sub.current_period_end).toLocaleDateString('ar-SA')} />
            </>
          ) : (
            <p style={{ fontSize: 13, color: '#aaa', padding: '12px 0' }}>لا يوجد اشتراك نشط</p>
          )}
        </Card>

        {/* Branding */}
        {p && (
          <Card title="الهوية البصرية">
            <InfoRow label="اللون الرئيسي" value={p.primary_color} />
            <InfoRow label="العملة" value={p.currency} />
            <InfoRow label="رقم السجل التجاري" value={p.cr_number} />
            <InfoRow label="رقم الضريبة (VAT)" value={p.vat_number} />
            <InfoRow label="نطاق مخصص" value={p.custom_domain} />
            <InfoRow label="نسبة الإيداع" value={p.deposit_percentage ? `${p.deposit_percentage}%` : undefined} />
          </Card>
        )}

        {/* Quick Actions */}
        <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', padding: '16px 20px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 14px', color: '#1a1a1a' }}>إجراءات سريعة</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href={`/admin/salons`}>
              <button style={{
                width: '100%', height: 40, borderRadius: 10, border: '1.5px solid #e5e5e5',
                backgroundColor: '#fff', fontSize: 13, fontWeight: 600, color: '#555', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Building2 size={14} /> العودة لقائمة الصالونات
              </button>
            </Link>
            <Link href={`/book/${tenant.slug}`} target="_blank">
              <button style={{
                width: '100%', height: 40, borderRadius: 10, border: 'none',
                backgroundImage: 'linear-gradient(135deg,#C2847A,#b06470)', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Globe size={14} /> فتح صفحة الحجز
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
