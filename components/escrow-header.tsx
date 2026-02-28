"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Wallet } from "lucide-react"

export function EscrowHeader() {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState("")

  function handleConnect() {
    if (connected) {
      setConnected(false)
      setAddress("")
    } else {
      setConnected(true)
      setAddress("0x742d...44e5")
    }
  }

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">
            EscrowVault
          </span>
        </Link>

        <Button
          onClick={handleConnect}
          variant={connected ? "secondary" : "default"}
          className="gap-2"
        >
          <Wallet className="h-4 w-4" />
          {connected ? address : "Connect Wallet"}
        </Button>
      </div>
    </header>
  )
}
