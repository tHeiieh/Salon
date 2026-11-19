'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, CreditCard, Settings,
  FileText, Users, Shield, Receipt, Bell,
  ClipboardList, Calendar, CheckSquare, BarChart3,
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'نظرة عامة',
    items: [
      { href: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم', exact: true },
    ],
  },
  {
    label: 'عمليات الصالونات',
    items: [
      { href: '/admin/salons', icon: Building2, label: 'الصالونات' },
      { href: '/admin/approvals', icon: CheckSquare, label: 'طلبات الموافقة' },
      { href: '/admin/reservations', icon: Calendar, label: 'الحجوزات' },
    ],
  },
  {
    label: 'الأعمال والفوترة',
    items: [
      { href: '/admin/subscriptions', icon: CreditCard, label: 'الاشتراكات' },
      { href: '/admin/plans', icon: FileText, label: 'خطط الاشتراك' },
      { href: '/admin/billing', icon: Receipt, label: 'المدفوعات والفواتير' },
      { href: '/admin/analytics', icon: BarChart3, label: 'التقارير والتحليلات' },
    ],
  },
  {
    label: 'الإدارة',
    items: [
      { href: '/admin/users', icon: Users, label: 'مشرفو المنصة' },
      { href: '/admin/tickets', icon: ClipboardList, label: 'تذاكر الدعم' },
      { href: '/admin/notifications', icon: Bell, label: 'الإشعارات' },
      { href: '/admin/audit', icon: Shield, label: 'سجل التدقيق' },
      { href: '/admin/settings', icon: Settings, label: 'إعدادات المنصة' },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      backgroundColor: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          backgroundImage: 'linear-gradient(135deg, #C2847A 0%, #D4A96A 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield size={15} color="white" />
        </div>
        <div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 12, margin: 0, lineHeight: 1.2 }}>منصة الصالونات</p>
          <p style={{ color: '#94a3b8', fontSize: 10, margin: 0, lineHeight: 1.3 }}>لوحة المشرف العام</p>
        </div>
      </div>

      {/* Nav Groups */}
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 4 }}>
            <p style={{
              color: '#475569', fontSize: 10, fontWeight: 600,
              padding: '10px 12px 4px', margin: 0, letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive = ('exact' in item && item.exact)
                ? pathname === item.href
                : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '8px 12px',
                    borderRadius: 8,
                    marginBottom: 1,
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    backgroundColor: isActive ? 'rgba(194,132,122,0.15)' : 'transparent',
                    color: isActive ? '#C2847A' : '#94a3b8',
                    transition: 'all 0.15s',
                  }}
                >
                  <item.icon size={15} style={{ flexShrink: 0, color: isActive ? '#C2847A' : '#64748b' }} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <p style={{ color: '#334155', fontSize: 10, margin: 0, textAlign: 'center' }}>
          منصة الصالونات SaaS © 2025
        </p>
      </div>
    </aside>
  )
}
