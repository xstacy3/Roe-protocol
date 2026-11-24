
# ROE Protocol

### Decentralized Education. Transparent Revenue. Powered by Solana.

ROE Protocol is a decentralized educational marketplace infrastructure developed by The Roe Vault for its CAVIAR MINDSET™ education platform.

## The Problem

Educational creators face centralized payment systems, opaque revenue distribution, delayed payouts, and limited financial transparency.

## Our Solution

ROE Protocol uses Solana smart contracts to automate revenue sharing between educational experts and The Roe Vault.

Our platform focuses on three educational pillars:

- Money
- Mindset
- Wellness

## Revenue Model

Every successful purchase automatically distributes:

- 70% to the educational expert
- 30% to The Roe Vault

Payments are distributed directly through the smart contract.

## Implemented Features

- On-chain educational product registration
- Native SOL payments
- Official USDC payments
- Automated revenue distribution
- On-chain purchase receipts
- Product sales tracking
- Duplicate purchase prevention
- Expert payment redirection protection
- Treasury payment redirection protection
- Unofficial token registration rejection

## Technology Stack

- Solana Blockchain
- Rust
- Anchor Framework
- TypeScript
- Solana Web3.js
- SPL Token Program
- USDC
- Solana Playground

## Deployment

Network: Solana Devnet

Program ID:

AgLgRNkHxgryW1c254Fm1X7Jo9FnuL9C3KeDCCZbihdb

Official Devnet USDC Mint:

4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

## Verified Transactions

Official USDC payment:

https://explorer.solana.com/tx/2csLmcaP6NqsVzMcofhqx6ZUmpr61v3JZnPiyNESLRR8DBayqfj3k16dKh1Yo1KpFk2pgFVDc2sxViLvvR67hHxQ?cluster=devnet

## Security Testing

Three test suites successfully passed on Solana Devnet.

- SOL revenue sharing and security
- Unofficial mint rejection
- Official USDC revenue sharing and security

Verified USDC purchase:

| Recipient | Amount |
|-----------|--------|
| Expert | 0.70 USDC |
| Roe Vault | 0.30 USDC |
| Total | 1.00 USDC |

## Development Setup

1. Open https://beta.solpg.io/
2. Create an Anchor project.
3. Copy the Rust program from programs/roe_protocol/src/lib.rs.
4. Copy the TypeScript files from the tests directory.
5. Connect to Solana Devnet.
6. Fund your development wallet with test SOL and test USDC.
7. Build the program.

The current deployment and tests use the designated Roe Vault development wallet as treasury. Independent deployments require updating the treasury address and program ID, rebuilding, and deploying with your own authorized wallet.

The tests currently use Solana Playground's development environment.

## Roadmap

- [x] Rust smart contract
- [x] Solana Devnet deployment
- [x] SOL payments
- [x] Official USDC integration
- [x] Automated revenue sharing
- [x] Core payment security testing
- [ ] Marketplace frontend
- [ ] Wallet integration
- [ ] Educational content access
- [ ] Expert dashboard
- [ ] Live demonstration
- [ ] Production security audit

## Vision

To build a transparent educational economy where experts can monetize their knowledge and learners can access valuable educational content.

## Current Status

ROE Protocol V4 is a functional payment prototype deployed on Solana Devnet.

Content licensing and access enforcement are not yet implemented. The protocol has not undergone an independent security audit and is not intended for real-money transactions.

## License

MIT License

Built by The Roe Vault.

CAVIAR MINDSET™
