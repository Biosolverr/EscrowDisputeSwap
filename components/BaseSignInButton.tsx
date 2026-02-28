"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { signInWithBase } from "@/lib/baseAccount"
import { Loader2 } from "lucide-react"

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function BaseSignInButton() {
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const addr = await signInWithBase()
      setAddress(addr)
    } catch (e: unknown) {
      const err = e as { message?: string }
      setError(err.message ?? "Base sign-in failed")
    } finally {
      setLoading(false)
    }
  }, [])

  if (error) {
    return (
      <Button
        onClick={handleSignIn}
        variant="outline"
        size="sm"
        className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
      >
        Retry Base Sign In
      </Button>
    )
  }

  if (address) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 font-mono text-xs text-secondary-foreground">
        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
        Base: {shortenAddress(address)}
      </span>
    )
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3.5c1.66 0 3.08.95 3.78 2.33H8.22C8.92 6.45 10.34 5.5 12 5.5zm5.5 8.5H6.5v-1.5h11V14zm0-3H6.5V9.5h11V11z" />
        </svg>
      )}
      {loading ? "Signing in..." : "Sign in with Base"}
    </Button>
  )
}
