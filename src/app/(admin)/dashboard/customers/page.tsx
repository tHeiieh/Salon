import { getAuthContext } from '@/lib/server/getAuthContext'
import { CustomersClient } from './CustomersClient'

export default async function CustomersPage() {
  const { tenantId, admin } = await getAuthContext()

  const [{ data: customers }, { count: total }] = await Promise.all([
    admin
      .from('customers')
      .select(`id, name, phone, email, notes, created_at, appointments(count)`)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(100),
    admin
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId),
  ])

  return (
    <CustomersClient
      customers={(customers ?? []) as Parameters<typeof CustomersClient>[0]['customers']}
      total={total ?? 0}
    />
  )
}
