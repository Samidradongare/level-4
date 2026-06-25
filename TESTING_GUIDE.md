# Testing Guide for UsagePay MVP

This guide outlines the procedures for executing unit tests, contract validations, integration scripts, and manual end-to-end checks for the **UsagePay** application.

---

## 🧪 Unit & Contract Tests

### 1. Smart Contract Tests (Rust)
The smart contract contains unit tests simulating deposits, service authorizations, billing debits, and rate limit failures.

Run tests using Cargo inside `contract/`:
```bash
cd contract
cargo test --release
```
**Expected Assertions:**
- `test_initialize_and_fund`: Verifies escrow deposits, balance adjustments, service authorizations, billing debits, and manual withdrawals work.
- `test_rate_limiting`: Verifies that exceeding the configured service per-minute rate limit throws a `Rate limit exceeded` panic.

---

## 🔗 Manual Integration & E2E Verification

To verify the integration between the Frontend (Freighter/React), Backend (Express), and Smart Contract (Soroban), follow this step-by-step E2E flow:

### 1. Cryptographic Wallet Authentication
1. Open the frontend client in your browser: `http://localhost:5173`.
2. Click **Connect Freighter Wallet**.
3. *If Freighter is installed:* Approve the browser extension login popup.
4. *If in developer simulator mode:* The app automatically logs you in using a mock Stellar address (e.g. `GA...`).
5. **Verify:** The dashboard displays your public address and indicates a successful wallet connection status.

### 2. Pre-Funding the Escrow Account
1. On the dashboard Balance Card, click **Add Funds**.
2. Select or enter a fund value (e.g. `10 XLM`).
3. Click **Sign & Deposit**.
4. **Verify:**
   - The balance updates on the UI.
   - A mock deposit transaction is recorded in the transaction ledger.
   - The database logs a new transaction record.

### 3. API Metered Billing (SmartNotes AI Summary)
1. Paste a raw document or transcript in the **SmartNotes AI Summarizer** textarea.
2. Select your summarization style (Balanced, Bulleted, or Detailed).
3. Click **Generate Study Summary**.
4. **Verify:**
   - A loading indicator displays during AI text processing.
   - The AI Summary outputs a clean markdown study guide.
   - The escrow balance decreases by the estimated summary cost (e.g. `0.5 XLM`).
   - The off-chain database registers a new log inside `usage_logs`.
   - The transaction history lists a new completed billing record.

### 4. Setting Auto-Topup Triggers
1. Navigate to the **Settings** panel.
2. Toggle **Enable Auto-Topup** on.
3. Configure a trigger threshold (e.g. `2 XLM`) and top-up amount (e.g. `5 XLM`).
4. Click **Save Settings**.
5. Go back to the dashboard, and perform notes summary requests until your balance falls below your trigger value (e.g. 2 XLM).
6. **Verify:** An automatic top-up gets triggered, transferring the top-up value (5 XLM) into the escrow, and updating your card balance.

### 5. Manual Balance Withdrawal
1. Navigate to the **Settings** panel.
2. Under **Withdraw Escrow Balance**, input a withdrawal amount.
3. Click **Refund XLM**.
4. **Verify:**
   - The contract balance decreases.
   - The transaction history records the refund.
   - The funds are transferred back to your wallet address.

---

## 📈 Performance & Load Verification

### 1. Simulated Load Testing
To check how the Express backend handles multiple concurrent note summary calls:
```bash
# Inside backend/ run mock load testing queries
npm run test
```

### 2. Database Slow Query Auditing
If using PostgreSQL, inspect query index efficiency and response times:
```sql
SELECT query, calls, total_exec_time, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

---

## 📱 Mobile & Usability Verification
- **Viewport scaling:** Verify layouts stack vertically when viewports shrink below `640px`.
- **Target sizes:** Ensure buttons have touch boundaries larger than `44px` to pass Lighthouse usability scoring.
- **Network limits:** Verify that the UI handles wallet network mismatches gracefully when Freighter is set to mainnet instead of testnet.
