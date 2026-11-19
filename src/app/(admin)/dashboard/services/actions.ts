'use server'

import { getAuthContext } from '@/lib/server/getAuthContext'
import { revalidatePath } from 'next/cache'

// ── Categories ──────────────────────────────────────────────

export async function addCategory(data: { name_ar: string; name_en: string; icon: string }) {
  const { tenantId, admin } = await getAuthContext()
  const { error } = await admin.from('service_categories').insert({
    tenant_id: tenantId,
    name_ar: data.name_ar,
    name_en: data.name_en || data.name_ar,
    icon: data.icon || null,
    is_active: true,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/services')
}

export async function updateCategory(id: string, data: { name_ar: string; name_en: string; icon: string }) {
  const { tenantId, admin } = await getAuthContext()
  const { error } = await admin.from('service_categories')
    .update({ name_ar: data.name_ar, name_en: data.name_en || data.name_ar, icon: data.icon || null })
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/services')
}

export async function deleteCategory(id: string) {
  const { tenantId, admin } = await getAuthContext()
  const { error } = await admin.from('service_categories')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/services')
}

// ── Services ────────────────────────────────────────────────

export async function addService(data: {
  category_id: string
  name_ar: string
  name_en: string
  price: number
  duration_minutes: number
  home_visit_surcharge: number
  is_active: boolean
}) {
  const { tenantId, admin } = await getAuthContext()
  const { error } = await admin.from('services').insert({
    tenant_id: tenantId,
    category_id: data.category_id || null,
    name_ar: data.name_ar,
    name_en: data.name_en || data.name_ar,
    price: data.price,
    duration_minutes: data.duration_minutes,
    home_visit_surcharge: data.home_visit_surcharge || 0,
    is_active: data.is_active,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/services')
}

export async function updateService(id: string, data: {
  category_id: string
  name_ar: string
  name_en: string
  price: number
  duration_minutes: number
  home_visit_surcharge: number
  is_active: boolean
}) {
  const { tenantId, admin } = await getAuthContext()
  const { error } = await admin.from('services')
    .update({
      category_id: data.category_id || null,
      name_ar: data.name_ar,
      name_en: data.name_en || data.name_ar,
      price: data.price,
      duration_minutes: data.duration_minutes,
      home_visit_surcharge: data.home_visit_surcharge || 0,
      is_active: data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/services')
}

export async function deleteService(id: string) {
  const { tenantId, admin } = await getAuthContext()
  const { error } = await admin.from('services')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/services')
}
