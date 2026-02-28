"use client"

import { useState } from "react"
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
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react"
import type { Deal, DealStatus } from "@/lib/escrow-store"

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

export function DealDetails({ deal }: { deal: Deal }) {
  const [currentStatus, setCurrentStatus] = useState<DealStatus>(deal.status)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(deal.recipient)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">
                Deal {deal.id}
              </CardTitle>
              <CardDescription>Created on {deal.createdAt}</CardDescription>
            </div>
            <Badge
              variant={statusVariant(currentStatus)}
              className={`${statusColor(currentStatus)} text-sm px-3 py-1`}
            >
              {currentStatus}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recipient
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-foreground">
                  {deal.recipient}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Copy address"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Amount
              </span>
              <span className="text-2xl font-semibold text-foreground">
                {deal.amount}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ETH
                </span>
              </span>
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Description
            </span>
            <p className="text-sm leading-relaxed text-foreground">
              {deal.description}
            </p>
          </div>

          <Separator className="bg-border" />

          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Actions
            </span>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setCurrentStatus("active")}
                disabled={currentStatus === "active" || currentStatus === "completed"}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                Activate
              </Button>

              <Button
                onClick={() => setCurrentStatus("completed")}
                disabled={currentStatus === "completed" || currentStatus === "pending"}
                variant="secondary"
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </Button>

              <Button
                onClick={() => setCurrentStatus("disputed")}
                disabled={currentStatus === "disputed" || currentStatus === "completed"}
                variant="destructive"
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Open Dispute
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent className="px-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Escrow Protection
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Funds are locked in the smart contract until both parties agree
                to release. Disputes are resolved through on-chain arbitration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
