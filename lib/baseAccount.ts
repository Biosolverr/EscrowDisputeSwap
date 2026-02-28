import type { createBaseAccountSDK as CreateFn } from "@base-org/account"

type BaseSdk = ReturnType<typeof CreateFn>

let sdk: BaseSdk | null = null

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

export async function signInWithBase(): Promise<string> {
  const baseSdk = getBaseSdk()
  const provider = baseSdk.getProvider()
  const nonce = crypto.randomUUID()

  const accounts = (await provider.request({
    method: "wallet_connect",
    params: [
      {
        nonce,
        capabilities: {
          signInWithEthereum: {},
        },
      },
    ],
  })) as string[]

  return accounts[0]
}
