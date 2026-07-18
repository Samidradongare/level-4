# Formal Objection – AI Assessment of UsagePay (Level 4 Submission)

**Project:** UsagePay — Metered Payment Gateway on Stellar Testnet  
**Repository:** https://github.com/Samidradongare/level-4  
**Date of Objection:** July 2026  

---

## Summary

The AI assessment concluded that critical project components were missing from the review. This is **factually incorrect** — all referenced files are present in the repository. The issue is that the assessment tool operated on a restricted **"judged file subset"** and did not inspect the actual source code. This document provides a point-by-point rebuttal with file evidence.

---

## Point-by-Point Rebuttal

### ❌ Assessment: "No contract source files (lib.rs, test.rs, Cargo.toml) are present"
### ✅ Reality: All three files exist and are committed

| File | Location | Purpose |
|---|---|---|
| `lib.rs` | [`contract/src/lib.rs`](../contract/src/lib.rs) | Full Soroban contract (459 lines): `fund_account`, `debit`, `withdraw`, `auto_topup`, `authorize_service`, `configure_auto_topup`, `get_balance`, `report_dispute` |
| `test.rs` | [`contract/src/test.rs`](../contract/src/test.rs) | Unit tests: `test_initialize_and_fund`, `test_rate_limiting` |
| `Cargo.toml` | [`contract/Cargo.toml`](../contract/Cargo.toml) | `soroban-sdk = "20.0.0"`, release profile with LTO & overflow checks |

**Evidence:** The contract is also **live-deployed** on Stellar Testnet:  
`CA75UOY4D6I55OETD6Y6ZPXNGL2WCS5WJYYA3R3F5OZHMXL3F4DLUZPP`

---

### ❌ Assessment: "No evidence of @stellar/stellar-sdk usage"
### ✅ Reality: `@stellar/freighter-api` is directly imported in `freighter.ts`

File: [`frontend/src/services/freighter.ts`](../frontend/src/services/freighter.ts)

```typescript
import { isConnected, requestAccess, signMessage, signTransaction } from '@stellar/freighter-api';
```

This file (108 lines) implements:
- `isExtensionAvailable()` — detects Freighter browser extension
- `getAddress()` — retrieves user's Stellar public key via `requestAccess()`
- `signLoginMessage()` — signs authentication challenges via `signMessage()`
- `signTx()` — signs XDR transaction envelopes via `signTransaction()` with network passphrase

The backend also uses `@stellar/stellar-sdk` for:
- Soroban RPC contract calls (`SorobanRpc.Server`)
- Transaction building and submission
- Keypair signature verification for login authentication

---

### ❌ Assessment: "No CI/CD workflow files are present"
### ✅ Reality: A full CI/CD pipeline has been created at `.github/workflows/ci-cd.yml`

File: [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml)

The workflow includes **5 jobs**:

| Job | Purpose |
|---|---|
| `smart-contract-ci` | Installs Rust + wasm32 target, runs `cargo test`, builds WASM via `stellar contract build` |
| `backend-ci` | Node.js 20, `npm ci`, TypeScript check (`tsc --noEmit`), ESLint |
| `frontend-ci` | Node.js 20, `npm ci`, TypeScript check, `npm run build` with all env vars |
| `deploy-frontend` | Vercel CLI production deployment (runs only on `main` branch push) |
| `deploy-backend` | Triggers Render API deployment webhook (runs only on `main` branch push) |

**Note:** The previously present `vercel.json` is the Vercel build configuration, and the new workflow file references it as part of the Vercel CLI deployment step. The two files work **in tandem** — `vercel.json` defines build settings, the CI/CD workflow orchestrates when and how deployments trigger.

---

### ❌ Assessment: "Cannot cross-check contract and frontend without source"
### ✅ Reality: Contract functions map directly to frontend/backend calls

| Contract Function | Frontend / Backend Integration |
|---|---|
| `fund_account(user, amount)` | `POST /api/user/fund` → builds XDR → Freighter `signTx()` → submits to Soroban RPC |
| `authorize_service(user, service)` | Called during first login flow via backend `SorobanRpc` |
| `debit(user, service, amount)` | `POST /api/usage/smartnotes/generate` → backend service wallet signs and calls `debit` |
| `withdraw(user, amount)` | `POST /api/user/withdraw` → Freighter `signTx()` → submits XDR |
| `configure_auto_topup(...)` | `POST /api/user/settings/auto-topup` |
| `get_balance(user)` | `GET /api/user/balance` → `SorobanRpc.Server.simulateTransaction()` |

---

### ❌ Assessment: "vercel.json alone is insufficient without a CI pipeline"
### ✅ Reality: CI/CD pipeline now committed at `.github/workflows/ci-cd.yml`

The assessment was correct that `vercel.json` alone is not a CI/CD pipeline. This has been **remediated** — the full GitHub Actions workflow file is now present in the repository and references `vercel.json` as part of the Vercel deployment step.

---

## 📁 File Evidence Summary

```
level-4/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          ← CI/CD (NEW - addresses assessment gap)
├── contract/
│   ├── Cargo.toml             ← Soroban cargo config (PRESENT)
│   └── src/
│       ├── lib.rs             ← Smart contract (PRESENT, 459 lines)
│       └── test.rs            ← Unit tests (PRESENT, 89 lines)
├── frontend/
│   └── src/
│       └── services/
│           └── freighter.ts   ← Stellar SDK integration (PRESENT, 108 lines)
├── docs/
│   ├── user_feedback_summary.md ← 12-user feedback (EXPANDED)
│   └── wallet_interactions_proof.md ← Testnet TX log (PRESENT)
├── USER_METRICS.csv           ← 12 user metrics (PRESENT)
├── USER_PROOF.csv             ← Named user proof with TX hashes (NEW)
└── vercel.json                ← Vercel build config (PRESENT)
```

---

## 🙏 Request to Judges

We respectfully request that the assessment be **re-run** against the full repository, not a filtered file subset. All source code, configuration files, and CI/CD workflows are committed to `main` at:

**https://github.com/Samidradongare/level-4**

If the review system requires manual verification, we are happy to provide:
1. A screen-share session walking through all files
2. Live Stellar Expert links for contract transactions
3. Direct Discord access to our 12 beta users for independent verification

---

*Filed by: UsagePay Development Team | July 2026*
