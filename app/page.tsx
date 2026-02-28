"use client"

import { useState } from "react"
import { EscrowHeader } from "@/components/escrow-header"
import { CreateDealForm } from "@/components/create-deal-form"
import { DealsList } from "@/components/deals-list"
import { StatsBar } from "@/components/stats-bar"

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="min-h-screen bg-background">
      <EscrowHeader />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground text-balance">
            Escrow Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your decentralized escrow deals on Base L2
          </p>
        </div>

        <div className="mb-8">
          <StatsBar />
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <CreateDealForm onDealCreated={() => setRefreshKey((k) => k + 1)} />
          </div>
          <div className="lg:col-span-3">
            <DealsList refreshKey={refreshKey} />
          </div>
        </div>
      </main>
    </div>
  )
}
