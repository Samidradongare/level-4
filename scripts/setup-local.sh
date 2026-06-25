#!/bin/bash
# Automated local development setup for UsagePay

set -e

echo "=== Starting UsagePay Local Setup ==="

# Check prerequisites
check_prerequisites() {
  echo "Checking tool requirements..."
  command -v node >/dev/null || { echo "❌ Error: Node.js required but not found in PATH."; exit 1; }
  command -v npm >/dev/null || { echo "❌ Error: npm required but not found in PATH."; exit 1; }
  
  if command -v cargo >/dev/null; then
    echo "✅ Rust/Cargo detected."
  else
    echo "⚠️ Warning: Cargo not found. Contract compilation and testing will be bypassed."
  fi
}

# Setup database (PostgreSQL)
setup_database() {
  if command -v createdb >/dev/null; then
    echo "Creating PostgreSQL database 'usagepay' if not existing..."
    createdb usagepay || true
  else
    echo "⚠️ Warning: 'createdb' utility not found. Will skip manual DB creation (backend can auto-migrate or mock)."
  fi
}

# Setup backend
setup_backend() {
  echo "Setting up Backend server..."
  cd backend
  npm install
  if [ ! -f .env ]; then
    cp .env.example .env
    echo "Generated backend/.env file. Please review and fill out API credentials."
  fi
  cd ..
}

# Setup frontend
setup_frontend() {
  echo "Setting up Frontend web app..."
  cd frontend
  npm install
  cd ..
}

# Setup contract
setup_contract() {
  if command -v cargo >/dev/null; then
    echo "Running Smart Contract compilation & tests..."
    cd contract
    cargo test --release
    cd ..
  fi
}

# Run all setup
check_prerequisites
setup_database
setup_backend
setup_frontend
setup_contract

echo "============================================="
echo "✅ UsagePay Local Development setup complete!"
echo "============================================="
echo "Next steps:"
echo "1. Verify backend/.env and frontend configurations."
echo "2. Run: ./scripts/dev-all.sh (from project root to launch all dev servers)."
echo "============================================="
