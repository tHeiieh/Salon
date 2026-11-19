import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Users, Shield, Mail } from 'lucide-react'

export default async function UsersPage() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: profiles } = await admin
    .from('user_profiles')
    .select('id, role, tenant_id, created_at')
    .eq('role', 'superadmin')
    .order('created_at', { ascending: false })

  const { data: authUsers } = await admin.auth.admin.listUsers()

  const usersMap = new Map(authUsers?.users?.map(u => [u.id, u]) || [])

  return (
    <div dir="rtl">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={20} style={{ color: '#C2847A' }} /> مشرفو المنصة
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>إدارة حسابات المشرفين العامين</p>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5', backgroundColor: '#fafafa' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>المشرفون العامون ({profiles?.length || 0})</h3>
        </div>

        {!profiles?.length ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#aaa' }}>
            <Users size={36} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
            <p style={{ margin: 0, fontSize: 13 }}>لا يوجد مشرفون بعد</p>
          </div>
        ) : profiles.map(profile => {
          const authUser = usersMap.get(profile.id)
          return (
            <div key={profile.id} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 20px', borderBottom: '1px solid #f9f9f9',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                backgroundImage: 'linear-gradient(135deg,#C2847A,#D4A96A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={16} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#1a1a1a' }}>
                  {authUser?.email || profile.id.substring(0, 8) + '...'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#aaa', marginTop: 2 }}>
                  <Mail size={11} />
                  <span>{authUser?.email_confirmed_at ? 'مؤكد' : 'غير مؤكد'}</span>
                  <span style={{ margin: '0 4px' }}>·</span>
                  <span>انضم {new Date(profile.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20,
                backgroundColor: '#fdf2f0', color: '#C2847A',
              }}>
                مشرف عام
              </span>
            </div>
          )
        })}
      </div>

      <div style={{
        backgroundColor: '#fff', borderRadius: 14, border: '1px solid #f0f0f0',
        padding: '20px 24px',
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>دعوة مشرف جديد</h3>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px' }}>
          لإضافة مشرف جديد، أضف المستخدم في Supabase وحدد دوره كـ superadmin في جدول user_profiles.
        </p>
        <div style={{
          backgroundColor: '#fafafa', borderRadius: 10, padding: '12px 16px',
          border: '1px solid #f0f0f0', fontSize: 12, color: '#666',
          fontFamily: 'monospace', direction: 'ltr', textAlign: 'left',
        }}>
          <p style={{ margin: 0 }}>{'-- في Supabase SQL Editor:'}</p>
          <p style={{ margin: '4px 0 0' }}>UPDATE user_profiles SET role = &apos;superadmin&apos; WHERE id = &apos;USER_UUID&apos;;</p>
        </div>
      </div>
    </div>
  )
}
