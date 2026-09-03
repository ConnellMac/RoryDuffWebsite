# Product specification

## Status

Planning baseline for the rebuilt Rory Duff website and Sacred Path member experience. This document describes intended outcomes, not implemented functionality.

## Product vision

Create a fast, accessible public website for Rory Duff's work and a calm, trustworthy paid learning space for Sacred Path members. The new Next.js site will replace the WordPress frontend. WordPress remains unchanged during planning and later serves as a migration source.

Sacred Path is an ongoing guided educational journey through teachings, reflection, practical requirements, discussion, and local meetups. It must not be framed as a conventional graded online course. There is no pass/fail system in the initial product.

## Audiences

- Public visitors discovering Rory, articles, books, media, events, Sacred Network, and Sacred Path.
- Prospective members evaluating Sacred Path plans and expectations.
- Active monthly and annual members progressing with a cohort.
- Returning members reviewing content unlocked during their current active membership.
- Administrators and editors managing content, cohorts, discussions, meetups, and member support without editing code.

## Product areas

### Public website

- Editable pages and navigation.
- Articles with authorship, publication dates, categories, tags, related content, and SEO metadata.
- Books and other structured resources with purchase or external links.
- Audio, video, images, transcripts, and downloadable media where rights permit.
- Sacred Network information, including worldwide sites and local meetup information.
- Sacred Path marketing, pricing, FAQs, and sign-up entry points.
- Redirect preservation and search indexing through migration.

### Sacred Path membership

- Email/password account creation and sign-in using Firebase Authentication, including email verification and password reset. The user model must allow Google sign-in to be linked later without redesign.
- Stripe-hosted checkout for monthly and annual subscriptions and a customer portal for billing self-service.
- Entitlement derived from verified Stripe events, never from client claims.
- Assignment to a cohort according to an explicit cohort policy.
- Curriculum organized into modules, weeks, teaching releases, and end-of-module completion steps.
- Two scheduled teaching releases per normal cohort week, initially Tuesday and Thursday, with administrator-editable day/time configuration.
- An email for each Tuesday/Thursday release that links to the canonical website version.
- A Sunday summary email that brings together the cohort's completed week.
- Access to all releases already unlocked for that member while membership is active.
- Progress states and sequential reflection/completion steps, with no pass/fail score.
- Private notes/reflections associated with releases and other learning items, visible only to their owner except narrowly defined legal access if approved.
- Sacred Network site selection during onboarding, with the ability to update it later.
- Meetup directory with timezone-aware schedules, location information, and weather.
- Cohort/week-specific discussions with moderation controls.

### Member dashboard

- Member profile/name, cohort, current module, and current programme week.
- One explicit progress/trajectory value derived from required items, not from page-specific guesses.
- Current Tuesday release, current Thursday release, and Sunday summary.
- Next action/continue entry point and recently unlocked content.
- Upcoming meetup for the selected Sacred Site/local group.
- Current cohort/week discussion, private notes, and unlocked module/archive access.

### Administration

- Role-based admin access separated from ordinary membership.
- CRUD and preview workflows for public content, programmes, modules, weeks, releases/teaching content, media, prepared email content, summaries, completion steps, milestones, cohorts, enrollment dates, Sacred Sites, meetups, discussions/external links, consented excerpts, and scheduled releases.
- Member administration and narrowly controlled progress correction. Admins do not receive routine access to private notes or reflection response text.
- Draft, scheduled, published, archived, and cancelled lifecycle states where appropriate.
- Validation that prevents incomplete or contradictory schedules from publishing.
- Audit trail for security-sensitive and publishing actions.
- Member support views that avoid exposing private notes.

## Core membership rules

1. A paid entitlement begins only after a verified successful Stripe state transition.
2. Temporary planning prices are USD $19.99 monthly and USD $199 annually. Both plans grant identical product access; annual differs only by billing interval and discount. Prices are centrally configured and mapped to Stripe Price IDs, never repeated as application constants. Final launch pricing remains configurable.
3. A member has at most one current Sacred Path enrollment at a time in the initial release. Historical enrollments are retained so rejoining or transferring never overwrites prior cohort, unlock, or progress history.
4. Cohort timing determines new release availability; stored unlock records preserve a member's personal archive.
5. The archive is accessible only when the server-owned entitlement has `accessAllowed: true`. Cancellation does not remove access before the valid paid-through date; access ends when that entitlement period ends. Failed-payment grace, refunds, pauses, and rejoining remain configurable later policies and do not block the foundation phase.
6. Pausing, resuming, switching plans, refunds, transfers, and rejoining must use explicit policies rather than silently changing cohort history. Billing status, entitlement, and cohort enrollment are separate state machines.
7. Completion steps are sequential acknowledgements/reflections. They are not assessments and do not produce pass/fail results.
8. Private notes never appear in cohort discussions, analytics text exports, or admin content tools.
9. The member website is the canonical teaching archive. Email is a delivery/reminder channel and never the sole copy of a release.
10. Subscription permission and cohort progression are both required: payment alone never exposes future cohort material.

## Key user journeys

### Join Sacred Path

1. Visitor reviews the offer and chooses monthly or annual billing.
2. Visitor creates or signs into an account.
3. Server creates a Stripe Checkout Session tied to the authenticated user.
4. Verified Stripe webhook activates entitlement and records subscription state.
5. Cohort assignment is made idempotently.
6. Member completes onboarding, including timezone/locale and Sacred Network site selection.
7. Member sees the appropriate current release and archive.

### Learn and complete a module

1. Member opens the dashboard and sees current and previously unlocked content.
2. Scheduled releases become available according to cohort timezone policy.
3. Member records lightweight progress and optional private notes.
4. At module end, required reflection steps unlock in sequence.
5. Each step saves independently. Members may stop, resume, move backwards, and revisit prior responses.
6. Completion is recorded after all required steps are complete; there is no score.

### Find a meetup

1. Member chooses or confirms a Sacred Network site.
2. Site shows upcoming local meetup details in the site's timezone and the viewer's timezone.
3. Weather is fetched server-side or via a controlled integration, labeled with provider and update time.
4. Stale or unavailable weather never hides core meetup information.
5. If a meetup is outside the provider's reliable forecast window, the site says weather will be available closer to the event and does not manufacture a forecast.

## Notifications

- Sunday summaries are generated per eligible member/cohort/week and sent through Resend.
- A summary represents the cohort week that has just ended and is scheduled after that week's second release. The exact Sunday local time is a pre-build decision.
- Tuesday and Thursday release messages are generated from administrator-prepared content and link to the permanent release page.
- Sunday summaries may include recap text, both release links, the week discussion, consented discussion excerpts, current progress, local meetup details, reliable weather, expectations, preparation, and what-to-bring guidance.
- Teaching and summary content is supplied or approved by authorized editors. The software does not invent Sacred Path teachings. Any later AI-assisted transformation must be source-grounded, traceable to supplied material, reviewed by a human, and never auto-published.
- Billing and account security messages remain transactional and distinct from marketing consent.
- Users can manage non-essential communication preferences; legally or operationally required messages are classified separately.
- Every send is idempotent and logged without storing unnecessary message content.

## Non-functional requirements

- Accessibility target: WCAG 2.2 AA for public, member, and admin surfaces.
- Mobile-first responsive behavior and good Core Web Vitals.
- SEO parity or improvement for migrated public content, including metadata, canonical URLs, sitemap, and redirects.
- Timezone-aware scheduling; timestamps stored in UTC with named IANA timezones for display and schedule intent.
- Privacy by design, least privilege, data minimization, documented retention, and user export/deletion processes.
- Observable background jobs and webhooks with retries, idempotency, and alerting.
- Automated tests around entitlements, releases, cohort assignment, security rules, and payments.

## Default weekly experience

- Tuesday: release 1 unlocks on the website and its prepared email is sent.
- Thursday: release 2 unlocks on the website and its prepared email is sent.
- Sunday: the prepared weekly summary is published/sent after both releases.
- Administrators may configure days/times for future cohorts before schedule publication. A live schedule cannot be changed in a way that rewrites past unlocks.

Each release can contain structured text and references to audio, video, images, downloads, and links; accept private notes; and link to the cohort/week discussion. The site copy remains available in the unlocked archive while `accessAllowed` is true.

## Notes and reflection ownership

- Private personal notes are optional member-only records attached to learning content; administrators cannot routinely read them.
- Required reflection responses are separate member-owned records used to establish completion. They are private by default and editable by the member unless a future module explicitly publishes a locking rule before participation.
- Facilitator review is deferred and would require explicit member consent, scoped reviewer access, purpose/retention rules, and auditability.

## Progress definition

Two distinct canonical values must be labeled and may be displayed together:

- **Current/caught-up progress:** `completed required unlocked items / total required unlocked items`—how caught up the member is with everything currently available.
- **Overall programme progress:** `completed required programme items / all required programme items in the member's curriculum version`—how far the member is through the full journey.

Required items have explicit type and weight of one: teaching viewed/completed, required reflection, required practical action confirmation, or required end-of-module step. Optional items do not affect either percentage. Future locked items are excluded only from caught-up progress and included in overall programme progress. Dashboard, email, and support surfaces use the same server-produced projections and never present one value ambiguously as “progress.” Completing every required item in a module marks that module complete.

## Out of scope for the first production release

- Native mobile applications.
- Live video hosting or full video-conferencing infrastructure.
- Pass/fail quizzes, grading, certificates, or leaderboards.
- Direct editing of application source by content administrators.
- Replacing WordPress before migration validation and cutover approval.
- Building a general-purpose social network beyond scoped cohort/week discussions.
- Automatically generated teaching material or unreviewed AI publication.

## Success measures

- Successful paid conversion and onboarding completion.
- Low checkout-to-entitlement latency and zero unauthorized access incidents.
- Release and Sunday email delivery success, with duplicate-send rate near zero.
- Weekly active members, release engagement, module completion, and voluntary retention.
- Findability of migrated content and preservation of priority search traffic.
- Admin publishing success without developer intervention.
- Support volume for login, billing, access, and cohort confusion.

## Unresolved product decisions

- Exact content inventory, navigation, visual identity, and editorial ownership.
- Exact configurable cohort frequency, capacity, default timezone, and cutoff duration. The fixed scheduled-cohort/next-eligible assignment rule is decided.
- Detailed failed-payment grace, refund, pause, and rejoining/backfill policies. Paid-through cancellation behavior is decided.
- Discussion capabilities: replies, reactions, attachments, reporting, editing windows, and moderation SLA.
- Definition of a Sacred Network site, site-selection privacy, and whether selection is mandatory.
- Meetup data ownership, recurrence rules, RSVP scope, map/provider requirements, and weather provider.
- Exact reflection fields and any future explicitly consented facilitator-review workflow. Responses are currently editable and member-private.
- Email branding, sending domain, preference center, regional consent requirements, and quiet-hour policy.
- Legal jurisdictions, minimum age, accessibility review owner, retention periods, and data residency constraints.
- WordPress content types, plugins, custom fields, media rights, URL rules, and quality threshold for cutover.
- Final launch pricing, tax presentation, and regional availability. Planning uses USD $19.99 monthly and USD $199 annual with identical access.
