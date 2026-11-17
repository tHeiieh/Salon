import { getAuthContext } from '@/lib/server/getAuthContext'
import { BrandingForm } from './BrandingForm'

export default async function BrandingPage() {
  const { tenantId, admin } = await getAuthContext()

  const { data: tenantProfile } = await admin
    .from('tenant_profiles')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  return <BrandingForm tenantId={tenantId} initialData={tenantProfile} />
}
