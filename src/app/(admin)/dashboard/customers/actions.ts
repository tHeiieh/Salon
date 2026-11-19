'use server'

import { getAuthContext } from '@/lib/server/getAuthContext'
import { revalidatePath } from 'next/cache'

export async function addCustomer(data: { name: string; phone: string; email: string; notes: string }) {
  const { tenantId, admin } = await getAuthContext()
  const { error } = await admin.from('customers').insert({
    tenant_id: tenantId,
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    notes: data.notes || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/customers')
}

export async function updateCustomer(id: string, data: { name: string; phone: string; email: string; notes: string }) {
  const { tenantId, admin } = await getAuthContext()
  const { error } = await admin.from('customers')
    .update({
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      notes: data.notes || null,
    })
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/customers')
}

export async function deleteCustomer(id: string) {
  const { tenantId, admin } = await getAuthContext()
  const { error } = await admin.from('customers')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/customers')
}
