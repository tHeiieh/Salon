'use server'

import { getSuperAdminContext } from '@/lib/server/getSuperAdminContext'
import { revalidatePath } from 'next/cache'

export type PlanData = {
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  price_monthly: number
  price_yearly: number
  max_employees: number
  max_services: number
  max_branches: number
  features: string[]
  is_active: boolean
  is_featured: boolean
  allow_custom_domain: boolean
  allow_advanced_reports: boolean
  allow_promotions: boolean
  allow_multi_branch: boolean
}

export async function addPlan(data: PlanData) {
  const { admin } = await getSuperAdminContext()
  const { error } = await admin.from('subscription_plans').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/plans')
}

export async function updatePlan(id: string, data: PlanData) {
  const { admin } = await getSuperAdminContext()
  const { error } = await admin.from('subscription_plans').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/plans')
}

export async function togglePlanActive(id: string, is_active: boolean) {
  const { admin } = await getSuperAdminContext()
  const { error } = await admin.from('subscription_plans').update({ is_active }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/plans')
}

export async function deletePlan(id: string) {
  const { admin } = await getSuperAdminContext()
  const { count } = await admin.from('tenant_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('plan_id', id)
    .eq('status', 'active')
  if ((count || 0) > 0) throw new Error('لا يمكن حذف خطة لها اشتراكات نشطة')
  const { error } = await admin.from('subscription_plans').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/plans')
}
