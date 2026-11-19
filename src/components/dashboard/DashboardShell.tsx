'use client'

import { useState } from 'react'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardHeader } from './DashboardHeader'

interface Props {
  userProfile: {
    tenants?: { tenant_profiles?: Array<{ name_ar?: string; logo_url?: string }> } | null
    name_ar?: string
    name_en?: string
    avatar_url?: string
  }
  children: React.ReactNode
}

export function DashboardShell({ userProfile, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <DashboardSidebar
        userProfile={userProfile}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile backdrop */}
      <div
        className="dash-backdrop"
        data-open={sidebarOpen ? 'true' : 'false'}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="dash-content">
        <DashboardHeader
          userProfile={userProfile}
          onMenuClick={() => setSidebarOpen(o => !o)}
        />
        <main className="dash-main">
          {children}
        </main>
      </div>

      <style>{`
        .dash-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 39;
          cursor: pointer;
        }
        .dash-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
          min-width: 0;
        }
        .dash-main {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        @media (max-width: 768px) {
          .dash-backdrop[data-open="true"] { display: block; }
          .dash-main { padding: 16px; }
        }
      `}</style>
    </>
  )
}
