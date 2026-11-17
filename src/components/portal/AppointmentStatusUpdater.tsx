'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { APPOINTMENT_STATUS_AR } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const STATUS_TRANSITIONS: Record<string, { next: string; label: string; color: string }> = {
  confirmed: { next: 'on_the_way', label: '🚗 في الطريق', color: 'bg-purple-500' },
  assigned: { next: 'on_the_way', label: '🚗 في الطريق', color: 'bg-purple-500' },
  on_the_way: { next: 'arrived', label: '📍 وصلت', color: 'bg-pink-500' },
  arrived: { next: 'in_progress', label: '✂️ بدء الخدمة', color: 'bg-orange-500' },
  in_progress: { next: 'completed', label: '✅ إتمام الخدمة', color: 'bg-green-500' },
}

interface Props {
  appointmentId: string
  currentStatus: string
}

export function AppointmentStatusUpdater({ appointmentId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const transition = STATUS_TRANSITIONS[currentStatus]
  if (!transition) return null

  async function handleUpdate() {
    setLoading(true)
    try {
      await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: transition.next }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      className={`w-full rounded-xl ${transition.color} text-white hover:opacity-90`}
      loading={loading}
      onClick={handleUpdate}
    >
      {transition.label}
    </Button>
  )
}
