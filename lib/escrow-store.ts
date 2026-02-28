export type DealStatus = "pending" | "active" | "completed" | "disputed"

export interface Deal {
  id: string
  recipient: string
  amount: string
  description: string
  status: DealStatus
  createdAt: string
}

export const MOCK_DEALS: Deal[] = [
  {
    id: "0x001",
    recipient: "0x742d...44e5",
    amount: "2.5",
    description: "Website development milestone 1",
    status: "active",
    createdAt: "2026-02-20",
  },
  {
    id: "0x002",
    recipient: "0x8b3a...9f12",
    amount: "1.0",
    description: "Logo design delivery",
    status: "completed",
    createdAt: "2026-02-18",
  },
  {
    id: "0x003",
    recipient: "0x1c9e...7a3b",
    amount: "5.0",
    description: "Smart contract audit",
    status: "pending",
    createdAt: "2026-02-25",
  },
  {
    id: "0x004",
    recipient: "0x4f2d...b8c1",
    amount: "0.75",
    description: "NFT artwork commission",
    status: "disputed",
    createdAt: "2026-02-15",
  },
]
