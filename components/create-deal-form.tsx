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

export function CreateDealForm() {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setRecipient("")
      setAmount("")
      setDescription("")
      setSubmitted(false)
    }, 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Create Deal</CardTitle>
        <CardDescription>
          Set up a new escrow deal with a recipient
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
              className="bg-secondary text-foreground placeholder:text-muted-foreground border-border"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount" className="text-foreground">
              Amount (ETH)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary text-foreground placeholder:text-muted-foreground border-border"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-foreground">
              Description
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

          <Button type="submit" className="gap-2" disabled={submitted}>
            <Plus className="h-4 w-4" />
            {submitted ? "Deal Created" : "Create Deal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
