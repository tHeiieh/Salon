import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: areas } = await supabase
    .from('coverage_areas')
    .select('*')
    .eq('tenant_id', id)
    .eq('is_active', true)
    .order('city_name_ar')

  return NextResponse.json({ areas: areas || [] })
}
