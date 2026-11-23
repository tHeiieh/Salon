'use client'

import { useState } from 'react'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardHeader } from './DashboardHeader'
import styles from './dashboard.module.css'

interface Props {
  userProfile: {
    tenants?: { tenant_profiles?: Array<{ name_ar?: string; logo_url?: string }> } | null
    name_ar?: string
    name_en?: string
  }
  children: React.ReactNode
}

export function DashboardShell({ userProfile, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={styles.shell} onKeyDown={event => {
      if (event.key === 'Escape') setSidebarOpen(false)
    }}>
      <DashboardSidebar userProfile={userProfile} mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <button type="button" className={styles.backdrop} aria-label="إغلاق القائمة" onClick={() => setSidebarOpen(false)} />}
      <div className={styles.workspace}>
        <DashboardHeader userProfile={userProfile} menuOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(value => !value)} />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}
