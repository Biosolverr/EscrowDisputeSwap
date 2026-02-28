"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Loader2, Search } from "lucide-react"
import { useWeb3 } from "@/lib/web3-provider"
import { useContract, DEAL_STATES, type DealData } from "@/hooks/use-contract"
import { formatEther } from "ethers"

interface DealEntry {
  id: number
  data: DealData
}

function stateColor(state: number) {
  switch (state) {
    case 0:
      return "border-border text-muted-foreground bg-transparent"
    case 1:
      return "bg-primary text-primary-foreground"
    case 2:
    case 3:
      return "bg-primary/80 text-primary-foreground"
    case 4:
    case 5:
      return "bg-secondary text-secondary-foreground"
    case 6:
      return "bg-destructive text-destructive-foreground"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

function stateVariant(state: number) {
  switch (state) {
    case 0:
      return "outline" as const
    case 6:
      return "destructive" as const
    default:
      return "default" as const
  }
}

export function DealsList({ refreshKey }: { refreshKey?: number }) {
  const { account, isBase, provider } = useWeb3()
  const { getDeal, getNextDealId } = useContract()
  const [deals, setDeals] = useState<DealEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [lookupId, setLookupId] = useState("")

  const fetchDeals = useCallback(async () => {
    if (!account || !provider || !isBase) {
      setDeals([])
      return
    }
    setLoading(true)
    try {
      const nextId = await getNextDealId()
      const entries: DealEntry[] = []
      for (let i = 0; i < nextId; i++) {
        const d = await getDeal(i)
        if (
          d &&
          (d.sender.toLowerCase() === account.toLowerCase() ||
            d.recipient.toLowerCase() === account.toLowerCase())
        ) {
          entries.push({ id: i, data: d })
        }
      }
      setDeals(entries)
    } catch {
      setDeals([])
    } finally {
      setLoading(false)
    }
  }, [account, provider, isBase, getDeal, getNextDealId])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals, refreshKey])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">My Deals</CardTitle>
            <CardDescription>
              {account
                ? `${deals.length} deal${deals.length !== 1 ? "s" : ""} found for your address`
                : "Connect wallet to view deals"}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Look up deal by ID..."
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              className="bg-secondary border-border pl-9 text-sm"
            />
          </div>
          {lookupId && (
            <Link href={`/deal/${lookupId}`}>
              <Button size="sm" variant="secondary" className="gap-1">
                View
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading deals from chain...
            </span>
          </div>
        ) : deals.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {account ? "No deals found for your address" : "Connect your wallet to see deals"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {deals.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-muted-foreground">
                    #{entry.id}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formatEther(entry.data.initialValue)} ETH
                  </span>
                  <Badge
                    variant={stateVariant(entry.data.state)}
                    className={stateColor(entry.data.state)}
                  >
                    {DEAL_STATES[entry.data.state] ?? "Unknown"}
                  </Badge>
                  {entry.data.disputeOpen && (
                    <Badge variant="destructive" className="text-xs">
                      Dispute Open
                    </Badge>
                  )}
                </div>
                <Link href={`/deal/${entry.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-muted-foreground hover:text-foreground"
                  >
                    View
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
