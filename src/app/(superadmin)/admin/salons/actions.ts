'use server'

import { getSuperAdminContext } from '@/lib/server/getSuperAdminContext'
import { revalidatePath } from 'next/cache'

export async function activateSalon(id: string) {
  const { admin } = await getSuperAdminContext()
  const { error } = await admin.from('tenants').update({ status: 'active' }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/salons')
  revalidatePath('/admin')
}

export async function suspendSalon(id: string) {
  const { admin } = await getSuperAdminContext()
  const { error } = await admin.from('tenants').update({ status: 'suspended' }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/salons')
  revalidatePath('/admin')
}

export async function assignPlan(tenantId: string, planId: string, billingCycle: 'monthly' | 'yearly') {
  const { admin } = await getSuperAdminContext()

  const { data: plan } = await admin.from('subscription_plans').select('price_monthly, price_yearly').eq('id', planId).single()
  if (!plan) throw new Error('Plan not found')

  const amount = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly
  const now = new Date()
  const periodEnd = new Date(now)
  if (billingCycle === 'monthly') periodEnd.setMonth(periodEnd.getMonth() + 1)
  else periodEnd.setFullYear(periodEnd.getFullYear() + 1)

  const { error: delErr } = await admin.from('tenant_subscriptions')
    .delete().eq('tenant_id', tenantId)
  if (delErr) throw new Error(delErr.message)

  const { error } = await admin.from('tenant_subscriptions').insert({
    tenant_id: tenantId,
    plan_id: planId,
    status: 'active',
    billing_cycle: billingCycle,
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    amount_paid: amount,
  })
  if (error) throw new Error(error.message)

  await admin.from('tenants').update({ status: 'active' }).eq('id', tenantId)

  revalidatePath('/admin/salons')
  revalidatePath('/admin/subscriptions')
  revalidatePath('/admin')
}

export async function updateSalonProfile(tenantId: string, data: {
  name_ar: string; email: string; phone: string; city?: string
}) {
  const { admin } = await getSuperAdminContext()
  const { error } = await admin.from('tenant_profiles').update({
    name_ar: data.name_ar,
    email: data.email,
    phone: data.phone,
    ...(data.city ? { city: data.city } : {}),
  }).eq('id', tenantId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/salons')
  revalidatePath(`/admin/salons/${tenantId}`)
  revalidatePath('/admin')
}

export async function deleteSalon(id: string) {
  const { admin } = await getSuperAdminContext()
  await admin.from('tenant_subscriptions').delete().eq('tenant_id', id)
  await admin.from('platform_payments').delete().eq('tenant_id', id)
  const { error } = await admin.from('tenants').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/salons')
  revalidatePath('/admin')
}

export async function extendTrial(tenantId: string, days: number) {
  const { admin } = await getSuperAdminContext()
  const { data: sub } = await admin.from('tenant_subscriptions')
    .select('current_period_end')
    .eq('tenant_id', tenantId)
    .single()

  const base = sub?.current_period_end ? new Date(sub.current_period_end) : new Date()
  base.setDate(base.getDate() + days)

  if (sub) {
    await admin.from('tenant_subscriptions')
      .update({ current_period_end: base.toISOString() })
      .eq('tenant_id', tenantId)
  } else {
    await admin.from('tenant_subscriptions').insert({
      tenant_id: tenantId,
      status: 'trial',
      billing_cycle: 'monthly',
      current_period_start: new Date().toISOString(),
      current_period_end: base.toISOString(),
      amount_paid: 0,
    })
  }

  await admin.from('tenants').update({ status: 'trial' }).eq('id', tenantId)
  revalidatePath('/admin/salons')
}
