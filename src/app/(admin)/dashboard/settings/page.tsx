import { getAuthContext } from '@/lib/server/getAuthContext'
import { SettingsForm } from './SettingsForm'

export default async function SettingsPage() {
  const { tenantId, admin } = await getAuthContext()

  const { data: tenantProfile } = await admin
    .from('tenant_profiles')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  return <SettingsForm tenantId={tenantId} initialData={tenantProfile} />
}
