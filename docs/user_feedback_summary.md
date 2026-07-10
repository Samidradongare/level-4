# Basic User Feedback Summary

During our beta testing phase, we onboarded 4 active test users who interacted with the **UsagePay** SmartNotes integration. We collected feedback via direct Discord interviews and anonymous feedback forms.

### Overall Sentiment
Users were highly enthusiastic about the "pay-as-you-go" micro-transaction model. Many noted that they preferred depositing a small amount of XLM rather than being forced into a $20/month subscription for a service they only use sporadically (like an AI study summarizer during exam week).

---

### Key Feedback & Insights

#### 1. What Users Loved (The Positives)
* **Micro-billing Transparency:** Users appreciated seeing the exact estimated cost in XLM before generating a summary.
* **Wallet Security:** Testers felt secure knowing that UsagePay uses smart contract escrows. They liked that they didn't have to provide credit card details.
* **Instant Refunding (Withdrawals):** One user explicitly highlighted how much they loved the ability to instantly withdraw their unused escrow balance back to their Freighter wallet. 

#### 2. Friction Points (The Challenges)
* **Manual Top-ups:** Initially, users found it annoying to have to constantly sign a new Freighter transaction every time their balance ran out. 
  * *Resolution:* This feedback directly led to the development of the **Auto-Topup Settings** feature, allowing users to pre-authorize automatic refills when their balance drops below a threshold.
* **Testnet Confusion:** Two users who had never used Stellar before were confused about how to get "Testnet XLM" to use the app.
  * *Resolution:* We implemented a "Simulated Wallet Mode" fallback so non-crypto users can still experience the UI without a browser extension.

#### 3. Feature Requests
* **Fiat On-Ramp:** "It would be great if I could fund my escrow using a credit card (via Stripe or MoonPay) but still have the backend settle in XLM."
* **Export Options:** Users want the ability to export the AI-generated study summaries directly to PDF or Notion.
* **Usage Caps:** A request for a "monthly hard cap" to ensure that auto-topup doesn't accidentally drain a wallet if they use the tool too much.

### Next Steps based on Feedback
- Integrate a fiat-to-crypto onramp for easier onboarding.
- Add PDF export functionality to the SmartNotes interface.
- Implement a safety "monthly spend limit" in the Auto-Topup smart contract logic.
