import { useState } from "react";
import { WalletButton } from "../components/WalletButton";
import { WalletState } from "../lib/wallet";
import { createTokenOpsDisperseClient, parseManifest, TOKENOPS_DEFAULT_TOKEN } from "../lib/tokenops";

const sampleRows = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e,1250\n0x8ba1f109551bD432803012645Ac136c22C177ec,750";

export function VestDrop() {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [mode, setMode] = useState<"airdrop" | "disperse" | "vesting">("airdrop");
  const [rows, setRows] = useState(sampleRows);
  const [status, setStatus] = useState("Choose a distribution mode, paste recipients, then run the TokenOps flow.");
  const [token, setToken] = useState<string>(TOKENOPS_DEFAULT_TOKEN);

  const parsed = rows.split("\n").map((row) => row.trim()).filter(Boolean).map((row) => {
    const [address, amount] = row.split(",").map((part) => part.trim());
    return { address, amount };
  });

  async function runPreflight() {
    if (!wallet) return;
    try {
      const manifest = parseManifest(rows);
      const client = await createTokenOpsDisperseClient(wallet.address as `0x${string}`);
      const report = await client.preflightDisperse({
        user: wallet.address as `0x${string}`,
        token: token as `0x${string}`,
        recipients: manifest.map((row) => row.address),
        amounts: manifest.map((row) => row.amount),
        mode: "wallet",
      });
      setStatus(report.ready ? "TokenOps preflight ready. You can register wallets or disperse." : report.blockerErrors.map((error) => error.message).join(" "));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "TokenOps preflight failed.");
    }
  }

  async function registerWallets() {
    if (!wallet) return;
    try {
      const client = await createTokenOpsDisperseClient(wallet.address as `0x${string}`);
      const result = await client.register({ token: token as `0x${string}`, account: wallet.address as `0x${string}` });
      setStatus(`Registered TokenOps wallet pair in ${result.hash}.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "TokenOps registration failed.");
    }
  }

  async function disperse() {
    if (!wallet) return;
    try {
      const manifest = parseManifest(rows);
      const client = await createTokenOpsDisperseClient(wallet.address as `0x${string}`);
      const result = await client.disperse({
        token: token as `0x${string}`,
        mode: "wallet",
        recipients: manifest.map((row) => row.address),
        amounts: manifest.map((row) => row.amount),
        account: wallet.address as `0x${string}`,
      });
      setStatus(`Confidential disperse submitted in ${result.hash}.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "TokenOps disperse failed.");
    }
  }

  return (
    <section className="page-section stack">
      <div className="split-hero"><div><p className="label">Special Bounty Track</p><h1>Private allocations without spreadsheet leaks.</h1><p className="lede">VestDrop wraps TokenOps flows into a distribution room for investor unlocks, team payouts, and community rewards.</p></div><WalletButton onConnect={setWallet} /></div>
      <div className="workbench two-col">
        <div className="glass-card"><h2>Distribution mode</h2><div className="segmented"><button className={mode === "airdrop" ? "active" : ""} onClick={() => setMode("airdrop")}>Airdrop</button><button className={mode === "disperse" ? "active" : ""} onClick={() => setMode("disperse")}>Disperse</button><button className={mode === "vesting" ? "active" : ""} onClick={() => setMode("vesting")}>Vesting</button></div><p className="muted">Airdrop signs claim authorizations. Disperse batches private payouts. Vesting creates recipient schedules with confidential amounts.</p></div>
        <div className="glass-card"><h2>Recipient manifest</h2><label>ERC-7984 token<input value={token} onChange={(e) => setToken(e.target.value)} /></label><textarea value={rows} onChange={(e) => setRows(e.target.value)} rows={8} /><div className="button-row"><button className="button secondary" onClick={runPreflight} disabled={!wallet}>Run preflight</button><button className="button secondary" onClick={registerWallets} disabled={!wallet}>Register wallets</button><button className="button primary" onClick={disperse} disabled={!wallet || mode !== "disperse"}>Disperse privately</button></div><p className="status-line">{status}</p></div>
      </div>
      <div className="card-grid three">{parsed.map((row) => <div className="glass-card" key={row.address}><h3>{row.address.slice(0, 6)}...{row.address.slice(-4)}</h3><p className="stat-number">sealed</p><p className="muted">Recipient decrypts allocation after authorization.</p></div>)}</div>
      <div className="glass-card"><h2>TokenOps integration points</h2><p className="muted">The production path uses @tokenops/sdk/fhe-airdrop for claim campaigns, @tokenops/sdk/fhe-disperse for bulk payouts, and @tokenops/sdk/fhe-vesting for long-running unlocks. The UI keeps public metadata separate from encrypted amounts and recipient proofs.</p></div>
    </section>
  );
}
