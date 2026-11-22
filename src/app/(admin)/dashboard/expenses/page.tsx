import { getAuthContext } from '@/lib/server/getAuthContext'
import { ExpensesClient } from './ExpensesClient'

export default async function ExpensesPage() {
  const { tenantId, admin } = await getAuthContext()

  // Ensure table exists via RPC or just try to fetch
  const { data: expenses, error } = await admin
    .from('expenses')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(100)

  const tableExists = !error || !error.message.includes('does not exist')

  return <ExpensesClient
    expenses={tableExists ? (expenses || []) : []}
    tableExists={tableExists}
    tenantId={tenantId}
  />
}
