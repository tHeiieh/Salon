import { getAuthContext } from '@/lib/server/getAuthContext'
import { StockClient } from './StockClient'

export default async function StockPage() {
  const { tenantId, admin } = await getAuthContext()

  const { data: items, error } = await admin
    .from('stock_items')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name')

  const tableExists = !error || !error.message.includes('does not exist')

  return <StockClient items={tableExists ? (items || []) : []} tableExists={tableExists} tenantId={tenantId} />
}
