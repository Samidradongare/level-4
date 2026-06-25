# Local Development Setup Guide

Follow this guide to set up the **UsagePay** project locally on your machine.

---

## 📋 Prerequisites
Ensure you have the following software installed:
- **Node.js** (v18.0.0 or later, v24 recommended)
- **Rust & Cargo** (Required to compile the smart contract)
- **PostgreSQL** (Optional, falls back to in-memory simulated database if not active)
- **Git** (Required for version control and cloning)

---

## 🚀 Step-by-Step Setup

### Step 1: Clone and Enter the Project Root
Ensure you are in the project root directory:
```bash
cd "Usage pay"
```

### Step 2: Backend Server Setup
1. Navigate into the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create your local environment configuration file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and set up variables:
   - `DATABASE_URL`: Set this if you have a local PostgreSQL instance (e.g. `postgresql://postgres:postgres@localhost:5432/usagepay`).
   - `OPENAI_API_KEY`: Paste your OpenAI api secret key if you want real summaries (otherwise the server operates in simulated AI mode).
   - `JWT_SECRET`: Configure a secret for authentication tokens.

### Step 3: Database Preparation (PostgreSQL)
If you have PostgreSQL running, create the database:
```bash
# Using CLI
createdb usagepay

# Or manually in psql terminal
psql -U postgres
CREATE DATABASE usagepay;
```
*Note: The backend automatically migrates the database schema (creating users, transactions, usage logs, disputes tables) upon initial launch.*

### Step 4: Smart Contract Cargo Configuration (Rust)
Ensure Cargo and Rust are available on your system. Navigate to the contract folder, run tests to verify compilation:
```bash
cd ../contract
cargo test --release
```
To compile the contract to WASM format (needed for Stellar deployment):
```bash
# Add target targets if missing
rustup target add wasm32-unknown-unknown

# Compile WASM
cargo build --target wasm32-unknown-unknown --release
```

### Step 5: Frontend Web App Setup
1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
The frontend should now be running at `http://localhost:5173`.

---

## ⚡ Running Services Simultaneously

### Option A: Manual Terminals
Start the backend inside `backend/`:
```bash
npm run dev
```
Start the frontend inside `frontend/`:
```bash
npm run dev
```

### Option B: Automated Scripts (Bash/Git Bash/WSL)
In the root directory, configure executable privileges and run setup automation:
```bash
chmod +x scripts/setup-local.sh scripts/dev-all.sh

# Run local setup
./scripts/setup-local.sh

# Start both services parallelly
./scripts/dev-all.sh
```

---

## 🛠️ Troubleshooting

### 1. PostgreSQL connection issues
- **Symptom:** `PostgreSQL initialization failed` logged in backend console.
- **Solution:** Verify if the PostgreSQL service is active on your machine. If not running, the backend automatically boots using an **in-memory mock database**. You do not need to configure Postgres to test the project.

### 2. Freighter wallet not found
- **Symptom:** Warnings in frontend: `Freighter extension not found`.
- **Solution:** Ensure you are testing in a browser containing the Freighter extension. If you do not have Freighter installed, the app launches **Developer Simulator Mode** automatically, generating mock test keys.

### 3. Smart contract build failures
- **Symptom:** Target errors when compiling WASM.
- **Solution:** Verify rustup target is installed: `rustup target add wasm32-unknown-unknown`.
