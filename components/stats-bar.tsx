"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, CheckCircle2, AlertTriangle, Clock } from "lucide-react"
import { useWeb3 } from "@/lib/web3-provider"
import { useContract } from "@/hooks/use-contract"

interface Stats {
  created: number
  active: number
  finalized: number
  disputed: number
}

export function StatsBar() {
  const { account, provider, isBase } = useWeb3()
  const { getDeal, getNextDealId } = useContract()
  const [stats, setStats] = useState<Stats>({
    created: 0,
    active: 0,
    finalized: 0,
    disputed: 0,
  })

  const fetchStats = useCallback(async () => {
    if (!account || !provider || !isBase) {
      setStats({ created: 0, active: 0, finalized: 0, disputed: 0 })
      return
    }
    try {
      const nextId = await getNextDealId()
      const s: Stats = { created: 0, active: 0, finalized: 0, disputed: 0 }
      for (let i = 0; i < nextId; i++) {
        const d = await getDeal(i)
        if (
          d &&
          (d.sender.toLowerCase() === account.toLowerCase() ||
            d.recipient.toLowerCase() === account.toLowerCase())
        ) {
          if (d.state === 0) s.created++
          else if (d.state === 1) s.active++
          else if (d.state === 2 || d.state === 3) s.finalized++
          if (d.disputeOpen) s.disputed++
        }
      }
      setStats(s)
    } catch {
      // keep current stats
    }
  }, [account, provider, isBase, getDeal, getNextDealId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const items = [
    {
      label: "Created",
      value: stats.created,
      icon: Clock,
      color: "text-muted-foreground",
    },
    {
      label: "Active",
      value: stats.active,
      icon: Activity,
      color: "text-primary",
    },
    {
      label: "Finalized",
      value: stats.finalized,
      icon: CheckCircle2,
      color: "text-primary",
    },
    {
      label: "Disputed",
      value: stats.disputed,
      icon: AlertTriangle,
      color: "text-destructive",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((stat) => (
        <Card key={stat.label} className="py-4">
          <CardContent className="flex items-center gap-3 px-4">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
