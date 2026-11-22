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
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 39;
          cursor: pointer;
        }
        .dash-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
          min-width: 0;
          background: #f8f6f2;
        }
        .dash-main {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
        }
        .dash-main::-webkit-scrollbar { width: 5px; }
        .dash-main::-webkit-scrollbar-track { background: transparent; }
        .dash-main::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        @media (max-width: 768px) {
          .dash-backdrop[data-open="true"] { display: block; }
          .dash-main { padding: 16px; }
        }
      `}</style>
    </>
  )
}
