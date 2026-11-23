import { getAuthContext } from '@/lib/server/getAuthContext'
import { SettingsForm } from './SettingsForm'
import { ChevronLeft, Palette, Scissors, UserCheck } from 'lucide-react'
import Link from 'next/link'

const shortcuts = [
  { href: '/dashboard/branding', label: 'هوية الصالون', detail: 'الشعار والألوان ومظهر صفحة الحجز', Icon: Palette },
  { href: '/dashboard/services', label: 'الخدمات', detail: 'الخدمات والأسعار ومدد المواعيد', Icon: Scissors },
  { href: '/dashboard/employees', label: 'الأخصائيات', detail: 'فريق العمل والخدمات المتخصصة', Icon: UserCheck },
]

export default async function SettingsPage() {
  const { tenantId, admin } = await getAuthContext()

  const { data: tenantProfile } = await admin
    .from('tenant_profiles')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <nav aria-label="إدارة إعدادات الصالون" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 215px), 1fr))', gap: 10 }}>
        {shortcuts.map(({ href, label, detail, Icon }) => (
          <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', padding: 14, border: '1px solid #e9ded6', borderRadius: 4 }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, flexShrink: 0, borderRadius: 4, background: '#f7eae5', color: '#77453e' }}><Icon size={17} aria-hidden="true" /></span>
            <span style={{ flex: 1 }}><strong style={{ display: 'block', fontSize: 14 }}>{label}</strong><span style={{ color: '#765b4d', fontSize: 12 }}>{detail}</span></span>
            <ChevronLeft size={15} aria-hidden="true" />
          </Link>
        ))}
      </nav>
      <SettingsForm tenantId={tenantId} initialData={tenantProfile} />
    </div>
  )
}
