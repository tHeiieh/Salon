import { getAuthContext } from '@/lib/server/getAuthContext'
import { CashierClient } from './CashierClient'

export default async function CashierPage() {
  const { tenantId, admin } = await getAuthContext()

  const [{ data: services }, { data: employees }] = await Promise.all([
    admin.from('services')
      .select('id, name_ar, name_en, price, duration_minutes, category_ar, category_en')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('category_ar')
      .order('name_ar'),
    admin.from('employees')
      .select('id, name_ar')
      .eq('tenant_id', tenantId)
      .eq('is_active', true),
  ])

  return <CashierClient services={services || []} employees={employees || []} tenantId={tenantId} />
}
