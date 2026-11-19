'use server'

import { getSuperAdminContext } from '@/lib/server/getSuperAdminContext'
import { revalidatePath } from 'next/cache'

export async function inviteAdmin(email: string, password: string) {
  const { admin } = await getSuperAdminContext()

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw new Error(error.message)

  const userId = data.user?.id
  if (!userId) throw new Error('فشل إنشاء المستخدم')

  const { error: profileErr } = await admin
    .from('user_profiles')
    .upsert({ id: userId, role: 'superadmin' }, { onConflict: 'id' })
  if (profileErr) throw new Error(profileErr.message)

  revalidatePath('/admin/users')
}

export async function removeAdmin(userId: string, currentUserId: string) {
  if (userId === currentUserId) throw new Error('لا يمكنك حذف حسابك الحالي')
  const { admin } = await getSuperAdminContext()

  await admin.from('user_profiles').update({ role: 'user' }).eq('id', userId)
  revalidatePath('/admin/users')
}
