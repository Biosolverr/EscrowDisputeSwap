"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useWeb3 } from "@/lib/web3-provider"
import { useContract } from "@/hooks/use-contract"
import { TxStatus, type TxState } from "@/components/tx-status"
import { toast } from "sonner"

export function CreateDealForm({ onDealCreated }: { onDealCreated?: () => void }) {
  const { account, isBase } = useWeb3()
  const { createDeal } = useContract()

  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [txState, setTxState] = useState<TxState>("idle")
  const [txHash, setTxHash] = useState<string>()
  const [txMsg, setTxMsg] = useState<string>()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!account || !isBase) return

    setTxState("pending")
    setTxMsg("Confirm the transaction in MetaMask...")
    try {
      const receipt = await createDeal(recipient, amount, description)
      setTxHash(receipt?.hash)
      setTxState("success")
      setTxMsg("Deal created successfully!")
      toast.success("Deal created on-chain!")
      setRecipient("")
      setAmount("")
      setDescription("")
      onDealCreated?.()
      setTimeout(() => setTxState("idle"), 5000)
    } catch (err: unknown) {
      const error = err as { reason?: string; message?: string }
      const msg = error.reason ?? error.message ?? "Transaction failed"
      setTxState("error")
      setTxMsg(msg)
      toast.error(msg)
      setTimeout(() => setTxState("idle"), 5000)
    }
  }

  const disabled = !account || !isBase || txState === "pending" || txState === "confirming"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Create Deal</CardTitle>
        <CardDescription>
          Set up a new escrow deal on Base L2
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="recipient" className="text-foreground">
              Recipient Address
            </Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
              className="bg-secondary text-foreground placeholder:text-muted-foreground border-border font-mono text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount" className="text-foreground">
              Amount (ETH)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.0001"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="bg-secondary text-foreground placeholder:text-muted-foreground border-border"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-foreground">
              Off-chain Reference
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the deal terms..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-secondary text-foreground placeholder:text-muted-foreground border-border resize-none"
            />
          </div>

          {!account && (
            <p className="text-xs text-muted-foreground">
              Connect your wallet to create a deal
            </p>
          )}
          {account && !isBase && (
            <p className="text-xs text-destructive">
              Switch to Base network to create a deal
            </p>
          )}

          <Button type="submit" className="gap-2" disabled={disabled}>
            <Plus className="h-4 w-4" />
            Create Deal
          </Button>

          <TxStatus state={txState} message={txMsg} hash={txHash} />
        </form>
      </CardContent>
    </Card>
  )
}
