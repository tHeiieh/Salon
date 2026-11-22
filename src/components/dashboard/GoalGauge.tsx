'use client'

interface Props {
  current: number
  goal: number
  label?: string
}

export function GoalGauge({ current, goal, label = 'الهدف الشهري' }: Props) {
  const pct = Math.min(100, goal > 0 ? Math.round((current / goal) * 100) : 0)
  const r = 56
  const circ = 2 * Math.PI * r
  const sweep = circ * 0.75
  const offset = sweep - (sweep * pct) / 100
  const startAngle = 135
  const endAngle = 405

  const p = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180
    return { x: 70 + r * Math.cos(rad), y: 70 + r * Math.sin(rad) }
  }
  const s = p(startAngle)
  const e = p(endAngle)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: 140, height: 100, overflow: 'hidden' }}>
        <svg width="140" height="140" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Background arc */}
          <path
            d={`M ${s.x} ${s.y} A ${r} ${r} 0 1 1 ${e.x} ${e.y}`}
            fill="none" stroke="rgba(26,15,10,0.07)" strokeWidth="10" strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d={`M ${s.x} ${s.y} A ${r} ${r} 0 1 1 ${e.x} ${e.y}`}
            fill="none" stroke="#C2847A" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${sweep} ${circ}`}
            strokeDashoffset={-offset + sweep}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
          {/* Percentage */}
          <text x="70" y="78" textAnchor="middle" fill="#1a0f0a" fontSize="20" fontWeight="900" fontFamily="inherit">
            {pct}%
          </text>
        </svg>
      </div>
      <div style={{ textAlign: 'center', marginTop: -24 }}>
        <p style={{ margin: 0, fontSize: 12, color: '#a89080', fontWeight: 600 }}>{label}</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#c8b0a0' }}>
          {current.toLocaleString('ar-SA')} / {goal.toLocaleString('ar-SA')} ر.س
        </p>
      </div>
    </div>
  )
}
