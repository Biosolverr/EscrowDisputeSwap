"use client"

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
import { ArrowRight } from "lucide-react"
import { MOCK_DEALS, type DealStatus } from "@/lib/escrow-store"

function statusVariant(status: DealStatus) {
  switch (status) {
    case "active":
      return "default" as const
    case "completed":
      return "secondary" as const
    case "disputed":
      return "destructive" as const
    case "pending":
      return "outline" as const
  }
}

function statusColor(status: DealStatus) {
  switch (status) {
    case "active":
      return "bg-primary text-primary-foreground"
    case "completed":
      return "bg-success text-success-foreground"
    case "disputed":
      return "bg-destructive text-destructive-foreground"
    case "pending":
      return "border-border text-muted-foreground bg-transparent"
  }
}

export function DealsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">My Deals</CardTitle>
        <CardDescription>
          {MOCK_DEALS.length} deals in your escrow history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {MOCK_DEALS.map((deal) => (
            <div
              key={deal.id}
              className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3 transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm text-muted-foreground">
                  {deal.id}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {deal.amount} ETH
                </span>
                <Badge
                  variant={statusVariant(deal.status)}
                  className={statusColor(deal.status)}
                >
                  {deal.status}
                </Badge>
              </div>
              <Link href={`/deal/${deal.id}`}>
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                  View
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
