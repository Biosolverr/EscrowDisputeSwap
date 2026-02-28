"use client"

import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export type TxState = "idle" | "pending" | "confirming" | "success" | "error"

interface TxStatusProps {
  state: TxState
  message?: string
  hash?: string
}

export function TxStatus({ state, message, hash }: TxStatusProps) {
  if (state === "idle") return null

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm">
      {state === "pending" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-warning" />
          <span className="text-warning">{message ?? "Waiting for wallet approval..."}</span>
        </>
      )}
      {state === "confirming" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-primary">{message ?? "Confirming transaction..."}</span>
        </>
      )}
      {state === "success" && (
        <>
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-primary">{message ?? "Transaction confirmed!"}</span>
          {hash && (
            <a
              href={`https://basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto font-mono text-xs text-muted-foreground underline hover:text-foreground"
            >
              View on BaseScan
            </a>
          )}
        </>
      )}
      {state === "error" && (
        <>
          <XCircle className="h-4 w-4 text-destructive" />
          <span className="text-destructive">{message ?? "Transaction failed"}</span>
        </>
      )}
    </div>
  )
}
