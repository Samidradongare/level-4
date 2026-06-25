# Monitoring & Analytics Setup Guide

Follow this guide to configure error tracking via Sentry, audit database health, and view daily analytics metrics inside the **UsagePay** system.

---

## 🎛️ Sentry Error Tracking

Sentry is integrated on the backend to capture exceptions, compile execution alerts, and report operational errors.

### 1. Create Sentry Project
1. Log in or create an account at [Sentry.io](https://sentry.io).
2. Create a new Project: Select **Node.js** and **Express**.
3. Copy your project's **DSN string**. It typically takes this format:
   `https://xxxxx@xxxxx.ingest.sentry.io/xxxx`

### 2. Configure Environment Variable DSN
Paste the DSN key inside your `backend/.env` file:
```env
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxx
```
Restart your server to activate Sentry tracking.

---

## 📊 Analytics & Database Audits

Daily analytics statistics are compiled automatically by the background worker inside `scripts/setup-analytics.ts` and pushed to the `daily_analytics` table.

### 1. Exposing Metrics API
The metrics endpoint `/api/analytics/dashboard` returns system health logs:
- **`total_users`**: Total unique addresses registered.
- **`active_today`**: Estimated DAU metrics.
- **`total_volume`**: Cumulative XLM/stroop payment volume.
- **`average_transaction`**: Average transaction charges.
- **`disputes_pending`**: Active unresolved disputes count.

### 2. Manual SQL Audit Queries
Run these queries in your Postgres command shell to verify metrics details:

```sql
-- User registration totals
SELECT COUNT(*) as total_users FROM users;

-- Aggregate payment volume (completed debits)
SELECT SUM(amount_stroops) / 10000000.0 as total_xlm_volume 
FROM transactions 
WHERE status = 'completed';

-- Action failure ratios
SELECT status, COUNT(*) 
FROM transactions 
GROUP BY status;
```

---

## 📋 Monitoring Integration Checklist
Ensure all verification tasks are completed:
- [ ] Sentry account initialized and project configured.
- [ ] Environmental DSN key saved in `backend/.env`.
- [ ] Simulated exception triggered (e.g. testing invalid endpoint) to verify alert transmission to Sentry.
- [ ] Database daily metrics worker active (running hourly compile interval).
- [ ] Dashboard API queries tested.
