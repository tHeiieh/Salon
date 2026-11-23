'use client'

import Link from 'next/link'
import { CalendarDays, Menu, ShoppingCart } from 'lucide-react'
import { usePathname } from 'next/navigation'
import styles from './dashboard.module.css'

const PAGE_NAMES: Record<string, string> = {
  appointments: 'الحجوزات', cashier: 'نقطة البيع', customers: 'العملاء', services: 'الخدمات',
  employees: 'الأخصائيات', payments: 'المدفوعات', expenses: 'المصروفات', stock: 'المخزون',
  reports: 'التقارير', branding: 'هوية الصالون', settings: 'الإعدادات',
}

interface Props {
  userProfile: { name_ar?: string; name_en?: string }
  menuOpen: boolean
  onMenuClick: () => void
}

export function DashboardHeader({ userProfile, menuOpen, onMenuClick }: Props) {
  const section = usePathname().split('/')[2]
  const name = userProfile.name_ar || userProfile.name_en

  return (
    <header className={styles.header}>
      <div className={styles.location}>
        <button type="button" className={styles.menu} onClick={onMenuClick} aria-label="قائمة الإدارة" aria-controls="dashboard-navigation" aria-expanded={menuOpen}><Menu size={21} /></button>
        <span>إدارة الصالون</span>
        <strong>{PAGE_NAMES[section] || 'نظرة عامة'}</strong>
      </div>
      <div className={styles.shortcuts}>
        {section !== 'appointments' && <Link href="/dashboard/appointments?view=calendar" title="التقويم" aria-label="التقويم"><CalendarDays size={17} /><span>التقويم</span></Link>}
        {section !== 'cashier' && <Link href="/dashboard/cashier" title="نقطة البيع" aria-label="نقطة البيع"><ShoppingCart size={17} /><span>نقطة البيع</span></Link>}
        {name && <span className={styles.avatar} title={name} aria-label={name}>{Array.from(name)[0]}</span>}
      </div>
    </header>
  )
}
