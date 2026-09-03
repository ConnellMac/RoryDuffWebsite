# Initial workload ownership

No provider integration is implemented in Phase 1.

| Responsibility       | Recommended initial owner                     |
| -------------------- | --------------------------------------------- |
| Stripe webhooks      | Next.js route handler on Vercel               |
| Scheduled releases   | Scheduled Firebase Cloud Function             |
| Email jobs           | Firebase Cloud Function; Resend only delivers |
| Weather retrieval    | Next.js server endpoint with Firestore cache  |
| Admin/server actions | Next.js server actions or route handlers      |

Each workload must have one owner and one idempotency store. Shared domain interfaces keep placement reversible. Any genuine conflict requires a documented architecture decision before changing this ownership.
