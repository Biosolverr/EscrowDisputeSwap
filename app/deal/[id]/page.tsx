import { MOCK_DEALS } from "@/lib/escrow-store"
import { EscrowHeader } from "@/components/escrow-header"
import { DealDetails } from "@/components/deal-details"

export default async function DealPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const deal = MOCK_DEALS.find((d) => d.id === id)

  return (
    <div className="min-h-screen bg-background">
      <EscrowHeader />

      <main className="mx-auto max-w-3xl px-6 py-10">
        {deal ? (
          <DealDetails deal={deal} />
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">Deal not found</p>
          </div>
        )}
      </main>
    </div>
  )
}
