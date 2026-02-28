"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Wallet, LogOut, AlertCircle } from "lucide-react"
import { useWeb3 } from "@/lib/web3-provider"

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function EscrowHeader() {
  const { account, connecting, connect, disconnect, isBase, switchToBase, error } =
    useWeb3()

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

        <div className="flex items-center gap-3">
          {account && !isBase && (
            <Button
              onClick={switchToBase}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              Switch to Base
            </Button>
          )}

          {account && isBase && (
            <Badge variant="outline" className="border-primary/30 text-primary font-mono text-xs px-2.5 py-1">
              Base
            </Badge>
          )}

          {account ? (
            <div className="flex items-center gap-2">
              <span className="hidden font-mono text-sm text-muted-foreground sm:inline">
                {shortenAddress(account)}
              </span>
              <Button
                onClick={disconnect}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            </div>
          ) : (
            <Button onClick={connect} disabled={connecting} className="gap-2">
              <Wallet className="h-4 w-4" />
              {connecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="border-t border-destructive/20 bg-destructive/10 px-6 py-2">
          <p className="mx-auto max-w-5xl text-xs text-destructive">
            {error}
          </p>
        </div>
      )}
    </header>
  )
}
