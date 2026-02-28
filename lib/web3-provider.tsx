"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { BrowserProvider, JsonRpcSigner } from "ethers"

const BASE_CHAIN_ID = 8453
const BASE_HEX = "0x2105"

const BASE_NETWORK = {
  chainId: BASE_HEX,
  chainName: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"],
}

interface Web3State {
  account: string | null
  signer: JsonRpcSigner | null
  provider: BrowserProvider | null
  chainId: number | null
  connecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
  switchToBase: () => Promise<void>
  isBase: boolean
}

const Web3Context = createContext<Web3State | null>(null)

export function useWeb3() {
  const ctx = useContext(Web3Context)
  if (!ctx) throw new Error("useWeb3 must be used within Web3Provider")
  return ctx
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isBase = chainId === BASE_CHAIN_ID

  const switchToBase = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) return
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_HEX }],
      })
    } catch (switchErr: unknown) {
      const err = switchErr as { code?: number }
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [BASE_NETWORK],
        })
      }
    }
  }, [])

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }
    setConnecting(true)
    setError(null)
    try {
      const bp = new BrowserProvider(window.ethereum)
      const accounts: string[] = await bp.send("eth_requestAccounts", [])
      const s = await bp.getSigner()
      const network = await bp.getNetwork()
      setProvider(bp)
      setSigner(s)
      setAccount(accounts[0])
      setChainId(Number(network.chainId))

      if (Number(network.chainId) !== BASE_CHAIN_ID) {
        await switchToBase()
      }
    } catch (e: unknown) {
      const err = e as { message?: string }
      setError(err.message ?? "Failed to connect wallet")
    } finally {
      setConnecting(false)
    }
  }, [switchToBase])

  const disconnect = useCallback(() => {
    setAccount(null)
    setSigner(null)
    setProvider(null)
    setChainId(null)
    setError(null)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        setAccount(accounts[0])
        const bp = new BrowserProvider(window.ethereum!)
        bp.getSigner().then(setSigner)
      }
    }

    const handleChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16))
      if (window.ethereum) {
        const bp = new BrowserProvider(window.ethereum)
        setProvider(bp)
        bp.getSigner().then(setSigner)
      }
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum?.removeListener("chainChanged", handleChainChanged)
    }
  }, [disconnect])

  return (
    <Web3Context.Provider
      value={{
        account,
        signer,
        provider,
        chainId,
        connecting,
        error,
        connect,
        disconnect,
        switchToBase,
        isBase,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}
