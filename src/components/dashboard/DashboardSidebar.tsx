'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart2, Calendar, CreditCard, LayoutDashboard, LogOut, Package, Palette,
  PanelRightClose, PanelRightOpen, Receipt, Scissors, Settings, ShoppingCart,
  Sparkles, UserCheck, Users, X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import styles from './dashboard.module.css'

const NAV_GROUPS = [
  { label: 'المواعيد والعملاء', items: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'نظرة عامة' },
    { href: '/dashboard/appointments', icon: Calendar, label: 'الحجوزات' },
    { href: '/dashboard/customers', icon: Users, label: 'العملاء' },
    { href: '/dashboard/cashier', icon: ShoppingCart, label: 'نقطة البيع' },
  ] },
  { label: 'إدارة الصالون', items: [
    { href: '/dashboard/services', icon: Scissors, label: 'الخدمات' },
    { href: '/dashboard/employees', icon: UserCheck, label: 'الأخصائيات' },
    { href: '/dashboard/stock', icon: Package, label: 'المخزون' },
    { href: '/dashboard/expenses', icon: Receipt, label: 'المصروفات' },
    { href: '/dashboard/payments', icon: CreditCard, label: 'المدفوعات' },
    { href: '/dashboard/reports', icon: BarChart2, label: 'التقارير' },
  ] },
  { label: 'الإعدادات', items: [
    { href: '/dashboard/branding', icon: Palette, label: 'هوية الصالون' },
    { href: '/dashboard/settings', icon: Settings, label: 'الإعدادات' },
  ] },
]

interface Props {
  userProfile: { tenants?: { tenant_profiles?: Array<{ name_ar?: string }> } | null }
  mobileOpen: boolean
  onClose: () => void
}

export function DashboardSidebar({ userProfile, mobileOpen, onClose }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const tenantName = userProfile.tenants?.tenant_profiles?.[0]?.name_ar || 'إدارة الصالون'
  const CollapseIcon = collapsed ? PanelRightOpen : PanelRightClose

  async function handleSignOut() {
    await createClient().auth.signOut()
    window.location.assign('/auth/login')
  }

  return (
    <aside id="dashboard-navigation" className={styles.sidebar} data-collapsed={collapsed} data-open={mobileOpen}>
      <div className={styles.brand}>
        <span className={styles.mark}><Sparkles size={17} aria-hidden="true" /></span>
        <strong className={styles.navLabel}>{tenantName}</strong>
        <button type="button" className={styles.collapse} onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}>
          <CollapseIcon size={17} />
        </button>
        <button type="button" className={styles.mobileClose} onClick={onClose} aria-label="إغلاق القائمة"><X size={20} /></button>
      </div>
      <nav className={styles.nav} aria-label="إدارة الصالون">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className={styles.navGroup}>
            <p className={styles.navLabel}>{group.label}</p>
            {group.items.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
              return (
                <Link key={href} href={href} onClick={onClose} title={label} aria-label={label} aria-current={active ? 'page' : undefined}>
                  <Icon size={17} aria-hidden="true" />
                  <span className={styles.navLabel}>{label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
      <button type="button" className={styles.signout} onClick={handleSignOut} title="تسجيل الخروج" aria-label="تسجيل الخروج">
        <LogOut size={17} aria-hidden="true" /><span className={styles.navLabel}>تسجيل الخروج</span>
      </button>
    </aside>
  )
}
