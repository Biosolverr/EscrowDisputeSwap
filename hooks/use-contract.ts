"use client"

import { useCallback, useMemo } from "react"
import { Contract, parseEther, formatEther } from "ethers"
import { CONTRACT_ADDRESS } from "@/lib/constants"
import { CONTRACT_ABI } from "@/lib/abi"
import { useWeb3 } from "@/lib/web3-provider"

export const DEAL_STATES = [
  "Created",
  "Active",
  "FinalizedStable",
  "FinalizedNFT",
  "Cancelled",
  "Expired",
  "Disputed",
] as const

export const DISPUTE_OUTCOMES = [
  "None",
  "SenderWins",
  "RecipientWins",
  "Split",
] as const

export interface DealData {
  sender: string
  recipient: string
  state: number
  initialValue: bigint
  currentValue: bigint
  deposit: bigint
  createdAt: bigint
  activatedAt: bigint
  finalizedAt: bigint
  activationDeadline: bigint
  finalizationDeadline: bigint
  offchainRef: string
  nftMetadata: string
  disputeOpen: boolean
  claimBy: string
  claimReason: string
  claimOpenedAt: bigint
  claimDeadline: bigint
  challengeBy: string
  challengeReason: string
  resolutionMode: bigint
  resolutionNote: string
}

export function useContract() {
  const { signer, provider, account } = useWeb3()

  const readContract = useMemo(() => {
    if (!provider) return null
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
  }, [provider])

  const writeContract = useMemo(() => {
    if (!signer) return null
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  }, [signer])

  const getDeal = useCallback(
    async (dealId: number): Promise<DealData | null> => {
      if (!readContract) return null
      try {
        const d = await readContract.deals(dealId)
        return {
          sender: d.sender,
          recipient: d.recipient,
          state: Number(d.state),
          initialValue: d.initialValue,
          currentValue: d.currentValue,
          deposit: d.deposit,
          createdAt: d.createdAt,
          activatedAt: d.activatedAt,
          finalizedAt: d.finalizedAt,
          activationDeadline: d.activationDeadline,
          finalizationDeadline: d.finalizationDeadline,
          offchainRef: d.offchainRef,
          nftMetadata: d.nftMetadata,
          disputeOpen: d.disputeOpen,
          claimBy: d.claimBy,
          claimReason: d.claimReason,
          claimOpenedAt: d.claimOpenedAt,
          claimDeadline: d.claimDeadline,
          challengeBy: d.challengeBy,
          challengeReason: d.challengeReason,
          resolutionMode: d.resolutionMode,
          resolutionNote: d.resolutionNote,
        }
      } catch {
        return null
      }
    },
    [readContract]
  )

  const getNextDealId = useCallback(async (): Promise<number> => {
    if (!readContract) return 0
    const id = await readContract.nextDealId()
    return Number(id)
  }, [readContract])

  const createDeal = useCallback(
    async (recipient: string, valueEth: string, offchainRef: string) => {
      if (!writeContract) throw new Error("Wallet not connected")
      const value = parseEther(valueEth)
      const tx = await writeContract.createDeal(recipient, value, offchainRef, {
        value,
      })
      return tx.wait()
    },
    [writeContract]
  )

  const activateDeal = useCallback(
    async (dealId: number) => {
      if (!writeContract) throw new Error("Wallet not connected")
      const tx = await writeContract.activateDeal(dealId)
      return tx.wait()
    },
    [writeContract]
  )

  const finalizeToStable = useCallback(
    async (dealId: number) => {
      if (!writeContract) throw new Error("Wallet not connected")
      const tx = await writeContract.finalizeToStable(dealId)
      return tx.wait()
    },
    [writeContract]
  )

  const finalizeToNFT = useCallback(
    async (dealId: number, metadata: string) => {
      if (!writeContract) throw new Error("Wallet not connected")
      const tx = await writeContract.finalizeToNFT(dealId, metadata)
      return tx.wait()
    },
    [writeContract]
  )

  const openDispute = useCallback(
    async (dealId: number, reason: string) => {
      if (!writeContract) throw new Error("Wallet not connected")
      const tx = await writeContract.openDispute(dealId, reason)
      return tx.wait()
    },
    [writeContract]
  )

  const challengeDispute = useCallback(
    async (dealId: number, reason: string) => {
      if (!writeContract) throw new Error("Wallet not connected")
      const tx = await writeContract.challengeDispute(dealId, reason)
      return tx.wait()
    },
    [writeContract]
  )

  const resolveDispute = useCallback(
    async (
      dealId: number,
      mode: number,
      note: string,
      outcome: number,
      recipientBps: number
    ) => {
      if (!writeContract) throw new Error("Wallet not connected")
      const tx = await writeContract.resolveDispute(
        dealId,
        mode,
        note,
        outcome,
        recipientBps
      )
      return tx.wait()
    },
    [writeContract]
  )

  const cancelInactive = useCallback(
    async (dealId: number) => {
      if (!writeContract) throw new Error("Wallet not connected")
      const tx = await writeContract.cancelInactive(dealId)
      return tx.wait()
    },
    [writeContract]
  )

  const expireDeal = useCallback(
    async (dealId: number) => {
      if (!writeContract) throw new Error("Wallet not connected")
      const tx = await writeContract.expireDeal(dealId)
      return tx.wait()
    },
    [writeContract]
  )

  const getContractEvents = useCallback(
    async (dealId: number) => {
      if (!readContract || !provider) return []
      try {
        const filters = [
          readContract.filters.DealCreated(dealId),
          readContract.filters.DealActivated(dealId),
          readContract.filters.DealFinalizedToStable(dealId),
          readContract.filters.DealFinalizedToNFT(dealId),
          readContract.filters.DealCancelled(dealId),
          readContract.filters.DisputeOpened(dealId),
          readContract.filters.DisputeChallenged(dealId),
          readContract.filters.DisputeResolved(dealId),
        ]
        const eventPromises = filters.map((f) =>
          readContract.queryFilter(f, -10000)
        )
        const results = await Promise.all(eventPromises)
        const allEvents = results.flat()
        allEvents.sort((a, b) => (a.blockNumber ?? 0) - (b.blockNumber ?? 0))
        return allEvents
      } catch {
        return []
      }
    },
    [readContract, provider]
  )

  return {
    readContract,
    writeContract,
    account,
    getDeal,
    getNextDealId,
    createDeal,
    activateDeal,
    finalizeToStable,
    finalizeToNFT,
    openDispute,
    challengeDispute,
    resolveDispute,
    cancelInactive,
    expireDeal,
    getContractEvents,
    formatEther,
  }
}
