# Build plan

## Delivery approach

Work in small vertical slices. Each phase has a demonstrable outcome, automated checks proportional to risk, and an explicit exit gate.

## Phase 0: decisions and source discovery

### Work

- Resolve the open decisions recorded across the planning documents.
- Inventory WordPress and confirm migration access and scope.
- Define personas, information architecture, content model, brand/design inputs, analytics needs, privacy/legal requirements, and accessibility acceptance.
- Approve the canonical required-item progress formula, Tuesday/Thursday/Sunday default schedule, discussion abstraction/consent, and Sacred Site/meetup separation.
- Produce architecture decision records for job ownership, sessions, search, protected media, weather/maps, and admin approach.
- Define environments, ownership, incident contacts, budgets, and service limits.

### Exit gate

Stakeholders approve product scope, architecture decisions, migration inventory, security threat model, and an initial acceptance-test map.

## Phase 1: foundation

### Implementation status

Complete as of 2026-09-03. Node.js 24 and npm are selected. The Next.js App Router shell, placeholder route boundaries, environment validation, quality tooling, local-only Firebase emulator configuration, default-deny rules/tests, CI, and workload-ownership record are in place. Installation, formatting, lint, strict TypeScript, unit tests, Firebase rule tests, the production build, development-server startup, Playwright Chromium smoke tests (14/14 routes), and browser loading have all been verified successfully. Phase 1 contains no production Firebase connection, deployment, WordPress access, or Phase 2 feature implementation.

### Work

- Initialize Next.js only after Phase 0 approval.
- Establish formatting, linting, type checking, unit test support, a minimal browser smoke-test harness, CI, environment-schema validation, and dependency policy.
- Add local Firebase Emulator configuration only after Firebase initialization is explicitly authorized; create default-deny Firestore/Storage rules and rule-test scaffolding. Do not create or connect production Firebase resources in Phase 1.
- Define environment boundaries and placeholders without real secrets. Preview deployment setup is excluded unless separately authorized.
- Create design tokens and accessible shell/navigation components.
- Record architecture decisions for repository conventions, Firebase server sessions, and the recommended Vercel/Cloud Functions ownership table without implementing provider integrations.

### Tests/demo

- CI blocks broken formatting/types/tests and secret leakage.
- Preview environment renders a static accessible shell.
- Local development renders a static accessible shell; if preview deployment is separately authorized, the same smoke test applies there.
- Emulator rule tests prove default-deny behavior.
- Production credentials are absent from local/preview clients.

## Phase 2: authentication and onboarding

### Implementation status

Implementation and required verification are complete. Email/password signup/login/logout, verification, reset, Firebase Admin session cookies, member/admin server route boundaries, constrained Firestore profiles, server-acknowledged onboarding with a disabled Sacred Site placeholder, emulator-only admin bootstrap, Security Rules, unit/rules/browser tests, and CI configuration are implemented. The onboarding smoke test observes the server persistence acknowledgement before asserting the unchanged `/members` destination, preventing the asynchronous transaction from being confused with a navigation failure. Format, lint, strict TypeScript, unit tests, the production build, the 8/8 Firebase Security Rules tests, the complete 12/12 Playwright smoke suite, and the authentication/onboarding journey all pass. The Firebase emulator shutdown can emit a rules-runtime `NullPointerException` after the successful test command; it has not affected test results and the emulator ports were confirmed released.

This phase ordering supersedes the earlier plan after explicit owner authorization. The former public-content phase moves to Phase 3; no public CMS work is included here.

### Work

- Firebase email/password signup, login, logout, verification, and password reset.
- Five-day server-managed Firebase session cookie with origin validation and revocation-aware verification.
- Member profile/onboarding fields and temporary null Sacred Site selector.
- Server-enforced `/members/*` and `/admin` boundaries plus constrained profile Security Rules.
- Local emulator-only administrator bootstrap and positive/negative automated coverage.

### Tests/demo

- Signup → email verification → onboarding → member access.
- Login, logout, password reset request, unauthenticated member redirect, and ordinary-member admin denial.
- Firestore owner access and privilege/cross-user/unauthenticated denial.

## Phase 3: Sacred Sites, cohorts, and secure member association

### Implementation status

Complete as of 2026-09-04. The local-emulator implementation adds controlled Sacred Site records, real onboarding/profile Site selection, cohort records and current member assignment, minimal role-scoped admin tools, strict server validation, append-only audit events, default-deny rules, and unit/rules/browser coverage. Formatting, ESLint, strict TypeScript, 10/10 unit tests, the production build, production-server startup, the production dependency audit, 13/13 combined Firestore/Storage Security Rules tests, and 13/13 Playwright smoke tests pass. It does not add automatic cohort enrollment, programme progression, billing, emails, meetups, weather, discussions, migration, production resources, or deployment.

### Work

- Implement stable `sacredSites` records with validated coordinates/timezones and reversible active state.
- Replace the onboarding placeholder with active-Site selection and allow members to change their reference later.
- Implement cohort records without programme/week progression or automatic cutoff assignment.
- Build minimal admin Site/cohort CRUD, cohort member viewing, and authorized manual assignment/transfer.
- Keep client Firestore writes to Sites/cohorts denied; enforce current role capabilities and all privileged validation in server operations.
- Record Site/cohort changes and member assignment/transfer as append-only server audit events.

### Tests/demo

- A member can query active Sites, keep a historical inactive selection visible, and select/change only to an active Site.
- Members cannot alter role/`cohortId`, write controlled entities, or use admin pages/APIs.
- Authorized roles can create/edit/deactivate/reactivate Sites; a super admin can manage cohorts; super admin/support can assign or transfer an ordinary member with a reason.
- Phase 2 authentication/onboarding behavior continues to pass.

This Phase 3 scope supersedes the former public-content Phase 3 after explicit owner authorization. Public content and publishing remain deferred and will be scheduled separately rather than silently renumbering an approved future phase.

## Deferred authentication follow-ups from Phase 2

### Work

- Add communication preferences, account-status workflows, and timezone/locale.
- Add Google sign-in only when authorized, linking by Firebase `uid` rather than redesigning profiles.
- Add account recovery and deletion/export request entry points.

### Tests/demo

- Auth/session lifecycle works across browser refresh and revocation.
- Cross-user profile access is denied by server and security rules.
- Onboarding resumes safely and site selection can be updated according to policy.

## Phase 4: billing and entitlement

### Work

- Configure Stripe test products/prices for monthly and annual plans.
- Implement authenticated Checkout Session and Customer Portal creation.
- Process verified webhooks idempotently and project subscription/entitlement state.
- Add reconciliation and privileged, audited support tooling.

### Tests/demo

- Test-clock/scenario coverage for purchase, duplicate/out-of-order webhooks, plan change, cancel-at-period-end, immediate cancellation if supported, failure/grace, recovery, refund/dispute policy, and rejoin.
- Success-page tampering cannot grant access.
- Entitlement latency and reconciliation are observable.

## Phase 5: curriculum, cohorts, and release archive

### Work

- Build admin tools for versioned modules, weeks, two weekly releases, reflection steps, cohorts, and calendar preview.
- Implement cohort assignment, versioned schedule compilation, idempotent unlocks, and reconciliation.
- Build member dashboard, current release, archive, progress, and sequential module completion.
- Support Tuesday/Thursday release emails, permanent website records, resumable step-by-step completion with backwards navigation, activities/milestones, and the canonical progress projection.

### Tests/demo

- DST, cutoff, late join, transfer, cancellation, schedule edit, duplicate job, and missed-job recovery scenarios pass.
- Members cannot cross cohort/user boundaries.
- Previously unlocked content remains available only under the active-membership policy.
- Module steps enforce sequence and never grade.

## Phase 6: private notes and discussions

### Work

- Implement owner-only notes with retention/export/delete behavior.
- Implement provider-neutral cohort/week discussion spaces. Start with controlled external links if chosen; defer native threads/replies while retaining consented excerpt records, report/moderation needs applicable to summaries, and safe rendering.
- Add narrowly scoped moderation/admin views and audit events.

### Tests/demo

- Cross-user note reads fail under direct SDK and server access tests.
- Private notes never appear in admin search, discussion, analytics, logs, or email.
- Cross-cohort discussion access fails; abuse/report flows are usable and auditable.

## Phase 7: meetups and weather

### Work

- Extend the Phase 3 Sacred Site foundation with an admin-managed meetup schedule and timezone handling.
- Keep `user.sacredSiteId`, `meetup.sacredSiteId`, and meetup venue/coordinates distinct.
- Add member discovery/filtering and selected-site views.
- Integrate the chosen weather adapter with caching, attribution, licensing, and graceful fallback.

### Tests/demo

- Global timezone/DST cases display correctly.
- Location privacy rules are enforced.
- Weather outages, stale forecasts, missing geocoding, and rate limits do not hide meetup details.

## Phase 8: email

### Work

- Configure Resend development/staging domains and authenticated sending.
- Build versioned prepared templates, queue/worker, release and Sunday schedulers, idempotency, delivery webhooks, preferences, suppression, and operational status.
- Add restricted test sends and category pause controls.

### Tests/demo

- Full matrix in `EMAIL_SYSTEM.md` passes.
- Duplicate scheduler runs do not duplicate messages.
- Summary content matches cohort/week and omits private data.
- Sunday completion report and failure alerts are actionable.

## Phase 9: migration tooling and rehearsals

### Work

- Implement the mapping specification and idempotent importer.
- Run subset and full staging rehearsals, reconciliation, security checks, URL crawls, visual review, and editorial sign-off.
- Prepare final redirects and cutover/rollback runbooks.

### Tests/demo

- Meet all criteria in `MIGRATION_PLAN.md`.
- Re-running unchanged data produces no unintended changes.
- No private/draft/paid item is public.

## Phase 10: launch readiness and cutover

### Work

- Performance/load, accessibility, security, restore, failure-mode, browser/device, and end-to-end payment testing.
- Complete legal copy, privacy/cookie controls, support/runbooks, monitoring/alerts, ownership, and incident rehearsal.
- Execute final migration and approved cutover; monitor and retain rollback capability.

### Exit gate

Named product, engineering, editorial, security/privacy, SEO, and operations owners sign off. No open severity-one defects; severity-two exceptions require explicit risk acceptance.

## Cross-cutting definition of done

- Acceptance criteria and failure behavior are documented.
- Authorization is enforced and negatively tested at every boundary.
- Accessibility and responsive behavior are verified.
- Logs/metrics provide enough evidence to operate the feature without exposing sensitive content.
- Data migration/rollback implications are addressed.
- Documentation and runbooks are updated.
- Changes are reviewable, deployed first to non-production, and demonstrated to the responsible stakeholder.

## Suggested first implementation slices after approval

1. Static public page read model plus editor draft/preview/publish.
2. Authenticated profile plus Sacred Network site onboarding using emulator-only data.
3. Stripe test purchase through verified entitlement to one protected fixture release.
4. One miniature cohort containing one week, two timed releases, and an immutable archive.
5. One module with two sequential reflection acknowledgements and no scoring.
6. One Sunday summary generated idempotently for the miniature cohort.

Each slice should be production-shaped but limited in breadth, avoiding a large untestable platform build.

## Unresolved Decisions

These rankings describe when a decision must be made. The product decisions supplied in the current brief remove the previous blockers to foundation work.

### Critical before coding

- No unresolved product decision currently blocks the narrowly defined Phase 1 foundation scope.
- Before Phase 1 starts, the repository owner must explicitly authorize initialization/package installation and select supported Node/package-manager versions. These are execution approvals/tooling choices, not product-architecture blockers.

### Can be decided during build

- Final launch pricing/taxes; planning uses USD $19.99 monthly and $199 annual with identical access.
- Cohort frequency, capacity, cutoff duration, clock times, waitlists, and exceptional transfer/backfill details before cohort implementation.
- Refund, pause, failed-payment grace, dispute, rejoin, and lapse-backfill rules before billing/cohort implementation.
- Session duration, admin MFA launch timing, minimum age, duplicate-account handling, and detailed retention/export/deletion policy before authentication/production-data launch.
- Exact reflection fields, response-lock exceptions, facilitator-review consent, and consequences of editing earlier completion steps before curriculum implementation.
- Initial external discussion provider, link security, excerpt consent wording/withdrawal, moderation operation, and protected-media delivery before those features.
- Confirm the recommended server responsibility owner before each webhook/job/integration is implemented.
- WordPress inventory, user/member scope, source-conflict rules, delta/freeze, redirects, and rollback before migration tooling/cutover.
- Exact Firestore composite indexes and denormalized read models after query-contract prototypes, provided ownership and authorization do not change.
- Search provider and ranking details before public search implementation; keep a provider adapter and migration path.
- Weather, map, and geocoding providers before meetup implementation, subject to approved privacy, licensing, and budget constraints.
- Final email visual templates, subject-line style, excerpt length, and reply-handling workflow before email implementation.
- Analytics and consent-management vendors before analytics is enabled, subject to the approved legal/data baseline.
- Admin interface layout, bulk-edit ergonomics, preview presentation, and non-security workflow refinements.
- Exact cache durations, pagination sizes, retry backoff, and alert thresholds based on testing and service limits.
- Meetup recurrence UX, filters, and optional reminder preferences within the approved location/privacy model.
- Deterministic weather-preparation rule thresholds and wording after a provider/forecast window is selected.

### Optional/later

- Native discussions (if external links meet launch needs), social reactions, richer profiles, discussion attachments, and advanced community features.
- Offline downloads, native mobile applications, certificates, quizzes, or gamification.
- Advanced personalization and content recommendations.
- RSVP/waitlist automation and calendar integrations for meetups.
- Additional identity providers beyond the approved initial set.
- External headless CMS, dedicated full-text discussion search, and advanced editorial analytics.
- Localization beyond the initial agreed language/locale scope.

## Exact recommended Phase 1 scope

Phase 1 is a local/non-production engineering foundation after explicit implementation authorization:

- Initialize one Next.js TypeScript App Router application with agreed Node/package-manager versions.
- Add only essential dependencies and commit the lockfile.
- Configure formatting, linting, strict type checking, unit tests, a minimal browser smoke test, and CI.
- Create an accessible responsive shell with placeholder public/member/admin route boundaries but no product features or real data.
- Add environment-schema validation and example variable names with no credentials.
- Configure Firebase Emulator-only development, default-deny Firestore/Storage rules, and initial negative rule tests only after Firebase initialization is expressly authorized.
- Document server-session and workload-ownership decisions; do not implement Stripe, Resend, weather, scheduled jobs, authentication flows, billing, cohorts, admin CRUD, migration, or production integrations.

Phase 1 explicitly excludes cloud resource creation, production/preview deployment, WordPress access, content migration, real user data, and feature implementation.
