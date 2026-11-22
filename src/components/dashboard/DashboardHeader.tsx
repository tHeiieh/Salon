'use client'

import { Bell, Menu, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Props {
  userProfile: { name_ar?: string; name_en?: string; avatar_url?: string }
  onMenuClick?: () => void
}

export function DashboardHeader({ userProfile, onMenuClick }: Props) {
  const today = format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar })

  return (
    <header style={{
      height: 64,
      backgroundColor: '#faf8f5',
      borderBottom: '1px solid rgba(26,15,10,0.08)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile hamburger */}
        <button
          className="dash-menu-btn"
          onClick={onMenuClick}
          style={{
            width: 36, height: 36, borderRadius: 10, border: 'none',
            backgroundColor: '#f5f5f5', cursor: 'pointer',
            display: 'none', alignItems: 'center', justifyContent: 'center',
            color: '#666', flexShrink: 0,
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#ebebeb')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
        >
          <Menu size={18} />
        </button>
        <div>
          <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>{today}</p>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
            مرحباً، {userProfile.name_ar || 'المدير'} 👋
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative' }}>
          <button style={{
            width: 36, height: 36, borderRadius: 10, border: 'none',
            backgroundColor: '#f5f5f5', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#888',
            transition: 'background-color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#ebebeb')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          >
            <Bell size={16} />
          </button>
          <span style={{
            position: 'absolute', top: 7, right: 7,
            width: 7, height: 7, borderRadius: '50%',
            backgroundColor: '#ef4444',
            border: '1.5px solid #fff',
          }} />
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #C2847A 0%, #D4A96A 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'default',
          boxShadow: '0 2px 10px rgba(194,132,122,0.25)',
        }}>
          {(userProfile.name_ar || 'م').charAt(0)}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dash-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
