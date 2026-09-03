# Security plan

## Objectives

- Prevent access to paid, cohort-scoped, administrative, and private data without authorization.
- Ensure billing state cannot be forged by a client.
- Limit impact if an account, credential, provider, or application component is compromised.
- Protect member privacy while retaining enough operational evidence to support the service.

## Threat model priorities

- Forged or stale paid entitlement.
- Broken object-level authorization across cohorts, discussions, progress, or notes.
- Privilege escalation into admin/editor capabilities.
- Leaked protected media URLs or overly broad Firebase Storage rules.
- Stripe webhook spoofing, replay, duplication, or out-of-order events.
- Stored cross-site scripting from migrated/editor/member content.
- Abuse of discussions, uploads, email endpoints, and auth flows.
- Secret leakage through client bundles, logs, previews, or source control.
- Personal information leakage through analytics, exports, weather/location data, or support tools.
- Exposure of cohort-only external discussion links or reuse of contributions in summaries without valid consent.
- Supply-chain, deployment, and administrator-account compromise.

## Identity and sessions

- Use Firebase Authentication with verified email policy appropriate to the selected providers.
- Exchange identity tokens for secure server-managed sessions where required for protected server rendering; cookies are `HttpOnly`, `Secure`, and appropriately `SameSite`.
- Enforce recent authentication for sensitive account changes.
- MFA is not required for ordinary members initially. Admin identity/session design must support enforcing MFA at launch or later without changing application authorization; enable it at launch if Firebase/provider support and operations are ready.
- Rate-limit and monitor sign-in, account creation, recovery, invitation, and verification flows.
- Disable/suspend accounts through durable application status in addition to provider controls.

## Authorization

- Default deny in Firestore and Storage rules.
- Do not trust route visibility, client state, email address, Stripe redirects, or custom claims alone.
- Server-owned documents: subscriptions, entitlements, Stripe events, admin roles, audit logs, job state, migration state.
- Owner-only documents: private notes and personal profile fields.
- Enrollment, an immutable content unlock, and `entitlements.accessAllowed == true` are required for paid teaching releases and archived weekly summaries. Eligible current/historical cohort enrollment and the discussion lifecycle policy govern discussion reads/writes separately.
- Admin roles map to narrow capabilities. Support staff do not automatically receive note or content-edit access.
- Role grants, revocations, and custom-claim refresh use a versioned invalidation strategy so a revoked admin cannot rely on a long-lived token.
- Test rules with positive and negative emulator cases, including cross-user and cross-cohort attacks.

## Payment security

- Create Checkout and Portal sessions only on trusted server code for an authenticated user.
- Allowlist Stripe price IDs; never accept price, amount, entitlement, or customer ownership from the browser.
- Verify webhook signature against the raw request body.
- Record event IDs, process idempotently, and account for out-of-order events by comparing authoritative timestamps/state or retrieving the subscription.
- Grant access from verified webhook-derived entitlement, not the success URL.
- Reconcile Stripe and local subscription projections on a schedule.
- Model account deletion separately from Stripe customer/subscription retention; deletion must not orphan an active subscription or erase records required for tax, dispute, or reconciliation duties.
- Keep card data entirely within Stripe-hosted surfaces to minimize PCI scope.

## Application and content security

- Validate all inputs server-side with shared schemas and bounded lengths.
- Render rich text through an allowlisted structured format or sanitizer. Sanitize imported WordPress HTML and prohibit executable embeds.
- Use CSRF defenses for cookie-authenticated mutations, strict origin checking where appropriate, and secure response headers including a tested CSP.
- Prevent open redirects and validate external URLs/protocols.
- Use anti-automation/rate limits for expensive and abusive operations.
- Restrict uploads by type, signature, size, count, and path; scan or quarantine user-provided files if attachments are enabled.
- Avoid exposing sequential identifiers or unnecessary profile data in discussions.
- Treat onboarding background, country/region, Sacred Site selection, reflection responses, and discussion-excerpt consent as personal data. None is public by default.
- External discussion URLs are HTTPS-validated and visible only after the same cohort/week unlock check as the discussion space; administrators cannot insert script/data protocols or arbitrary embedded HTML.

## Infrastructure and secrets

- Separate Firebase projects and third-party credentials by environment.
- Store secrets in managed environment stores; never use public-prefixed variables for secrets.
- Use dedicated least-privilege service identities and rotate credentials.
- Protect production deployments and environment changes with least-privilege team roles and review.
- Pin dependencies with lockfiles once implementation begins, enable automated vulnerability review, and establish patch SLAs.
- Preview deployments must use non-production data and credentials unless a tightly controlled exception is approved.

## Privacy and data protection

- Complete a data inventory and lawful-basis/consent review before production data migration.
- Minimize collection of location, profile, notes, and discussion data.
- Treat selected network site and precise meetup coordinates according to a documented privacy classification.
- Private note text is excluded from analytics, logs, email, admin search, and routine support access.
- Discussion excerpts require affirmative, versioned contributor consent plus editorial approval. Consent scope distinguishes website/email use; withdrawal blocks future use and is audited.
- Define retention by collection, including logs, webhooks, deleted content, discussion evidence, exports, and backups.
- Provide authenticated export, correction, and deletion workflows with identity verification and legal-hold exceptions.
- Ensure subprocessors, international transfers, cookie consent, and marketing consent match applicable jurisdictions.

## Email security

- Verify SPF, DKIM, and DMARC for the sending domain; stage DMARC enforcement based on observed traffic.
- Separate transactional/service email from marketing preferences.
- Authenticate Resend webhooks if used and avoid placing sensitive content in email.
- Use signed, short-lived links for sensitive actions; links must be single-purpose and replay resistant where needed.
- Honor provider suppressions and user preferences without allowing unsubscribe actions to disable essential security notices.

## Logging, monitoring, and response

- Structured security events for admin changes, role grants, entitlement changes, failed webhook verification, access denials, and unusual auth behavior.
- Redact tokens, cookies, secrets, note bodies, raw payment payloads, and unnecessary PII.
- Alerts have an owner, severity, response target, and runbook.
- Incident plan covers containment, credential rotation, provider coordination, evidence preservation, notification assessment, and recovery.
- Audit events are append-only to clients and protected by retention/access controls.

## Backup and recovery

- Define Firestore and Storage backup/export cadence and protected retention.
- Test restoration in a non-production environment, including references between Auth users, Firestore, Storage, and Stripe identifiers.
- Record recovery point and recovery time objectives and test them before launch.
- Backups are encrypted, access-controlled, and included in deletion/retention analysis.

## Security verification gates

- Architecture threat-model review before feature development.
- Automated Firestore and Storage rule tests before any deploy.
- Payment/webhook tests for forgery, duplicates, disorder, retries, cancellation, disputes, and reconciliation.
- Authorization matrix tests for anonymous/member/cohort/moderator/editor/admin roles.
- Dependency, secret, static, and dynamic scans in CI once code exists.
- Manual accessibility and security review of auth, checkout, admin, uploads, discussions, and migration rendering.
- Independent penetration test or focused third-party review before handling production members.

## Admin capability baseline

| Capability                                          | Super admin                      | Content admin                          | Member support / operations                              |
| --------------------------------------------------- | -------------------------------- | -------------------------------------- | -------------------------------------------------------- |
| Publish public/programme content and prepared email | Yes                              | Yes                                    | No                                                       |
| Manage Sacred Sites and meetups                     | Yes                              | Yes                                    | No unless explicitly granted                             |
| Manage cohort definitions/schedules                 | Yes                              | Content only unless explicitly granted | Operational assignment where authorized                  |
| View membership/billing status                      | Yes                              | No                                     | Masked operational view                                  |
| Move a member between cohorts                       | Yes                              | No                                     | Yes, reason and audit required                           |
| Defined entitlement support action                  | Break-glass/high-risk capability | No                                     | Only specifically allowlisted actions with reason/expiry |
| Manage roles or plan/Stripe configuration           | Super-admin capability only      | No                                     | No                                                       |
| Read private notes/reflection text                  | No by default                    | No                                     | No                                                       |
| Export/delete user data                             | Separate privacy capability      | No                                     | Request/status only                                      |

This small three-bundle matrix is the initial baseline. Capability checks preserve separation without building a large policy engine. High-risk actions require recent authentication, reason capture, audit, and MFA when admin MFA is enabled. No role may silently combine content publication, billing override, and role administration merely for convenience.

Administrators may correct derived progress only through an audited repair command that identifies the source item and reason. They cannot arbitrarily set a percentage, read private notes, or impersonate a member. Member-management capability does not imply billing, role, publishing, or private-response access.

## Unresolved security decisions

- Admin MFA launch timing, session duration/revocation, minimum age, and duplicate-account recovery/merge policy. Member email/password, verification, and reset are decided; Google is deferred.
- Legal jurisdiction, age requirements, retention schedule, and support access policy.
- Exact retention/export rules for member-private reflection response text and any future explicit facilitator-consent workflow.
- Whether discussions support attachments or direct messages (direct messages are not recommended for v1).
- Protected media threat tolerance and download/offline policy.
- WAF/rate-limit, bot protection, monitoring, analytics, consent, and vulnerability-management providers.
- Precise roles/capabilities and emergency admin-access procedure.
