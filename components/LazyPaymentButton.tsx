"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

const PaymentButton = dynamic(() => import("@/components/PaymentButton"), {
  loading: () => <div className="h-10 w-full" aria-hidden="true" />,
})

type Props = {
  amount: number
  notes?: object
  userId?: string
  productId: string
  productTitle?: string
}

export default function LazyPaymentButton(props: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const node = hostRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          observer.disconnect()
        }
      },
      { rootMargin: "500px 0px", threshold: 0 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={hostRef} className="min-h-10">
      {active ? <PaymentButton {...props} /> : <div className="h-10 w-full" aria-hidden="true" />}
    </div>
  )
}
