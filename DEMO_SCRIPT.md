# YouTube Demo Video Script

Use this voice-over script, timing outline, and action guide to record your **5-10 minute** YouTube demonstration video for the Stellar Builder Program.

---

## ⏱️ Video Outline & Script

### 1. Introduction [0:00 - 1:00]
- **Visual Action:** Display the UsagePay homepage (`https://usagepay.vercel.app`). Hover cursor over the headline cards.
- **Voice-over Script:**
  > "Hi everyone, I'm [Your Name]. Today I am demonstrating UsagePay, a production-grade metered payment gateway built on the Stellar testnet using Soroban smart contracts.
  > 
  > Monthly subscriptions are overkill for services users only call occasionally, and card processing fees make micro-payments impossible.
  > UsagePay solves this with a secure escrow contract where users pre-fund balances and pay strictly per-action.
  > Let's look at how this works in our showcase integration, SmartNotes, which is an AI study note summarizer."

### 2. Freighter Wallet Connection [1:00 - 2:00]
- **Visual Action:** Click the **Connect Freighter Wallet** button. If using the extension, show the signing popup and confirm. If in simulated mode, show the mock address generator card.
- **Voice-over Script:**
  > "First, we connect our Stellar Freighter wallet. Freighter injects cryptographically signed permissions which our Node.js Express server verifies, issuing a secure JWT token without ever exposing the user's private key.
  > As you can see, our wallet address is connected, and we can review our balance card."

### 3. Funding the Escrow Balance [2:00 - 3:15]
- **Visual Action:** Click the **Add Funds** button. Select **10 XLM**. Click **Sign & Deposit**. Wait for transaction confirmation. When updated, click the generated explorer link.
- **Voice-over Script:**
  > "Let's fund our account with 10 XLM. This transaction builds a Soroban envelope calling 'fund_account' to lock funds into the contract escrow.
  > We approve the Freighter signature popup.
  > In a few seconds, our contract balance updates to 10 XLM.
  > Let's click the transaction hash. This redirects us to Stellar Expert Testnet explorer, confirming the deposit is finalized on-chain."

### 4. SmartNotes AI Summarization & Metered Billing [3:15 - 5:30]
- **Visual Action:** Paste raw study notes into the textarea. Select **Balanced** profile. Click **Generate Study Summary**. Wait for markdown summary. Show cost calculation and balance decrease. Repeat the note generation 2 times.
- **Voice-over Script:**
  > "Now let's use the SmartNotes AI notes processor. I will paste some raw, messy study notes here.
  > Our billing rates compute costs dynamically depending on note sizes. This 1,000-character transcript costs 0.5 XLM.
  > Click 'Generate Study Summary'.
  > Behind the scenes, the server requests summaries from OpenAI, calls the 'debit' contract method signed by the service key, deducts the cost, and logs the transactions off-chain.
  > The summary is rendered in markdown, and our balance decreases by 0.5 XLM.
  > Let's submit a second and third note request to generate more billing logs."

### 5. Reviewing Analytics & Explorer Logs [5:30 - 7:00]
- **Visual Action:** Click the **Analytics Dashboard** SVG chart. Hover over bar logs. Scroll down to review the transaction history ledger.
- **Voice-over Script:**
  > "All billing debits are recorded in our off-chain database and synced with on-chain Soroban receipts.
  > On the Analytics view, we can track our usage by day using this responsive SVG chart, and review the ledger transaction log.
  > Each debit has a clickable transaction signature hash, allowing auditable payment tracing on Stellar Testnet."

### 6. Mobile Responsiveness & Closing [7:00 - 8:00]
- **Visual Action:** Resize browser viewport to mobile dimensions. Tap navigation icons. Point out single-column adjustments.
- **Voice-over Script:**
  > "UsagePay is designed mobile-first. Resizing the browser shows the layout stacking into a vertical viewport, with touch-friendly elements.
  > UsagePay demonstrates that building low-cost, fast micro-payments on Stellar is production-ready.
  > Thanks for watching! The repository is open-source, and you can try the app at our live deployment URL."

---

## 📹 Recording Best Practices
- **Audio Clarity:** Use a dedicated headset microphone. Record in a quiet room with minimal echo.
- **Resolution:** Record at a minimum of `1080p` at `30fps` or `60fps`.
- **Flow:** Walk through the features in real-time. Avoid editing together fragmented clips, as reviewers prefer continuous E2E demonstrations.
- **Hosting:** Upload the video to YouTube as **Unlisted** or **Public**. Save the link in your final `SUBMISSION.md` file.
