import { getAuthContext } from '@/lib/server/getAuthContext'
import { ServicesClient } from './ServicesClient'

export default async function ServicesPage() {
  const { tenantId, admin } = await getAuthContext()

  const { data: categories } = await admin
    .from('service_categories')
    .select(`*, services(*)`)
    .eq('tenant_id', tenantId)
    .order('sort_order')

  return <ServicesClient categories={(categories ?? []) as Parameters<typeof ServicesClient>[0]['categories']} />
}
