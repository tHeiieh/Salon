import type { Metadata } from 'next'
import { DemoCheckout } from '@/components/booking/DemoCheckout'

export const metadata: Metadata = { title: 'تجربة الدفع | الصالون' }

export default function DemoPaymentPage() {
  return (
    <main style={{ background: '#faf8f5', minHeight: '100dvh', padding: 'clamp(20px, 7vw, 80px) 16px' }}>
      <div style={{ maxWidth: 590, margin: 'auto', padding: 'clamp(18px, 5vw, 38px)', background: '#fff', border: '1px solid #e9ded6', borderRadius: 4 }}>
        <DemoCheckout amount={115} />
      </div>
    </main>
  )
}
