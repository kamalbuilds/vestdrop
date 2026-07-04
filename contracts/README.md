# Smart contract surface

VestDrop uses TokenOps deployed contracts through `@tokenops/sdk`.

The app integrates these contract products:

- Confidential airdrop factory for recipient-bound claim authorization.
- Confidential disperse singleton for private batched payouts.
- Confidential vesting managers for encrypted unlock schedules.
- ERC-7984 confidential tokens on Zama Sepolia.

The integration code lives in `src/lib/tokenops.ts` and uses TokenOps SDK clients for preflight, registration, and confidential disperse writes.
