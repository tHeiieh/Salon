'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface DayRevenue { date: string; label: string; revenue: number }

interface Props {
  data: DayRevenue[]
  currency?: string
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff', border: '1px solid rgba(26,15,10,0.1)',
        borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 16px rgba(26,15,10,0.08)',
      }}>
        <p style={{ margin: 0, fontSize: 11, color: '#a89080', fontWeight: 600 }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 900, color: '#1a0f0a' }}>
          {payload[0].value.toLocaleString('ar-SA')} ر.س
        </p>
      </div>
    )
  }
  return null
}

export function RevenueChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,15,10,0.05)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#a89080', fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#a89080' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(194,132,122,0.06)' }} />
        <Bar dataKey="revenue" fill="#C2847A" radius={[3, 3, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
