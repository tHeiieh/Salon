'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Scissors, Users, UserCheck,
  CreditCard, BarChart2, Settings, Palette, Menu, ChevronLeft,
  LogOut, X, Sparkles,
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
  const sidebarWidth = collapsed ? 64 : 256

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
          background: 'linear-gradient(180deg, #0f0c08 0%, #130f0a 60%, #0f0c08 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s ease, min-width 0.25s ease, transform 0.3s ease',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header / Logo */}
        <div style={{
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0 10px' : '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', flex: 1 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, #C2847A 0%, #D4A96A 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 12px rgba(194,132,122,0.4)',
              }}>
                <Sparkles size={16} color="white" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <span style={{
                  fontWeight: 700, fontSize: 14, color: '#fff',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  display: 'block',
                }}>
                  {tenantProfile?.name_ar || 'لوحة التحكم'}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', display: 'block' }}>إدارة الصالون</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: 'linear-gradient(135deg, #C2847A 0%, #D4A96A 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(194,132,122,0.3)',
            }}>
              <Sparkles size={16} color="white" />
            </div>
          )}

          {/* Collapse button */}
          <button
            onClick={() => { setCollapsed(!collapsed); onClose?.() }}
            className="dash-sidebar-close-btn"
            style={{
              width: 30, height: 30, borderRadius: 8, border: 'none',
              backgroundColor: 'rgba(255,255,255,0.07)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)', flexShrink: 0,
              transition: 'background-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >
            {collapsed ? <ChevronLeft size={15} style={{ transform: 'scaleX(-1)' }} /> : <Menu size={15} />}
          </button>

          {/* Mobile X close */}
          <button
            onClick={onClose}
            className="dash-sidebar-mobile-close"
            style={{
              width: 30, height: 30, borderRadius: 8, border: 'none',
              backgroundColor: 'rgba(255,255,255,0.07)', cursor: 'pointer',
              display: 'none', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)', flexShrink: 0, marginRight: 6,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
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
                  borderRadius: 12,
                  marginBottom: 2,
                  textDecoration: 'none',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(194,132,122,0.2), rgba(212,169,106,0.12))'
                    : 'transparent',
                  color: isActive ? '#C2847A' : 'rgba(255,255,255,0.45)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13,
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? '2px solid #C2847A' : '2px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
                  }
                }}
              >
                <item.icon
                  size={19}
                  style={{ flexShrink: 0, color: isActive ? '#C2847A' : 'rgba(255,255,255,0.3)' }}
                />
                {!collapsed && (
                  <span style={{ whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>
                )}
                {!collapsed && isActive && (
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%',
                    backgroundColor: '#C2847A', flexShrink: 0,
                    boxShadow: '0 0 6px rgba(194,132,122,0.6)',
                  }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '8px 8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 12, width: '100%', border: 'none',
              backgroundColor: 'transparent', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
            }}
          >
            <LogOut size={19} style={{ flexShrink: 0 }} />
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
            box-shadow: -8px 0 40px rgba(0,0,0,0.5);
          }
          .dash-sidebar[data-mobile-open="true"] {
            transform: translateX(0);
          }
          .dash-sidebar-close-btn { display: none !important; }
          .dash-sidebar-mobile-close { display: flex !important; }
        }
        nav::-webkit-scrollbar { width: 3px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </>
  )
}
