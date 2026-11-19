import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import { UsersClient } from './UsersClient'

export default async function UsersPage() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Get current user id
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profiles } = await admin
    .from('user_profiles')
    .select('id, role, created_at')
    .eq('role', 'superadmin')
    .order('created_at', { ascending: false })

  const { data: authUsers } = await admin.auth.admin.listUsers()
  const usersMap = new Map(authUsers?.users?.map(u => [u.id, u]) || [])

  const admins = (profiles || []).map(p => ({
    id: p.id,
    role: p.role,
    created_at: p.created_at,
    email: usersMap.get(p.id)?.email || '',
    confirmed: !!usersMap.get(p.id)?.email_confirmed_at,
  }))

  return (
    <div dir="rtl">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={20} style={{ color: '#C2847A' }} /> مشرفو المنصة
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>إدارة حسابات المشرفين العامين</p>
      </div>
      <UsersClient admins={admins} currentUserId={currentUser?.id || ''} />
    </div>
  )
}
