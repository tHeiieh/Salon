'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Scissors, Users, UserCheck,
  CreditCard, BarChart2, Settings, Palette, Menu, ChevronLeft,
  LogOut, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
  { href: '/dashboard/appointments', icon: Calendar, label: 'المواعيد' },
  { href: '/dashboard/services', icon: Scissors, label: 'الخدمات' },
  { href: '/dashboard/employees', icon: UserCheck, label: 'الموظفات' },
  { href: '/dashboard/customers', icon: Users, label: 'العملاء' },
  { href: '/dashboard/payments', icon: CreditCard, label: 'المدفوعات' },
  { href: '/dashboard/reports', icon: BarChart2, label: 'التقارير' },
  { href: '/dashboard/branding', icon: Palette, label: 'العلامة التجارية' },
  { href: '/dashboard/settings', icon: Settings, label: 'الإعدادات' },
]

interface Props {
  userProfile: {
    tenants?: { tenant_profiles?: Array<{ name_ar?: string; logo_url?: string }> } | null
    name_ar?: string
  }
  mobileOpen?: boolean
  onClose?: () => void
}

export function DashboardSidebar({ userProfile, mobileOpen, onClose }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const tenantProfile = userProfile.tenants?.tenant_profiles?.[0]
  const sidebarWidth = collapsed ? 64 : 260

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  function handleNavClick() {
    onClose?.()
  }

  return (
    <>
      <aside
        className="dash-sidebar"
        data-mobile-open={mobileOpen ? 'true' : 'false'}
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          height: '100vh',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s ease, min-width 0.25s ease, transform 0.3s ease',
          boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header / Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '0 12px',
          borderBottom: '1px solid #f5f5f5',
          flexShrink: 0,
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', flex: 1 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                backgroundImage: 'linear-gradient(135deg, #C2847A 0%, #D4A96A 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Scissors size={16} color="white" />
              </div>
              <span style={{
                fontWeight: 700, fontSize: 14, color: '#1a1a1a',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {tenantProfile?.name_ar || 'لوحة التحكم'}
              </span>
            </div>
          )}
          {/* Desktop collapse / Mobile close */}
          <button
            onClick={() => { setCollapsed(!collapsed); onClose?.() }}
            className="dash-sidebar-close-btn"
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              backgroundColor: '#f5f5f5', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#666', flexShrink: 0,
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#ebe8e8')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          >
            {collapsed ? <ChevronLeft size={16} /> : <Menu size={16} />}
          </button>
          {/* Mobile-only X close button */}
          <button
            onClick={onClose}
            className="dash-sidebar-mobile-close"
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              backgroundColor: '#f5f5f5', cursor: 'pointer',
              display: 'none', alignItems: 'center', justifyContent: 'center',
              color: '#666', flexShrink: 0, marginRight: 6,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
          {NAV_ITEMS.map(item => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '10px 0' : '10px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 10,
                  marginBottom: 2,
                  textDecoration: 'none',
                  backgroundColor: isActive ? 'rgba(194,132,122,0.1)' : 'transparent',
                  color: isActive ? '#C2847A' : '#555',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  transition: 'background-color 0.15s, color 0.15s',
                }}
              >
                <item.icon
                  size={20}
                  style={{ flexShrink: 0, color: isActive ? '#C2847A' : '#888' }}
                />
                {!collapsed && (
                  <span style={{ whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>
                )}
                {!collapsed && isActive && (
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    backgroundColor: '#C2847A', flexShrink: 0,
                  }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding: 8, borderTop: '1px solid #f5f5f5', flexShrink: 0 }}>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 10, width: '100%', border: 'none',
              backgroundColor: 'transparent', cursor: 'pointer',
              color: '#888', fontSize: 14,
              transition: 'background-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#fff0ef'
              e.currentTarget.style.color = '#d64f4f'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#888'
            }}
          >
            <LogOut size={20} style={{ flexShrink: 0 }} />
            {!collapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .dash-sidebar {
            position: fixed !important;
            top: 0;
            right: 0;
            width: 260px !important;
            min-width: 260px !important;
            z-index: 40;
            transform: translateX(100%);
            box-shadow: -4px 0 24px rgba(0,0,0,0.12);
          }
          .dash-sidebar[data-mobile-open="true"] {
            transform: translateX(0);
          }
          .dash-sidebar-close-btn { display: none !important; }
          .dash-sidebar-mobile-close { display: flex !important; }
        }
      `}</style>
    </>
  )
}
