'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, CreditCard, Settings,
  FileText, Users, Shield, TrendingUp
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'نظرة عامة' },
  { href: '/admin/salons', icon: Building2, label: 'الصالونات' },
  { href: '/admin/subscriptions', icon: CreditCard, label: 'الاشتراكات' },
  { href: '/admin/billing', icon: TrendingUp, label: 'الإيرادات' },
  { href: '/admin/plans', icon: FileText, label: 'خطط الاشتراك' },
  { href: '/admin/users', icon: Users, label: 'المستخدمون' },
  { href: '/admin/audit', icon: Shield, label: 'سجل التدقيق' },
  { href: '/admin/settings', icon: Settings, label: 'الإعدادات' },
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
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          backgroundImage: 'linear-gradient(135deg, #C2847A 0%, #D4A96A 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield size={16} color="white" />
        </div>
        <div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: 0 }}>منصة الصالونات</p>
          <p style={{ color: '#94a3b8', fontSize: 11, margin: 0 }}>لوحة المشرف</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 2,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                backgroundColor: isActive ? 'rgba(194,132,122,0.15)' : 'transparent',
                color: isActive ? '#C2847A' : '#94a3b8',
                transition: 'all 0.15s',
              }}
            >
              <item.icon size={18} style={{ flexShrink: 0, color: isActive ? '#C2847A' : '#64748b' }} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
