# UsagePay MVP

UsagePay is a production-ready metered payment dApp built on the Stellar testnet. It introduces a pay-as-you-go billing model using a secure Soroban smart contract escrow. The primary showcase use case is **SmartNotes** (an AI study summarizer) where users pre-fund an escrow account in XLM, and are billed automatically per summary generated based on note character count.

### 🌐 Live Links & Demo
- **Live Application:** https://level-4-639v.vercel.app/
- **API Server:** https://usagepay-backend.onrender.com
- **Soroban Contract Address:** `CA75UOY4D6I55OETD6Y6ZPXNGL2WCS5WJYYA3R3F5OZHMXL3F4DLUZPP`
- **Demo Video:** https://youtu.be/W6v58TUsITc?si=luFA9Yl6ZrnGwghf

## 📸 Application Screenshots

| **Product UI** |
|:---:|
| ![Product UI](https://github.com/Samidradongare/level-4/blob/80371c265eecf96e469dc05933b3c9baf938dc1e/Screenshot%202026-07-11%20001232.png) |

| **Mobile Responsive Design** |
|:---:|
| ![Mobile Design](https://github.com/Samidradongare/level-4/blob/45dc8a86060960c01b54b0fcadfea4303727aaef/Screenshot%202026-07-11%20002528.png) |

| **Analytics & Monitoring Dashboard** |
|:---:|
| ![Analytics Dashboard](https://github.com/Samidradongare/level-4/blob/f5f956b50b48b218c11909f78507ee6e6bef669b/Screenshot%202026-07-11%20001403.png) |

> ⚠️ **Note:** Screenshots above show the app running in simulated wallet mode. Replace with live production screenshots after deployment.


## ⚡ Key Features
1. **On-Chain Escrow Accounts:** Secure deposits held by the `UsagePayContract` on-chain.
2. **Metered Service Debits:** Services charge client balances directly using delegated authorization signatures.
3. **Fixed Window Rate Limiting:** Built-in fixed-window billing limit checks inside Soroban storage keys to block transaction flood attempts.
4. **Auto-Topup Triggers:** Seamless client-side settings to trigger automated refills when balance thresholds fall below triggers.
5. **Hourly Reconciliation Engine:** Back-end worker analyzing off-chain usage logs against on-chain ledger events to capture amount mismatches.
6. **Zero-Configuration Simulated Mode:** Out-of-the-box local testing capabilities. If a Postgres database, Stellar contract, or OpenAI key is not configured, the services dynamically fall back to in-memory databases and simulated AI text processors.

---

## 🛠️ Tech Stack & Structure
- **Smart Contract:** Soroban (Rust), cargo test environment
- **Backend:** Node.js, Express, TypeScript, PostgreSQL (via connection pooling), Winston structured logger
- **Frontend:** React, Vite, TypeScript, Freighter Wallet, Glassmorphism UI, Mobile Responsive Design, HSL Variable Theming, SVG responsive charts

---

## 📂 Repository Structure
```
UsagePay/
├── contract/             # Soroban Smart Contract (Rust)
│   ├── Cargo.toml        # Cargo dependencies
│   └── src/
│       ├── lib.rs        # Core contract implementation
│       └── test.rs       # Contract unit tests
├── backend/              # Node.js + Express Server (TypeScript)
│   ├── src/
│   │   ├── config/       # Postgres & Stellar configurations
│   │   ├── controllers/  # Route controllers (Auth, User, Usage, Analytics)
│   │   ├── middleware/   # JWT and Freighter verify signature middlewares
│   │   ├── models/       # Postgres model queries (User, Transaction, etc.)
│   │   ├── services/     # AI note summaries & Soroban RPC integrations
│   │   └── index.ts      # Server entry point
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
└── frontend/             # React App (Vite + TypeScript)
    ├── src/
    │   ├── components/   # Modals, sliders, cards, and SVG charts
    │   ├── context/      # AuthContext managing freighter logs and JWTs
    │   ├── hooks/        # react hooks (useAuth, useBalance, etc.)
    │   ├── pages/        # Home landing, Dashboard grids, and Settings
    │   ├── styles/       # variables.css and glassmorphism global.css
    │   └── main.tsx
    ├── vite.config.ts
    ├── index.html
    └── package.json
```

---

## 🚀 Setup & Execution Guide

### 1. Smart Contract Compilation (Optional)
If Rust/Cargo is configured, run tests inside `contract/`:
```bash
cd contract
cargo test
```
To compile WebAssembly contracts:
```bash
stellar contract build
```

### 2. Backend Server Launch
Go to `backend/`, copy template, install and run:
```bash
cd backend
npm install
npm run dev
```
*Note: If no PostgreSQL database is running, the backend logs a connection warning and falls back to a memory-based simulated database store.*

### 3. Frontend Web Client Launch
Go to `frontend/`, install dependencies, and run Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to interact with the dApp.
*Note: If the Freighter browser extension is missing, the frontend automatically falls back to simulated wallet mode, generating a mock keypair to allow testing the dashboard features.*

---

## 📡 Key API Endpoints

### Authentication
- `POST /api/auth/signin`
  - **Body:** `{ wallet_address, message, signature }`
  - **Returns:** `{ token, user, balance_stroops }`
- `POST /api/auth/logout`
  - **Returns:** `{ success: true }`

### User Profiles
- `GET /api/user/profile` -> Fetches user profiles
- `GET /api/user/balance` -> Live Soroban balance check
- `POST /api/user/fund` -> Deposits XLM into escrow (simulates mock funding)
- `POST /api/user/withdraw` -> Withdraws XLM out of contract escrow
- `POST /api/user/settings/auto-topup` -> Configure triggering thresholds

### AI Note Summarizer
- `POST /api/usage/smartnotes/generate`
  - **Body:** `{ notes_text, style }`
  - **Returns:** `{ summary, cost_stroops, remaining_balance_stroops }`

### System Analytics
- `GET /api/analytics/user-usage` -> Daily counts and cost charts
- `GET /api/analytics/ledger` -> Ledger transaction list
- `GET /api/analytics/dashboard` -> Aggregated statistics summary
