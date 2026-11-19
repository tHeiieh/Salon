'use server'

import { getSuperAdminContext } from '@/lib/server/getSuperAdminContext'
import { revalidatePath } from 'next/cache'

export async function cancelSubscription(subId: string) {
  const { admin } = await getSuperAdminContext()
  const { error } = await admin
    .from('tenant_subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', subId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/subscriptions')
  revalidatePath('/admin')
}

export async function changeSubscriptionPlan(subId: string, planId: string, billingCycle: 'monthly' | 'yearly') {
  const { admin } = await getSuperAdminContext()
  const { data: plan } = await admin
    .from('subscription_plans')
    .select('price_monthly, price_yearly')
    .eq('id', planId)
    .single()
  if (!plan) throw new Error('الخطة غير موجودة')

  const amount = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly
  const now = new Date()
  const end = new Date(now)
  if (billingCycle === 'monthly') end.setMonth(end.getMonth() + 1)
  else end.setFullYear(end.getFullYear() + 1)

  const { error } = await admin
    .from('tenant_subscriptions')
    .update({
      plan_id: planId,
      billing_cycle: billingCycle,
      amount_paid: amount,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: end.toISOString(),
    })
    .eq('id', subId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/subscriptions')
  revalidatePath('/admin')
}

export async function reactivateSubscription(subId: string) {
  const { admin } = await getSuperAdminContext()
  const now = new Date()
  const end = new Date(now)
  end.setMonth(end.getMonth() + 1)
  const { error } = await admin
    .from('tenant_subscriptions')
    .update({ status: 'active', current_period_start: now.toISOString(), current_period_end: end.toISOString() })
    .eq('id', subId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/subscriptions')
  revalidatePath('/admin')
}
