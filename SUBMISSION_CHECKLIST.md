# Builder Program Level 4 Submission Checklist

Verify that all of the following requirements are met before submitting the project:

---

## 💻 Repository & Source Code
- [ ] The GitHub repository is set to **Public** and visible.
- [ ] No private environmental credentials (API keys, secret keys) are committed (only `.env.example` templates exist).
- [ ] Complete documentation is written in the root [README.md](file:///c:/Users/Lenovo/Desktop/Usage%20pay/README.md).
- [ ] A valid open-source standard `LICENSE` file is present in the root folder.
- [ ] Git version logs indicate at least 15+ meaningful commits.

---

## 🔒 Smart Contract (Soroban)
- [ ] The Rust cargo test suite compiles and checks out successfully: `cargo test --release` inside `contract/`.
- [ ] The contract compiles to a release WASM target.
- [ ] The contract has been deployed successfully to the Stellar Testnet.
- [ ] The contract address is documented in the README.md and active `.env` configuration files.

---

## 🖥️ Backend Server (Express)
- [ ] All API routes (Auth signin, User balance, Usage summaries, Analytics) have been tested and return expected JSON payloads.
- [ ] JWT authentication tokens are parsed correctly on all protected route paths.
- [ ] Cryptographic signature verification is active (calling `Keypair.verify` to check Freighter logins).
- [ ] Database pools initialize database tables successfully, falling back to simulated memory schemas if port 5432 is inactive.
- [ ] Exception capture triggers (Winston, Sentry) are initialized.
- [ ] Periodic reconciliation timers verify off-chain transactions against on-chain ledger histories.

---

## 🎨 Frontend Client (React)
- [ ] The Vite development server launches without bundling or module resolution errors: `npm run dev` inside `frontend/`.
- [ ] Freighter wallet connections resolve balances and allow signing.
- [ ] All loading spinners, balance update indicators, and user-friendly error banners are implemented.
- [ ] Layout styling is fully responsive, stacked vertically on viewports `<640px` and touch targets are `>44px` to meet Lighthouse usability standards.

---

## 📡 Live Production Deployment
- [ ] The frontend app is live (deployed to Vercel/Netlify/etc.) via HTTPS.
- [ ] The backend API server is live (deployed to Railway/Render/etc.) via HTTPS.
- [ ] The database pool connects and runs tables schemas in production.
- [ ] Environmental settings (`VITE_API_URL`, `VITE_CONTRACT_ADDRESS`) are saved in production.

---

## 📈 Onboarding & Submission Packaging (Level 4 Requirement)
- [ ] **10+ real users** have connected wallets and funded escrows.
- [ ] **50+ total transactions** are recorded on the Stellar testnet ledger.
- [ ] User onboarding statistics have been compiled and exported to `USER_METRICS.csv`.
- [ ] Google Feedback Form survey scores are summarized (Average score > 3.5/5).
- [ ] **Demo Video URL (YouTube):** 5-10 minute video demonstrating Freighter connections, funding escrows, generating notes summaries, checking decreases, reviewing ledger explorer logs, and displaying mobile responsiveness.
