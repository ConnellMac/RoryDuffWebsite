# Cohort system

## Purpose

The cohort system gives members a shared teaching rhythm while preserving an individual, permanent record of content they have unlocked. The record persists; readability is controlled separately by current entitlement.

## Domain terms

- **Program:** Sacred Path as a product.
- **Curriculum version:** immutable teaching structure assigned to one or more cohorts.
- **Module:** ordered collection of weeks followed by sequential completion/reflection steps.
- **Week:** ordered unit containing normally two teaching releases.
- **Release:** a scheduled teaching item.
- **Cohort:** members sharing a curriculum version, schedule, and discussion spaces.
- **Enrollment:** a user's membership in a specific cohort.
- **Unlock:** durable evidence that a teaching release or weekly summary became available to an enrollment.
- **Entitlement:** current right to access paid Sacred Path material.

## Proposed lifecycle

### Cohort

`draft -> open -> active -> completed -> archived`

- `draft`: editable and invisible to members.
- `open`: accepts assignments according to enrollment rules.
- `active`: schedule is running; structural edits are restricted.
- `completed`: no new releases, but eligible members retain archive access.
- `archived`: retained for audit/support with no active participation.

### Enrollment

`pending -> active -> completed`

Exceptional transitions: `active -> paused`, `active -> withdrawn`, and approved reassignment. Every exceptional transition records reason, actor, and effective time.

## Assignment policy

The initial model uses scheduled cohorts. A successful entitlement event calls an idempotent assignment service that selects the earliest upcoming open cohort whose configurable cutoff has not passed, respects capacity, and stores the policy version and reason. After cutoff, it selects the following eligible cohort. Members in one cohort share the same compiled programme week and unlock instants; multiple cohorts can run at different stages.

The following remain configurable and are decided before cohort implementation, not before Phase 1 foundation work:

- Cohort frequency/calendar and cutoff duration relative to start.
- Exceptional late/manual placement and whether missed releases backfill.
- Capacity and waitlist rules.
- Default cohort timezone and daylight-saving behavior.
- Manual overrides and member-requested transfers.
- Rejoin/resubscribe behavior.

Assignment must not depend on a user's browser clock. It runs in trusted code against server time.

Authorized support/operations staff may manually transfer a member. Transfer records the actor, reason, effective time, old/new enrollment links, overlap/backfill decision, and audit event; it cannot expose future content or delete historical unlock/progress.

## Schedule model

- Cohort has a named IANA timezone and start instant.
- Each week has an ordered program offset.
- Each of the two releases has a weekday/local-time or explicit offset.
- Before activation, schedule compilation converts local intent to UTC instants and stores one versioned `releaseSchedules` snapshot under the cohort. Releases use those compiled instants, not recalculation at request time.
- Daylight-saving transitions are tested explicitly.
- Publishing validation flags missing releases, duplicate sequence values, past dates, and overlapping modules.
- Initial defaults are Tuesday release 1, Thursday release 2, and Sunday summary in the cohort timezone. Admins may change the configuration before publication; every cohort member uses the same compiled instants.

## Unlock algorithm

Recommended approach: materialize one immutable unlock document per enrollment and release.

1. A scheduler identifies teaching releases or weekly summaries whose scheduled instant has passed.
2. It selects enrollments eligible under the published cohort policy. A temporary billing failure must not destroy schedule history; whether unlocks continue while `accessAllowed` is false is a critical policy decision.
3. It creates missing unlock records using deterministic content keys.
4. Duplicate job execution is harmless.
5. The member archive queries unlock records, then applies current entitlement at read time.

An on-demand repair/reconciliation job compares expected and actual unlocks. Unlock deletion is prohibited in normal admin flows; corrections are additive or explicitly audited.

## Archive rule

A release is readable when:

- the user is authenticated;
- the server-owned entitlement has `accessAllowed: true`;
- the release has an unlock for that user's enrollment; and
- neither account nor resource is administratively suspended.

Cancellation scheduled for period end retains access until `validUntil`. After the paid-through entitlement ends, `accessAllowed` becomes false and archive access is suspended. Unlock, progress, and member-owned response history is retained for restoration. Refund, pause, failed-payment grace, rejoin, and lapse-backfill rules remain configurable/deferred until billing/cohort implementation.

## Progress

- Opening a release can mark it `started`; explicit member action marks it `completed`.
- Progress is personal, not competitive, and has no score.
- Reopening content does not reset completion.
- Admins may view aggregate completion metrics only where privacy policy allows; individual support access is capability-controlled and audited.
- Curriculum corrections must not silently invalidate completed progress.
- Caught-up progress is `completed required unlocked items / total required unlocked items`; future locked weeks are excluded.
- Overall programme progress is `completed required programme items / all required programme items` in the enrollment's curriculum version; future items are included in the denominator.
- Teaching completion/view, required reflection, practical-action confirmation, and end-of-module steps declare required/optional explicitly. Completing all required module items marks the module complete.
- The same two clearly labeled, versioned server projections feed dashboard, email, and authorized support views.

## End-of-module sequence

1. Module reflection becomes available when its prerequisite teaching releases are unlocked; stakeholders decide whether completion of each release is also required.
2. Previously available steps remain revisitable. Of the locked future steps, only the next required step becomes available for forward completion.
3. Completing step `n` makes required step `n+1` available; each save is durable before navigation.
4. Completing all required steps marks the module complete.
5. Optional steps do not block completion unless configured before publication.
6. No answer is graded and no pass/fail state exists.

Members may navigate backwards to previously available steps and revisit/edit responses under the approved edit policy. Moving backwards never locks an already available later step; if changing an earlier response should invalidate later completion, that rule must be explicitly approved rather than inferred. If reflections capture text, visibility, encryption expectations, editing, export, deletion, and staff access require explicit approval before build.

## Discussions

- Exactly one stable discussion space per cohort/week, optionally linked from both releases, opening no earlier than the configured schedule.
- Write access requires `accessAllowed`, eligible cohort enrollment, and an open space. Read access after membership/cohort completion is a separate explicit policy; default is to require `accessAllowed` and related enrollment.
- Read-only/archive behavior after a week or cohort ends is configurable.
- Posts/replies support reporting, moderation state, and bounded edit history if required.
- Moderators act through explicit capabilities; actions are audited.
- Private notes and discussion content are distinct data types and never cross-post automatically.
- Initial spaces may point to Telegram or another external provider. The stable space stores provider mode/URL so future native discussions do not change curriculum links.
- A discussion excerpt may appear in a Sunday summary only with recorded contributor consent and editorial approval.

## Admin operations

- Create and validate curriculum versions and cohort schedules.
- Preview a cohort calendar in its timezone and UTC.
- Open/close enrollment, set capacity, and view assignment rationale.
- Pause/cancel future releases without deleting prior unlocks.
- Perform audited enrollment transfer or schedule repair.
- Monitor missing unlocks, duplicate job attempts, and discussion reports.
- Never directly edit payment entitlement from routine cohort screens; support overrides require a separate privileged flow with expiry and reason.

## Acceptance scenarios

- Two releases unlock at the intended local times for every tested DST boundary.
- A duplicated scheduler invocation creates no duplicate unlock or notification.
- A member cannot access another cohort's current or archived release.
- An inactive member cannot read archived paid content, but reactivation follows the chosen restoration policy.
- Editing a draft schedule updates preview; editing an active schedule cannot rewrite prior unlocks.
- Reflection step 2 cannot complete before required step 1.
- Module completion never exposes a score or pass/fail result.
- Site selection changes do not alter cohort assignment unless an explicit policy says otherwise.

## Timing invariants

- Every cohort week has exactly two release schedules unless a pre-publication exception is approved and displayed clearly.
- Default days are Tuesday and Thursday. Release 1 precedes release 2; the Sunday summary is after release 2 and before the next cohort week's first release.
- Published instants are UTC; cohort-local date/time/timezone are retained for explanation and DST audit.
- Scheduler delay changes actual `unlockedAt` but never the intended `scheduledUnlockAt`.
- A content edit cannot move an unlock time. Schedule changes and content revisions are separate operations.
- Cancellation of an unreleased teaching requires an explicit member communication and replacement/skip policy; deletion is not allowed.

## Edge-case policy table to approve

| Event                | Access now                                | Future unlocks                                   | Cohort position            | Historical unlocks                   |
| -------------------- | ----------------------------------------- | ------------------------------------------------ | -------------------------- | ------------------------------------ |
| Cancel at period end | Allowed until paid-through time           | Continue until policy cutoff                     | Retained                   | Retained; readable while allowed     |
| Payment failure      | Decide grace policy                       | Decide continue/freeze                           | Never silently reset       | Retained                             |
| Refund/dispute       | Decide immediate vs period-end revocation | Stop unless explicitly allowed                   | Retained                   | Retained; readability follows access |
| Plan interval switch | Normally unchanged                        | Continue                                         | Unchanged                  | Retained                             |
| Pause                | Decide billing/provider support           | Decide continue/freeze                           | Retained                   | Retained                             |
| Rejoin same program  | Decide resume vs new cohort               | Based on selected rule                           | Preserve old enrollment    | Never overwrite                      |
| Cohort transfer      | Access follows approved effective time    | New schedule with overlap rule                   | Linked old/new enrollments | Old unlocks retained                 |
| Account suspension   | Denied                                    | Jobs may record expected state but grant nothing | Retained                   | Retained, unreadable                 |
