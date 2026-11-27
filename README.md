
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
## Shopify Integration — Verified Devnet Checkout

On November 24, 2026, ROE Protocol successfully processed a 1 USDC test purchase through The Roe Vault's Shopify development theme.

- Expert received: 0.70 USDC (70%)
- Roe Vault received: 0.30 USDC (30%)
- Transaction fee: 0.00008 SOL
- Network: Solana Devnet
- Status: Finalized

[Verify on Solana Explorer](https://explorer.solana.com/tx/4ciPPmgvPyBCxwwnfVyhGjjruWbQeSW1q1wMmjSCyocks8fxs15fRsJ6boRRt1akVhk7tdZBzmPw3jFMj4GRZfmH?cluster=devnet)

The Shopify development theme remains unpublished. All payments use test tokens.
## ROE Protocol V5 — On-Chain Certificates

Developed during the DEV3PACK Solana Hackathon on November 27, 2026.

ROE Protocol V5 introduces blockchain-verifiable educational certificates for CAVIAR MINDSET™.

### Implemented Features

- Authorized expert certificate issuance
- On-chain student purchase eligibility verification
- Non-transferable certificate records
- Public certificate verification
- Duplicate certificate prevention
- Authorized certificate revocation
- Protection against unauthorized issuance and revocation

### Verified Devnet Transactions

[Certificate Issuance](https://explorer.solana.com/tx/GHZu56eK1aA9KWs8Cf4qWZfnUnvGCuopmbhPJzucShJiacGoeEmisEDqVLPaHJxbCfE54NjDdpVn8k8JovwrxPb?cluster=devnet)

[Certificate Revocation](https://explorer.solana.com/tx/3V2VGjUjWCW4ekQiEFgAEiDRNe19rUEUX5otxUpZFAo94chHPJJyGRpYKNDv85t7mswew3KBigJeni3V57nnxQu4?cluster=devnet)

### Testing Results

All four test suites and seven certificate checks passed.

### Current Limitations

Certificate eligibility currently requires an official USDC purchase receipt. Program completion is attested by the authorized expert.

NFT-holder eligibility, CAVIAR EMPIRE™ integration and production security auditing remain future development milestones.
