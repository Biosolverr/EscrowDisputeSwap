import { createBaseAccountSDK } from "@base-org/account"

export const baseSdk = createBaseAccountSDK({
  appName: "Escrow Dashboard on Base",
  appChainIds: [8453],
})

export const baseProvider = baseSdk.getProvider()

export async function signInWithBase(): Promise<string> {
  const nonce = crypto.randomUUID()

  const accounts = (await baseProvider.request({
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
