# Email system

## Scope

Resend will deliver transactional and member-service email. Every normal Sacred Path week has a Tuesday release email, Thursday release email, and Sunday summary using administrator-prepared/approved content. Billing receipts remain Stripe's responsibility unless a separate product requirement is approved. The website release/summary is canonical; email links back to it.

## Email categories

- Account/security: verification, recovery, sensitive account change.
- Billing/service: subscription access changes, failed-payment guidance, cancellation confirmation.
- Sacred Path service: onboarding, scheduled Sunday summary, essential cohort changes.
- Community/meetup: reminders only if explicitly enabled.
- Marketing: separate consent and suppression rules.

Classification and unsubscribe behavior require legal review. Security-critical messages cannot be disabled through a marketing unsubscribe.

## Teaching release workflow

1. An editor prepares the canonical website release and its email content, links/assets, subject, and plain-text fallback.
2. Publishing validation requires approved content, a compiled cohort release time, and authorized website destination.
3. At unlock time, the release worker materializes member unlocks; email orchestration selects recipients using entitlement and enrollment policy.
4. One logical release message exists per `{uid, cohortId, releaseId}` regardless of retries or template revisions.
5. The email links to the permanent website release and may include an approved concise introduction; it is not an independent teaching source.
6. Delivery failure does not undo the website unlock. Members can always retrieve unlocked material from the dashboard/archive while access is allowed.

## Sunday summary workflow

1. Scheduler creates a logical run for the target cohort week and Sunday window.
2. Run resolves eligible enrollments and current entitlement.
3. For each recipient, a unique logical message key is formed from message kind, user, cohort, and summary ID. It excludes template version so editing a template cannot trigger a duplicate weekly message.
4. A queued email job stores references and render inputs, not unnecessary private content.
5. On first queueing, the job snapshots the template version and render inputs. The worker validates required links and sends with Resend.
6. Provider message ID and delivery state are recorded.
7. Transient failures retry with backoff; permanent failures are suppressed/escalated.
8. Reconciliation reports missing, duplicated, delayed, bounced, and complained messages.

The weekly summary's editorial recap is canonical stored content. Per-member progress, meetup, and weather are resolved from authorized current projections when the job is prepared and snapshotted for that send; private notes/reflection responses are never inputs.

## Summary contents

- Clear cohort/week label and local dates.
- Brief summary of the week's two teaching releases and links to content already authorized for that recipient.
- Progress/reminder language that avoids shame, grading, or competitive framing.
- Relevant module reflection prompt/status when applicable.
- Link to the cohort/week discussion and only those excerpts with valid contributor consent and editorial approval for email use.
- Current programme/module progress from the canonical server projection.
- Selected Sacred Site/local group and upcoming meetup information only if policy and preferences allow, including organizer-authored expectations and what-to-bring information.
- Weather only when current enough and clearly labeled; weather failure never blocks the email.
- If the meetup is outside the reliable forecast window, omit forecast values and optionally state that weather will be available closer to the event.
- Preference/help links and required sender identity.

Do not include private note text or sensitive reflection text.

## Scheduling and timezones

- Planning baseline: Sunday follows the cohort timezone. Store the IANA timezone and local send intent, compile the send instant to UTC, and display dates clearly for members elsewhere. Changing to per-member scheduling requires an explicit decision because it changes batching, support expectations, and DST behavior.
- Each summary covers the cohort week that has just ended. Its compiled send time must be after release 2 and before the next week's release 1; schedule publication rejects conflicts.
- Tuesday/Thursday are defaults, not hard-coded assumptions. Release email jobs follow each cohort's published schedule.
- Define behavior for members assigned after the weekly cutoff, DST transitions, and scheduler downtime.
- A catch-up run must use the same logical message keys and avoid sending stale summaries outside an approved lateness window.

## Templates

- Version email subject, HTML, plain text, sender, and required variables.
- Preview with realistic fixtures and edge cases; administrators can preview/test-send but publishing templates requires a capability.
- Use absolute canonical links and consistent campaign/source tags without including sensitive identifiers.
- Meet accessibility basics: semantic structure, readable type, contrast, meaningful link text, alt text, and usable plain text.
- Snapshot the template version for every job so retries do not unexpectedly change content.
- Prepared teaching content and email copy require human approval. Any later AI assistance must receive named source material, retain source traceability, avoid unsupported claims/teachings, and never publish/send without review.

## Deliverability

- Configure and verify a dedicated sending domain/subdomain with SPF and DKIM.
- Establish DMARC reporting, then move to enforcement after validation.
- Separate streams/tags for account, service, and marketing mail.
- Monitor delivery, bounce, complaint, and suppression rates.
- Do not send to known hard bounces or complaints except where provider policy and essential security needs permit.
- Warm sending volume if migration introduces a large list; never assume WordPress addresses include valid marketing consent.

## Security and privacy

- Resend API keys are server-only and environment-specific.
- Webhook signatures are verified and events processed idempotently.
- Unsubscribe/preferences links are signed, scoped, and tamper-resistant.
- Logs omit full rendered bodies and sensitive query parameters.
- Recipient lists are never placed in shared address fields.
- Define provider retention and data-processing terms before production.

## Operational controls

- Pause switch by email category and environment.
- Development uses restricted recipient allowlists.
- Admin view shows aggregate job status and safe metadata, with retry only for eligible failed jobs.
- Manual resend creates an audited new attempt linked to the original logical message and still enforces deduplication policy.
- Alerts cover queue backlog, failure spikes, webhook failure, bounce/complaint thresholds, and Sunday-run incompleteness.

## Test matrix

- Monthly/annual, active/inactive, and cancelled-at-period-end-but-paid-through members; add grace/pause/refund cases when those policies are defined.
- Current, completed, cutoff-waiting, manually transferred, and future paused enrollments.
- Week with two releases, module boundary, no meetup, cancelled meetup, stale weather.
- Release email and website unlock partial failures in both directions; archive access must not depend on inbox delivery.
- Consented, unconsented, withdrawn, and wrong-scope discussion excerpts.
- Missing locale/name/site and long/localized content.
- Duplicate scheduler/event, provider timeout, retry, hard bounce, complaint, suppression.
- DST start/end and scheduler recovery within/outside lateness window.
- HTML/plain-text rendering, links, accessibility, and responsive email clients.

## Unresolved decisions

- Sending domain/from/reply-to identity and operational reply handling.
- Preferred Sunday local delivery hour and maximum catch-up lateness. Cohort timezone is the current baseline.
- Mandatory versus optional Sacred Path summary classification.
- Preference center categories and regional consent rules.
- Template editing workflow and approval roles.
- Whether email contains excerpts or only titles/links.
- Editorial approval workflow and evidence required for source-grounded AI-assisted transformations.
- Weather/meetup inclusion and location privacy.
- Retention periods for jobs, provider events, and engagement metrics.
