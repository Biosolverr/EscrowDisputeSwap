import { Card, CardContent } from "@/components/ui/card"
import { MOCK_DEALS } from "@/lib/escrow-store"
import { Activity, CheckCircle2, AlertTriangle, Clock } from "lucide-react"

const stats = [
  {
    label: "Active",
    value: MOCK_DEALS.filter((d) => d.status === "active").length,
    icon: Activity,
    color: "text-primary",
  },
  {
    label: "Completed",
    value: MOCK_DEALS.filter((d) => d.status === "completed").length,
    icon: CheckCircle2,
    color: "text-success",
  },
  {
    label: "Disputed",
    value: MOCK_DEALS.filter((d) => d.status === "disputed").length,
    icon: AlertTriangle,
    color: "text-destructive",
  },
  {
    label: "Pending",
    value: MOCK_DEALS.filter((d) => d.status === "pending").length,
    icon: Clock,
    color: "text-muted-foreground",
  },
]

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
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
