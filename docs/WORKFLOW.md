# Distribution workflow

1. Choose an ERC-7984 token.
2. Paste a recipient manifest as `address,amount` rows.
3. Run TokenOps preflight to catch registration, approval, fee, and batch blockers.
4. Register a wallet pair for wallet-mode confidential disperse if needed.
5. Submit the confidential disperse transaction.
6. Recipients verify balances through their wallet decryption flow.

Airdrop and vesting are product modes in the UI because the same manifest and recipient room apply to claim campaigns and long-running unlocks.
