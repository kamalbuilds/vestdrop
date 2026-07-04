# VestDrop

Confidential distribution app for the Zama Developer Program Special Bounty Track with TokenOps.

VestDrop is a distribution cockpit for teams that need private airdrops, private batch payouts, and confidential vesting unlocks. The app uses TokenOps SDK to run preflight checks, register wallet pairs, and submit confidential disperse transactions on Sepolia.

## What judges can test

- Paste a recipient manifest.
- Select a distribution mode.
- Run a TokenOps preflight check.
- Register wallet pairs for wallet-mode disperse.
- Submit confidential payouts through TokenOps SDK.

## Stack

- React + Vite.
- `@tokenops/sdk` for preflight, registration, and confidential disperse.
- `@zama-fhe/relayer-sdk` as a browser encryptor adapter.
- Viem for public and wallet clients.

## Verify locally

```bash
npm install
npm run build
```
