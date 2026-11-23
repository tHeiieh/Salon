'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, CreditCard, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import styles from './demo-checkout.module.css'

export function DemoCheckout({ amount, onBack }: { amount: number; onBack?: () => void }) {
  const [result, setResult] = useState<'approved' | 'declined' | null>(null)

  return (
    <section className={styles.checkout} dir="rtl" lang="ar" aria-labelledby="demo-checkout-title">
      <div className={styles.label}><CreditCard size={18} aria-hidden="true" /> محاكاة الدفع</div>
      <h2 id="demo-checkout-title">جرّب الدفع الإلكتروني</h2>
      <p>اختر نتيجة لتجربة العملية. المبلغ للعرض فقط، ولا تُطلب بيانات بطاقة أو تُسجّل عملية حجز.</p>
      <div className={styles.amount}><span>المبلغ التجريبي</span><bdi>{formatCurrency(amount)}</bdi></div>

      <div aria-live="polite">
        {result === 'approved' && (
          <p className={styles.approved}><CheckCircle size={20} aria-hidden="true" /> تمت الموافقة على الدفع التجريبي.</p>
        )}
        {result === 'declined' && (
          <p className={styles.declined}><XCircle size={20} aria-hidden="true" /> تم رفض الدفع التجريبي. يمكنك إعادة المحاولة.</p>
        )}
      </div>

      <div className={styles.actions}>
        {result === null ? (
          <>
            <button type="button" onClick={() => setResult('approved')}>محاكاة الموافقة</button>
            <button type="button" onClick={() => setResult('declined')}>محاكاة الرفض</button>
          </>
        ) : (
          <button type="button" onClick={() => setResult(null)}>إعادة المحاولة</button>
        )}
      </div>
      {onBack ? (
        <button type="button" className={styles.back} onClick={onBack}>العودة إلى الدفع</button>
      ) : (
        <Link className={styles.back} href="/">العودة إلى الرئيسية</Link>
      )}
    </section>
  )
}
