"use client"

import { EscrowHeader } from "@/components/escrow-header"
import { DealDetails } from "@/components/deal-details"
import { use } from "react"

export default function DealPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <div className="min-h-screen bg-background">
      <EscrowHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <DealDetails dealId={parseInt(id, 10)} />
      </main>
    </div>
  )
}
