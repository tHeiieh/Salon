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
          background: '#faf8f5',
          borderLeft: '1px solid rgba(26,15,10,0.08)',
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
          borderBottom: '1px solid rgba(26,15,10,0.08)',
          flexShrink: 0,
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', flex: 1 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #C2847A 0%, #D4A96A 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={15} color="white" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <span style={{
                  fontWeight: 800, fontSize: 14, color: '#1a0f0a',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  display: 'block', letterSpacing: '-0.01em',
                }}>
                  {tenantProfile?.name_ar || 'لوحة التحكم'}
                </span>
                <span style={{ fontSize: 10, color: '#a89080', display: 'block', fontWeight: 600, letterSpacing: '0.03em' }}>
                  BEAUTY SALON
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #C2847A 0%, #D4A96A 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={15} color="white" />
            </div>
          )}

          {/* Collapse button */}
          <button
            onClick={() => { setCollapsed(!collapsed); onClose?.() }}
            className="dash-sidebar-close-btn"
            style={{
              width: 28, height: 28, borderRadius: 999, border: 'none',
              backgroundColor: 'rgba(26,15,10,0.05)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#a89080', flexShrink: 0,
              transition: 'background-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(26,15,10,0.09)'; e.currentTarget.style.color = '#1a0f0a' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(26,15,10,0.05)'; e.currentTarget.style.color = '#a89080' }}
          >
            {collapsed ? <ChevronLeft size={14} style={{ transform: 'scaleX(-1)' }} /> : <Menu size={14} />}
          </button>

          {/* Mobile X close */}
          <button
            onClick={onClose}
            className="dash-sidebar-mobile-close"
            style={{
              width: 28, height: 28, borderRadius: 999, border: 'none',
              backgroundColor: 'rgba(26,15,10,0.05)', cursor: 'pointer',
              display: 'none', alignItems: 'center', justifyContent: 'center',
              color: '#a89080', flexShrink: 0, marginRight: 6,
            }}
          >
            <X size={14} />
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
                  borderRadius: 999,
                  marginBottom: 2,
                  textDecoration: 'none',
                  background: isActive ? 'rgba(194,132,122,0.1)' : 'transparent',
                  color: isActive ? '#C2847A' : '#6b5040',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13,
                  transition: 'all 0.15s ease',
                  letterSpacing: isActive ? '0.01em' : '0',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(26,15,10,0.05)'
                    e.currentTarget.style.color = '#1a0f0a'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#6b5040'
                  }
                }}
              >
                <item.icon
                  size={18}
                  style={{ flexShrink: 0, color: isActive ? '#C2847A' : '#a89080' }}
                />
                {!collapsed && (
                  <span style={{ whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>
                )}
                {!collapsed && isActive && (
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%',
                    backgroundColor: '#C2847A', flexShrink: 0,
                  }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '8px 8px 12px', borderTop: '1px solid rgba(26,15,10,0.08)', flexShrink: 0 }}>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '10px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 999, width: '100%', border: 'none',
              backgroundColor: 'transparent', cursor: 'pointer',
              color: '#a89080', fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.07)'
              e.currentTarget.style.color = '#dc2626'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#a89080'
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
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
            box-shadow: -4px 0 24px rgba(26,15,10,0.1);
          }
          .dash-sidebar[data-mobile-open="true"] {
            transform: translateX(0);
          }
          .dash-sidebar-close-btn { display: none !important; }
          .dash-sidebar-mobile-close { display: flex !important; }
        }
        nav::-webkit-scrollbar { width: 3px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: rgba(26,15,10,0.1); border-radius: 2px; }
      `}</style>
    </>
  )
}
