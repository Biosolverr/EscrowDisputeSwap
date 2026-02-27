# EscrowDisputeSwap

EscrowDisputeSwap is an ETH escrow-style contract that allows a sender to lock funds for a recipient and release them later, cancel them after timeouts, or escalate to a dispute that is resolved by a designated resolver.

## Core idea

A deal is created with a recipient, an ETH deposit, and an optional offchain reference string. The contract tracks the deal state and several deadlines. Depending on what happens next, the deal can be activated, finalized (paid out), expired (refunded), or moved into a dispute flow.

## Roles

- Sender: creates and funds a deal.
- Recipient: intended receiver of the payout.
- Resolver: the contract owner and/or an aiJudge address (depending on configuration). Only the resolver can resolve disputes.

## Time parameters

The contract has default timeout parameters that can be updated by calling `setTimeouts(activationPeriod, finalizationPeriod, disputePeriod, minDelay)`.

- activationPeriod: used to compute an activation deadline for newly created deals.
- finalizationPeriod: used to compute a finalization deadline after a deal is activated.
- disputePeriod: used to compute a claim deadline after a dispute is opened.
- minDelay: stored as a configuration value and may be used by the contract’s rules depending on the deployed version.

Changing these defaults affects new deals going forward and does not automatically rewrite deadlines for existing deals.

## Deal lifecycle

### 1) Create a deal

The sender calls `createDeal(recipient, value, offchainRef)` and sends ETH with the transaction.  
On success, the contract records the deal and emits a creation event containing the new deal id.

### 2) Activate a deal

An activated deal is considered “in progress” and eligible for the normal completion path.  
Activation sets the finalization-related timing values according to the configured defaults and moves the deal into the Active state.

### 3) Finalize a deal

Finalization completes the deal and pays the recipient. If the contract is configured to collect protocol fees, the fee is taken from the recipient payout and accounted for internally. After finalization, the deposit becomes zero and the deal is closed.

### 4) Expire a deal

If a required deadline has passed and the deal is still not completed, `expireDeal(dealId)` can be used to cancel it.  
On success, the contract refunds the sender, zeros the deposit, and emits a cancellation event.

## Dispute flow

Disputes are intended for deals that were activated but cannot be completed normally.

### Open a dispute

Either the sender or the recipient can call `openDispute(dealId, reason)`.  
The `reason` parameter is free-form text for recordkeeping. It does not change the decision logic by itself.

Opening a dispute moves the deal into a Disputed state and records who opened the claim and when it was opened. If `disputePeriod` is non-zero, a claim deadline is also recorded.

### Challenge a dispute (optional)

The other party can respond by calling `challengeDispute(dealId, reason)`.  
This records a challenge and is typically used to provide the opposing side’s statement on-chain.

### Resolve a dispute (resolver only)

Only the resolver can call `resolveDispute(dealId, mode, note, outcome, recipientBps)`.

The `outcome` determines how the escrowed ETH is distributed:
- RefundSender: returns the deposit to the sender.
- PayRecipient: pays the deposit to the recipient (minus any configured fee).
- Split: divides the deposit between recipient and sender using `recipientBps` basis points for the recipient share (0 to 10000).

The `note` field is a text explanation stored/emitted for auditability.  
After resolution, the deposit is set to zero and the deal is closed.

## What to verify after each action

- Check transaction status is successful.
- Check emitted events match the expected action (created, cancelled, dispute opened, dispute resolved).
- Check the deal record reflects the expected state and that the deposit becomes zero when funds are paid out or refunded.
