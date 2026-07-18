# UsagePay - Stellar Builder Program Submission

---

## ⚡ Project Overview
UsagePay is a production-ready metered payment gateway built on the Stellar testnet, utilizing Soroban smart contracts. It enables fair, transparent, pay-as-you-go billing for API integrations. The primary showcase use case is **SmartNotes** (an AI study note summarizer) which demonstrates pay-per-request billing based on Note character sizes.

- **The Problem:** Subscriptions are overkill for occasional API services, while traditional fiat card processing fees eat micro-payments.
- **The Solution:** A secure on-chain contract escrow where users pre-fund balances, and services debit payments per-action.
- **Target Audience:** Digital service creators, API builders, students, and developer teams.

---

## 🔗 Live Production Links

| Component | Target URL |
|---|---|
| **Frontend Web App** | https://level-4-639v.vercel.app/ |
| **API Backend Server** | https://usagepay-backend.onrender.com |
| **Soroban Contract Address** | `CA75UOY4D6I55OETD6Y6ZPXNGL2WCS5WJYYA3R3F5OZHMXL3F4DLUZPP` |
| **Demo Video (YouTube)** | https://youtu.be/W6v58TUsITc?si=luFA9Yl6ZrnGwghf |
| **CI/CD Workflow** | [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) |
| **GitHub Repository** | https://github.com/Samidradongare/level-4 |

---

## 📸 Application Screenshots

| **Product UI** | **Mobile Responsive Design** |
|:---:|:---:|
| ![Product UI](./screenshots/product_ui.png) | ![Mobile Design](./screenshots/mobile_design.png) |

| **Analytics & Monitoring Dashboard** |
|:---:|
| ![Analytics Dashboard](./screenshots/analytics_dashboard.png) |

---

## 📐 Technical Architecture & Components

### 1. Smart Contract (Soroban / Rust)
- Escrow deposits (`fund_account`) and balance deductions (`debit`).
- Service delegate authorizations (`authorize_service`).
- Internal Fixed-Window rate limit auditing to prevent denial-of-service billing attacks.
- Balance refunds (`withdraw`) back to wallets.

### 2. Express API Backend (Node.js / TypeScript)
- Cryptographic Freighter signature verification logins.
- OpenAI GPT model summarizations.
- Database auditing via PostgreSQL (falling back to local memory simulation for development).
- Periodic reconciliation syncing on-chain contract receipts with off-chain DB logs.
- Error aggregations (Sentry) and metrics compilers.

### 3. Web Client (React + Vite)
- Injected Freighter wallet logins.
- Real-time balance updating panels.
- Markdown summary compiler and text editors.
- Custom SVG usage analytics tracking charts.

---

## 📊 User Onboarding Proof (Level 4 Requirement)
- **Total Registered Beta-Users:** 12 (registered testnet wallet addresses)
- **Total Ledger Transactions:** 67 completed actions
- **Cumulative Volume Processed:** ~21.64 XLM
- **Average User Survey Rating:** 4.2 / 5 stars

*All user transaction records are exported in:*
- [USER_METRICS.csv](USER_METRICS.csv) — wallet-level spending summary
- [USER_PROOF.csv](USER_PROOF.csv) — named users, TX hashes, onboarding dates, feedback scores
- [docs/user_feedback_summary.md](docs/user_feedback_summary.md) — individual quotes from all 12 users
- [docs/wallet_interactions_proof.md](docs/wallet_interactions_proof.md) — ledger TX log with 12 unique wallets

---

## 🧠 User Feedback Summary
Based on survey responses compiled from our feedback questionnaire (12 users):
- **Onboarding Simplicity:** 91% rated connecting Freighter and funding escrows as "Very Easy".
- **Pricing Clarity:** 100% of testers found pay-per-action billing fairer than standard monthly subscriptions.
- **Top Request Features:** Faster text summary compile times, multi-file PDF support, mainnet USDC support, fiat on-ramp.
- **Improvements shipped from feedback:** XLM→USD display, Auto-Topup feature, Simulated Wallet Mode, Onboarding Guide.

See full individual user feedback in [docs/user_feedback_summary.md](docs/user_feedback_summary.md).

---

## ⚙️ CI/CD Pipeline
A complete GitHub Actions CI/CD pipeline is configured at [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml):
- **Smart Contract CI:** Installs Rust + wasm32 target, runs `cargo test`, builds WASM with `stellar contract build`
- **Backend CI:** Node.js 20, TypeScript type-check, ESLint
- **Frontend CI:** Node.js 20, TypeScript type-check, Vite production build
- **Frontend CD:** Vercel CLI production deploy (on `main` push)
- **Backend CD:** Render API webhook deployment trigger (on `main` push)
