'use server'

import { getAuthContext } from '@/lib/server/getAuthContext'
import { revalidatePath } from 'next/cache'

export async function addEmployee(data: {
  name_ar: string
  name_en: string
  phone: string
  is_active: boolean
}) {
  const { tenantId, admin } = await getAuthContext()
  const { error } = await admin.from('employees').insert({
    tenant_id: tenantId,
    name_ar: data.name_ar,
    name_en: data.name_en || data.name_ar,
    phone: data.phone || null,
    is_active: data.is_active,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/employees')
}

export async function updateEmployee(id: string, data: {
  name_ar: string
  name_en: string
  phone: string
  is_active: boolean
}) {
  const { tenantId, admin } = await getAuthContext()
  const { error } = await admin.from('employees')
    .update({
      name_ar: data.name_ar,
      name_en: data.name_en || data.name_ar,
      phone: data.phone || null,
      is_active: data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/employees')
}

export async function deleteEmployee(id: string) {
  const { tenantId, admin } = await getAuthContext()
  const { error } = await admin.from('employees')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/employees')
}

export async function toggleEmployeeActive(id: string, is_active: boolean) {
  const { tenantId, admin } = await getAuthContext()
  const { error } = await admin.from('employees')
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/employees')
}
