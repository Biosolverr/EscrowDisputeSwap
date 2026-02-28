import type { createBaseAccountSDK as CreateFn } from "@base-org/account"

type BaseSdk = ReturnType<typeof CreateFn>

let sdk: BaseSdk | null = null

const SESSION_KEY = "base-account-address"

export function getBaseSdk(): BaseSdk {
  if (typeof window === "undefined") {
    throw new Error("Base Account SDK can only be used in the browser")
  }

  if (!sdk) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createBaseAccountSDK } = require("@base-org/account") as {
      createBaseAccountSDK: typeof CreateFn
    }
    sdk = createBaseAccountSDK({
      appName: "Escrow Dashboard on Base",
      appChainIds: [8453],
    })
  }

  return sdk
}

/** Read the cached Base address from the current session (if any). */
export function getSavedBaseAddress(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(SESSION_KEY)
}

/** Clear the cached Base address. */
export function clearBaseAddress(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(SESSION_KEY)
}

/**
 * Connect via the Base Account SDK and return the address.
 * The address is persisted in sessionStorage so the UI stays
 * connected across re-renders without triggering a new popup.
 */
export async function signInWithBase(): Promise<string> {
  const baseSdk = getBaseSdk()
  const provider = baseSdk.getProvider()
  const nonce = crypto.randomUUID()

  const result = await provider.request({
    method: "wallet_connect",
    params: [
      {
        nonce,
        capabilities: {
          signInWithEthereum: {},
        },
      },
    ],
  })

  // The SDK may return a plain string[], an object with accounts, etc.
  let address: string | undefined

  if (Array.isArray(result) && result.length > 0) {
    address = result[0]
  } else if (result && typeof result === "object" && "accounts" in result) {
    const accounts = (result as { accounts: string[] }).accounts
    if (accounts.length > 0) address = accounts[0]
  } else if (typeof result === "string") {
    address = result
  }

  if (!address) {
    throw new Error("No account returned from Base sign-in")
  }

  // Persist so we don't re-prompt on re-render / remount
  sessionStorage.setItem(SESSION_KEY, address)

  return address
}
