"use client"

import { useCallback, useEffect, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Loader2,
  Gavel,
  XCircle,
  Clock,
  ImageIcon,
  Ban,
  Timer,
  ShieldAlert,
} from "lucide-react"
import { useWeb3 } from "@/lib/web3-provider"
import {
  useContract,
  DEAL_STATES,
  DISPUTE_OUTCOMES,
  type DealData,
} from "@/hooks/use-contract"
import { TxStatus, type TxState } from "@/components/tx-status"
import { formatEther } from "ethers"
import { toast } from "sonner"
import type { Log, EventLog } from "ethers"

function shortenAddress(addr: string) {
  if (!addr || addr === "0x0000000000000000000000000000000000000000") return "N/A"
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function formatTimestamp(ts: bigint) {
  if (ts === 0n) return "N/A"
  return new Date(Number(ts) * 1000).toLocaleString()
}

export function DealDetails({ dealId }: { dealId: number }) {
  const { account, isBase } = useWeb3()
  const {
    getDeal,
    activateDeal,
    finalizeToStable,
    finalizeToNFT,
    openDispute,
    challengeDispute,
    resolveDispute,
    cancelInactive,
    expireDeal,
    getContractEvents,
  } = useContract()

  const [deal, setDeal] = useState<DealData | null>(null)
  const [loading, setLoading] = useState(true)
  const [txState, setTxState] = useState<TxState>("idle")
  const [txMsg, setTxMsg] = useState<string>()
  const [txHash, setTxHash] = useState<string>()
  const [copied, setCopied] = useState<"sender" | "recipient" | null>(null)
  const [events, setEvents] = useState<(Log | EventLog)[]>([])

  // Form states for actions
  const [disputeReason, setDisputeReason] = useState("")
  const [challengeReason, setChallengeReason] = useState("")
  const [nftMetadata, setNftMetadata] = useState("")
  const [resolveMode, setResolveMode] = useState("0")
  const [resolveNote, setResolveNote] = useState("")
  const [resolveOutcome, setResolveOutcome] = useState("0")
  const [resolveBps, setResolveBps] = useState("5000")

  const fetchDeal = useCallback(async () => {
    setLoading(true)
    const d = await getDeal(dealId)
    setDeal(d)
    setLoading(false)
  }, [dealId, getDeal])

  const fetchEvents = useCallback(async () => {
    const evts = await getContractEvents(dealId)
    setEvents(evts)
  }, [dealId, getContractEvents])

  useEffect(() => {
    fetchDeal()
    fetchEvents()
  }, [fetchDeal, fetchEvents])

  function handleCopy(addr: string, field: "sender" | "recipient") {
    navigator.clipboard.writeText(addr)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  async function execAction(name: string, action: () => Promise<unknown>) {
    setTxState("pending")
    setTxMsg(`Confirm ${name} in MetaMask...`)
    try {
      const receipt = (await action()) as { hash?: string } | null
      setTxHash(receipt?.hash)
      setTxState("success")
      setTxMsg(`${name} confirmed!`)
      toast.success(`${name} confirmed!`)
      await fetchDeal()
      await fetchEvents()
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading deal data from chain...</p>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">
            {account
              ? `Deal #${dealId} not found on chain`
              : "Connect your wallet to view deal details"}
          </p>
        </div>
      </div>
    )
  }

  const isSender = account?.toLowerCase() === deal.sender.toLowerCase()
  const isRecipient = account?.toLowerCase() === deal.recipient.toLowerCase()
  const isParticipant = isSender || isRecipient
  const walletConnected = !!account && isBase

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Deal Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Deal #{dealId}</CardTitle>
              <CardDescription>
                Created {formatTimestamp(deal.createdAt)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {deal.disputeOpen && (
                <Badge variant="destructive">Dispute Open</Badge>
              )}
              <Badge
                variant={deal.state === 6 ? "destructive" : deal.state === 0 ? "outline" : "default"}
                className="text-sm px-3 py-1"
              >
                {DEAL_STATES[deal.state] ?? "Unknown"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {/* Addresses */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sender {isSender && "(You)"}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-foreground">
                  {shortenAddress(deal.sender)}
                </span>
                <button
                  onClick={() => handleCopy(deal.sender, "sender")}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Copy sender address"
                >
                  {copied === "sender" ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recipient {isRecipient && "(You)"}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-foreground">
                  {shortenAddress(deal.recipient)}
                </span>
                <button
                  onClick={() => handleCopy(deal.recipient, "recipient")}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Copy recipient address"
                >
                  {copied === "recipient" ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Values */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Initial Value
              </span>
              <span className="text-2xl font-semibold text-foreground">
                {formatEther(deal.initialValue)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ETH
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Current Value
              </span>
              <span className="text-2xl font-semibold text-foreground">
                {formatEther(deal.currentValue)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ETH
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Deposit
              </span>
              <span className="text-2xl font-semibold text-foreground">
                {formatEther(deal.deposit)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ETH
                </span>
              </span>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Timestamps */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Activated At
              </span>
              <span className="text-sm text-foreground">
                {formatTimestamp(deal.activatedAt)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Finalized At
              </span>
              <span className="text-sm text-foreground">
                {formatTimestamp(deal.finalizedAt)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Activation Deadline
              </span>
              <span className="text-sm text-foreground">
                {formatTimestamp(deal.activationDeadline)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Finalization Deadline
              </span>
              <span className="text-sm text-foreground">
                {formatTimestamp(deal.finalizationDeadline)}
              </span>
            </div>
          </div>

          {deal.offchainRef && (
            <>
              <Separator className="bg-border" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Off-chain Reference
                </span>
                <p className="text-sm leading-relaxed text-foreground">
                  {deal.offchainRef}
                </p>
              </div>
            </>
          )}

          {/* Dispute Info */}
          {deal.disputeOpen && (
            <>
              <Separator className="bg-border" />
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    Dispute Information
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Opened By</span>
                    <p className="font-mono text-sm text-foreground">
                      {shortenAddress(deal.claimBy)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Deadline</span>
                    <p className="text-sm text-foreground">
                      {formatTimestamp(deal.claimDeadline)}
                    </p>
                  </div>
                </div>
                {deal.claimReason && (
                  <div>
                    <span className="text-xs text-muted-foreground">Claim Reason</span>
                    <p className="text-sm text-foreground">{deal.claimReason}</p>
                  </div>
                )}
                {deal.challengeBy !== "0x0000000000000000000000000000000000000000" && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Challenged By</span>
                      <p className="font-mono text-sm text-foreground">
                        {shortenAddress(deal.challengeBy)}
                      </p>
                    </div>
                    {deal.challengeReason && (
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Challenge Reason
                        </span>
                        <p className="text-sm text-foreground">
                          {deal.challengeReason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {deal.resolutionNote && (
                  <div>
                    <span className="text-xs text-muted-foreground">Resolution</span>
                    <p className="text-sm text-foreground">{deal.resolutionNote}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Status */}
      {txState !== "idle" && (
        <TxStatus state={txState} message={txMsg} hash={txHash} />
      )}

      {/* Actions Card */}
      {walletConnected && isParticipant && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Actions</CardTitle>
            <CardDescription>
              Execute contract functions for this deal
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Activate Deal - Recipient only, state Created */}
            {deal.state === 0 && (
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() =>
                    execAction("Activate Deal", () => activateDeal(dealId))
                  }
                  disabled={txState === "pending" || txState === "confirming"}
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Activate Deal
                </Button>
                {isSender && (
                  <Button
                    onClick={() =>
                      execAction("Cancel Deal", () => cancelInactive(dealId))
                    }
                    disabled={txState === "pending" || txState === "confirming"}
                    variant="secondary"
                    className="gap-2"
                  >
                    <Ban className="h-4 w-4" />
                    Cancel Inactive
                  </Button>
                )}
              </div>
            )}

            {/* Active deal actions */}
            {deal.state === 1 && !deal.disputeOpen && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() =>
                      execAction("Finalize to Stable", () =>
                        finalizeToStable(dealId)
                      )
                    }
                    disabled={txState === "pending" || txState === "confirming"}
                    variant="secondary"
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Finalize to Stable
                  </Button>
                  <Button
                    onClick={() =>
                      execAction("Expire Deal", () => expireDeal(dealId))
                    }
                    disabled={txState === "pending" || txState === "confirming"}
                    variant="secondary"
                    className="gap-2"
                  >
                    <Timer className="h-4 w-4" />
                    Expire Deal
                  </Button>
                </div>

                {/* Finalize to NFT */}
                <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 p-4">
                  <Label className="text-foreground text-sm font-medium">Finalize to NFT</Label>
                  <Input
                    placeholder="NFT metadata (JSON or URI)"
                    value={nftMetadata}
                    onChange={(e) => setNftMetadata(e.target.value)}
                    className="bg-secondary border-border text-sm"
                  />
                  <Button
                    onClick={() =>
                      execAction("Finalize to NFT", () =>
                        finalizeToNFT(dealId, nftMetadata)
                      )
                    }
                    disabled={
                      txState === "pending" ||
                      txState === "confirming" ||
                      !nftMetadata
                    }
                    variant="secondary"
                    className="gap-2 w-fit"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Finalize to NFT
                  </Button>
                </div>

                {/* Open Dispute */}
                <div className="flex flex-col gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <Label className="text-foreground text-sm font-medium">Open Dispute</Label>
                  <Textarea
                    placeholder="Reason for dispute..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    rows={2}
                    className="bg-secondary border-border resize-none text-sm"
                  />
                  <Button
                    onClick={() =>
                      execAction("Open Dispute", () =>
                        openDispute(dealId, disputeReason)
                      )
                    }
                    disabled={
                      txState === "pending" ||
                      txState === "confirming" ||
                      !disputeReason
                    }
                    variant="destructive"
                    className="gap-2 w-fit"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Open Dispute
                  </Button>
                </div>
              </div>
            )}

            {/* Dispute actions */}
            {deal.disputeOpen && (
              <div className="flex flex-col gap-4">
                {/* Challenge Dispute */}
                {deal.challengeBy === "0x0000000000000000000000000000000000000000" && (
                  <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 p-4">
                    <Label className="text-foreground text-sm font-medium">Challenge Dispute</Label>
                    <Textarea
                      placeholder="Reason for challenging..."
                      value={challengeReason}
                      onChange={(e) => setChallengeReason(e.target.value)}
                      rows={2}
                      className="bg-secondary border-border resize-none text-sm"
                    />
                    <Button
                      onClick={() =>
                        execAction("Challenge Dispute", () =>
                          challengeDispute(dealId, challengeReason)
                        )
                      }
                      disabled={
                        txState === "pending" ||
                        txState === "confirming" ||
                        !challengeReason
                      }
                      variant="secondary"
                      className="gap-2 w-fit"
                    >
                      <Gavel className="h-4 w-4" />
                      Challenge Dispute
                    </Button>
                  </div>
                )}

                {/* Resolve Dispute */}
                <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 p-4">
                  <Label className="text-foreground text-sm font-medium">
                    Resolve Dispute (Resolver Only)
                  </Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">Mode</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={resolveMode}
                        onChange={(e) => setResolveMode(e.target.value)}
                        className="bg-secondary border-border text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">
                        Outcome ({DISPUTE_OUTCOMES.join(", ")})
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="3"
                        placeholder="0"
                        value={resolveOutcome}
                        onChange={(e) => setResolveOutcome(e.target.value)}
                        className="bg-secondary border-border text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">
                        Recipient BPS (0-10000)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="10000"
                        placeholder="5000"
                        value={resolveBps}
                        onChange={(e) => setResolveBps(e.target.value)}
                        className="bg-secondary border-border text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">Note</Label>
                      <Input
                        placeholder="Resolution note..."
                        value={resolveNote}
                        onChange={(e) => setResolveNote(e.target.value)}
                        className="bg-secondary border-border text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      execAction("Resolve Dispute", () =>
                        resolveDispute(
                          dealId,
                          parseInt(resolveMode),
                          resolveNote,
                          parseInt(resolveOutcome),
                          parseInt(resolveBps)
                        )
                      )
                    }
                    disabled={txState === "pending" || txState === "confirming"}
                    variant="secondary"
                    className="gap-2 w-fit"
                  >
                    <Gavel className="h-4 w-4" />
                    Resolve Dispute
                  </Button>
                </div>
              </div>
            )}

            {/* Terminal states */}
            {(deal.state === 2 ||
              deal.state === 3 ||
              deal.state === 4 ||
              deal.state === 5) &&
              !deal.disputeOpen && (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-4 py-3">
                  {deal.state === 4 || deal.state === 5 ? (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    This deal has been{" "}
                    {DEAL_STATES[deal.state]?.toLowerCase() ?? "finalized"}.
                    No further actions available.
                  </span>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Events Card */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              On-chain Events
            </CardTitle>
            <CardDescription>
              Transaction history for this deal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {events.map((evt, i) => {
                const eventLog = evt as EventLog
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {eventLog.fragment?.name ?? "Event"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Block #{evt.blockNumber}
                      </span>
                    </div>
                    <a
                      href={`https://basescan.org/tx/${evt.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-muted-foreground underline hover:text-foreground"
                    >
                      {evt.transactionHash?.slice(0, 10)}...
                    </a>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="py-4">
        <CardContent className="px-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Escrow Protection on Base L2
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Funds are locked in the smart contract until both parties agree
                to release. Disputes are resolved through on-chain arbitration.
                All transactions happen on Base L2 for low gas fees.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
