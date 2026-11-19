import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Bell, AlertCircle, CheckCircle, Info } from 'lucide-react'

export default async function NotificationsPage() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Get pending alerts from real data
  const [
    { count: pendingSalons },
    { count: expiringSubs },
    { data: pendingPayments },
  ] = await Promise.all([
    admin.from('tenants').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('tenant_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .lt('current_period_end', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .gte('current_period_end', new Date().toISOString()),
    admin.from('platform_payments')
      .select('id, amount, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  type NotificationItem = { id: string; type: 'warning' | 'info' | 'success'; title: string; body: string; time: string }
  const notifications: NotificationItem[] = []

  if ((pendingSalons || 0) > 0) {
    notifications.push({
      id: 'pending-salons',
      type: 'warning',
      title: 'صالونات تنتظر المراجعة',
      body: `يوجد ${pendingSalons} صالون تنتظر موافقتك`,
      time: 'الآن',
    })
  }

  if ((expiringSubs || 0) > 0) {
    notifications.push({
      id: 'expiring-subs',
      type: 'warning',
      title: 'اشتراكات تنتهي قريباً',
      body: `${expiringSubs} اشتراك ستنتهي خلال 7 أيام`,
      time: 'الآن',
    })
  }

  if ((pendingPayments?.length || 0) > 0) {
    notifications.push({
      id: 'pending-payments',
      type: 'info',
      title: 'مدفوعات معلقة',
      body: `${pendingPayments?.length} مدفوعة معلقة تحتاج للمراجعة`,
      time: 'الآن',
    })
  }

  if (notifications.length === 0) {
    notifications.push({
      id: 'all-good',
      type: 'success',
      title: 'كل شيء على ما يرام',
      body: 'لا توجد تنبيهات تحتاج إلى اهتمامك في الوقت الحالي',
      time: 'الآن',
    })
  }

  const typeConfig = {
    warning: { bg: '#fef9c3', border: '#fef08a', color: '#a16207', icon: AlertCircle },
    info: { bg: '#e0f2fe', border: '#bae6fd', color: '#0369a1', icon: Info },
    success: { bg: '#dcfce7', border: '#bbf7d0', color: '#16a34a', icon: CheckCircle },
  }

  return (
    <div dir="rtl">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={20} style={{ color: '#C2847A' }} /> مركز الإشعارات
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>تنبيهات المنصة والإشعارات المهمة</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {notifications.map(n => {
          const cfg = typeConfig[n.type]
          return (
            <div key={n.id} style={{
              backgroundColor: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <cfg.icon size={20} style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#1a1a1a' }}>{n.title}</p>
                <p style={{ fontSize: 13, color: '#555', margin: '4px 0 0' }}>{n.body}</p>
              </div>
              <span style={{ fontSize: 11, color: '#888', flexShrink: 0 }}>{n.time}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
