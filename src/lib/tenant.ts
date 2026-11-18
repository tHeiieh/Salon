import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { TenantProfile } from '@/types'

let tenantCache = new Map<string, { data: TenantProfile; ts: number }>()
const CACHE_TTL = 60_000 // 1 minute

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function getTenantBySlug(slug: string): Promise<TenantProfile | null> {
  const cached = tenantCache.get(slug)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  const admin = getAdmin()
  const { data, error } = await admin
    .from('tenants')
    .select(`id, slug, status, tenant_profiles (*)`)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error || !data?.tenant_profiles) return null

  const profile = Array.isArray(data.tenant_profiles)
    ? data.tenant_profiles[0]
    : data.tenant_profiles

  tenantCache.set(slug, { data: profile as TenantProfile, ts: Date.now() })
  return profile as TenantProfile
}

export async function getTenantById(tenantId: string): Promise<TenantProfile | null> {
  const admin = getAdmin()
  const { data, error } = await admin
    .from('tenant_profiles')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  if (error) return null
  return data as TenantProfile
}

export function getTenantSlugFromHost(host: string, baseDomain: string): string | null {
  // e.g. "luxe.mysalon.sa" -> "luxe" if baseDomain is "mysalon.sa"
  if (host === baseDomain || host === `www.${baseDomain}`) return null
  if (host.endsWith(`.${baseDomain}`)) {
    return host.replace(`.${baseDomain}`, '')
  }
  return null
}
