import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Settings } from 'lucide-react'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #f5f5f5', backgroundColor: '#fafafa' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#1a1a1a' }}>{title}</h3>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

function SettingRow({ label, description, value }: { label: string; description?: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: '#1a1a1a' }}>{label}</p>
        {description && <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>{description}</p>}
      </div>
      <span style={{
        fontSize: 13, color: '#555', backgroundColor: '#f4f4f5',
        padding: '4px 12px', borderRadius: 8, fontFamily: 'monospace',
      }}>{value}</span>
    </div>
  )
}

export default async function SettingsPage() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const [
    { count: totalPlans },
    { count: activePlans },
    { count: totalTenants },
  ] = await Promise.all([
    admin.from('subscription_plans').select('id', { count: 'exact', head: true }),
    admin.from('subscription_plans').select('id', { count: 'exact', head: true }).eq('is_active', true),
    admin.from('tenants').select('id', { count: 'exact', head: true }),
  ])

  return (
    <div dir="rtl">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings size={20} style={{ color: '#C2847A' }} /> إعدادات المنصة
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>إعدادات وتكوينات منصة الصالونات</p>
      </div>

      <Section title="إعدادات المنصة العامة">
        <SettingRow label="اسم المنصة" description="يظهر في واجهة المستخدم" value="منصة الصالونات" />
        <SettingRow label="العملة الافتراضية" description="عملة الاشتراكات والمدفوعات" value="SAR" />
        <SettingRow label="المنطقة الزمنية" description="المنطقة الزمنية الافتراضية للصالونات" value="Asia/Riyadh" />
        <SettingRow label="اللغة الافتراضية" value="ar" />
        <SettingRow label="نسبة ضريبة القيمة المضافة" value="15%" />
      </Section>

      <Section title="إعدادات الاشتراكات">
        <SettingRow label="مدة التجربة المجانية الافتراضية" description="عدد الأيام لكل صالون جديد" value="14 يوم" />
        <SettingRow label="فترة السماح بعد انتهاء الاشتراك" description="قبل تعليق الحساب" value="7 أيام" />
        <SettingRow label="خطط الاشتراك النشطة" value={`${activePlans || 0} من ${totalPlans || 0}`} />
      </Section>

      <Section title="إحصائيات المنصة">
        <SettingRow label="إجمالي الصالونات المسجّلة" value={String(totalTenants || 0)} />
        <SettingRow label="URL قاعدة البيانات" description="Supabase" value={process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').split('.')[0] + '.supabase.co' || '-'} />
      </Section>

      <div style={{
        backgroundColor: '#fef9c3', borderRadius: 12, border: '1px solid #fef08a',
        padding: '16px 20px', fontSize: 13, color: '#a16207',
      }}>
        <strong>ملاحظة:</strong> لتغيير إعدادات المنصة، يرجى تعديل متغيرات البيئة في Vercel أو تحديث بيانات جدول platform_settings مباشرةً في Supabase.
      </div>
    </div>
  )
}
