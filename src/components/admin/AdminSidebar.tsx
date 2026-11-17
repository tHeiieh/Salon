'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, CreditCard, Settings,
  FileText, Users, Shield, TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <aside className="w-60 bg-slate-900 flex flex-col h-screen">
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">منصة الصالونات</p>
            <p className="text-slate-400 text-xs">لوحة المشرف</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm',
                isActive
                  ? 'bg-primary/20 text-primary font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
