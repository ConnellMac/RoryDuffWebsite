# Database schema

## Conventions

- Firestore document IDs are opaque. External identifiers are stored in explicit fields.
- Timestamps are server timestamps in UTC. Named IANA timezones preserve scheduling intent.
- Documents include `createdAt`, `updatedAt`, and where relevant `createdBy`, `updatedBy`, `status`, `schemaVersion`, and an optimistic concurrency/version field for admin edits.
- Public slugs are normalized, unique within their content type, and protected by redirect history.
- Currency uses integer minor units plus ISO currency code.
- Sensitive text is not copied into analytics or logs.
- Collections below are a logical proposal; exact indexes and limits must be validated against real query patterns.

## Identity and access

### `users/{uid}`

Profile and onboarding record.

- `email`, `fullName`, `photoUrl`
- `status`: `active | suspended | deletion_pending | deleted`
- `roleVersion`: optional cache-version pointer used to invalidate custom claims; role assignments are not user-editable and are authoritative in `adminRoleAssignments`
- `locale`, `timezone`
- `background` (bounded onboarding text with explicit privacy classification)
- `countryCode`, `region`
- `sacredSiteId` (reference only; do not duplicate Site fields)
- `onboarding`: `{state, completedAt, version}`
- `communicationPreferences`: categories and consent timestamps
- Stripe identifiers may be stored in a server-only companion document if rules cannot safely hide fields.

### `users/{uid}/private/profile`

Server-only sensitive metadata such as Stripe customer reference, support flags, and deletion workflow state. Ordinary clients cannot read it directly.

### `adminRoleAssignments/{assignmentId}`

- `uid`, `role`, `scope`, `grantedBy`, `grantedAt`, `revokedAt`

Initial role bundles are `super_admin`, `content_admin`, and `member_support_operations`. Capabilities, not labels alone, drive authorization so the bundles remain separate without building a large policy engine. Additional standalone moderator roles are deferred until native discussions require them.

## Billing and entitlement

### `billingPlans/{planKey}` (server read; privileged configuration writes)

- `planKey`: `sacred_path_monthly | sacred_path_annual`
- `currency`: `USD`
- `displayAmountMinor`: planning values `1999` and `19900`
- `interval`: `month | year`
- `stripePriceIdByEnvironment`, `active`, `configurationVersion`
- `accessProduct`: `sacred_path` for both plans

This central configuration is for display and validated server checkout selection. Stripe remains authoritative for the actual charge. Editing plan configuration is a high-risk administrative operation, not ordinary content editing, and existing subscriptions retain their Stripe Price.

### `billingCustomers/{uid}` (server only)

- `stripeCustomerId`
- `defaultCurrency`
- `lastSyncedAt`

### `subscriptions/{stripeSubscriptionId}` (server writes)

- `uid`, `stripeCustomerId`
- `priceId`, `planInterval`: `month | year`
- `status`: normalized Stripe state
- `currentPeriodStart`, `currentPeriodEnd`
- `cancelAtPeriodEnd`, `canceledAt`, `endedAt`
- `latestStripeEventCreated`, `lastSyncedAt`

### `entitlements/{uid}`

Fast authorization projection, written only by trusted billing logic.

- `product`: `sacred_path`
- `billingState`: normalized status used to explain why access changed
- `accessAllowed`: boolean used by authorization checks
- `sourceSubscriptionId`
- `validFrom`, `validUntil`
- `reason`, `overrideExpiresAt`, `version`, `updatedAt`

`accessAllowed` prevents every reader from interpreting Stripe states differently. The billing policy determines it centrally. Manual overrides require a reason, actor, expiry, and audit event and cannot be created by cohort/content admins.

### `stripeEvents/{eventId}` (server only)

- `type`, `stripeCreatedAt`, `receivedAt`, `processingState`
- `attempts`, `processedAt`, `errorCode`
- Store only payload fields required for replay/audit or an encrypted/restricted reference, according to retention policy.

## Cohorts and curriculum

### `programs/{programId}`

- `title`, `slug`, `description`, `status`
- `currentCurriculumVersionId`

### `curriculumVersions/{versionId}`

- `programId`, `label`, `status`: `draft | published | retired`
- `publishedAt`, `publishedBy`

### `modules/{moduleId}`

- `curriculumVersionId`, `title`, `slug`, `sequence`
- `summary`, `status`

### `weeks/{weekId}`

- `moduleId`, `sequenceInModule`, `sequenceInProgram`
- `title`, `summary`

### `releases/{releaseId}`

- `weekId`, `sequenceInWeek` (expected values 1 and 2 unless explicitly overridden)
- `title`, `content`, `assetIds`
- `defaultSchedule`: local weekday/time intent; initial defaults are Tuesday and Thursday
- `emailContentVersionId`, `discussionSpaceRef`
- `required`, `itemType`: `teaching`
- `status`: `draft | scheduled | published | archived`
- `publishedVersion`, `publishedAt`

### `reflectionSteps/{stepId}`

- `moduleId`, `sequence`, `title`, `prompt`, `responseType`
- `required`, `status`

### `activities/{activityId}` and `milestones/{milestoneId}`

- `moduleId`, optional `weekId`, `title`, `instructions`, `sequence`
- `required`, `completionMode`, `status`

These give practical requirements and milestones stable identities so the progress denominator is explicit instead of inferred from page layout.

### `weeklySummaries/{summaryId}`

Canonical website summary content, separate from its delivery job.

- `curriculumVersionId`, `moduleId`, `weekId`
- `title`, `recapContent`, `releaseIds`, `discussionSpaceRef`
- `selectedExcerptIds`, `emailContentVersionId`
- `required`, `status`, `publishedVersion`, `publishedAt`

The summary renderer resolves current progress and meetup/weather at send/view time from authorized projections; those personalized values are not copied into the canonical curriculum document.

### `emailContentVersions/{emailContentVersionId}`

- `kind`: `release | weekly_summary | account | billing_service`
- `sourceContentRef`, `subject`, `preheader`, `htmlOrStructuredBody`, `plainTextBody`
- `status`: `draft | approved | retired`
- `sourceProvenance`, `approvedBy`, `approvedAt`, `version`

Teaching email versions require a canonical source content reference and human approval. AI assistance, if introduced later, records source provenance and never grants approval automatically.

### `cohorts/{cohortId}`

- `programId`, `curriculumVersionId`
- `name`, `status`: `draft | open | active | completed | archived`
- `timezone`, `startsAt`, `endsAt`
- `enrollmentOpensAt`, `enrollmentClosesAt`, `capacity`
- `scheduleVersion`
- `currentWeekIdProjection`, `currentWeekCalculatedAt` (repairable display/query projection; compiled schedules are authoritative)

### `cohorts/{cohortId}/weekSchedules/{weekId}`

- `weekId`, `moduleId`, `scheduleVersion`, `cohortTimezone`
- `release1Id`, `release1UnlockAt`, `release2Id`, `release2UnlockAt`
- `summaryId`, `summaryPublishAt`, `summarySendAt`
- `state`: `draft | scheduled | in_progress | completed | cancelled`

This document is the atomic weekly timing contract used to validate release order and the Sunday-summary window.

### `cohorts/{cohortId}/releaseSchedules/{releaseId}`

Compiled, immutable-on-activation schedule for the cohort's curriculum version.

- `releaseId`, `weekId`, `moduleId`, `scheduleVersion`
- `unlockAt`, `cohortLocalDate`, `cohortTimezone`
- `state`: `scheduled | released | cancelled`

Draft schedules may be regenerated. Once an unlock has occurred, its scheduled record cannot be moved or deleted; an audited correction creates a replacement/addendum where required.

### `enrollments/{enrollmentId}`

Use an opaque enrollment ID so transfers, withdrawals, completion, and rejoining retain separate historical records. A server-maintained current-enrollment pointer or transactional query enforces at most one current enrollment per user/program.

- `uid`, `programId`, `cohortId`, `curriculumVersionId`
- `state`: `pending | active | paused | completed | withdrawn`
- `assignedAt`, `startedAt`, `completedAt`
- `assignmentReason`, `scheduleAnchorAt`, `predecessorEnrollmentId`, `successorEnrollmentId`
- `entitlementUid`

Assignment chooses the earliest upcoming open cohort whose cutoff has not passed. If the cutoff has passed, the next later eligible cohort is used. A manual transfer creates linked historical/current enrollment records and an audit event; it never rewrites prior unlocks.

### `currentEnrollments/{uid_programId}` (server only)

- `uid`, `programId`, `enrollmentId`, `cohortId`, `updatedAt`

This transactional uniqueness guard/read model is authoritative only as a pointer; the referenced enrollment remains the durable history.

### `enrollments/{enrollmentId}/unlocks/{contentKey}`

- `contentType`: `teaching_release | weekly_summary`
- `contentId`, optional `releaseId` or `summaryId`, `weekId`, `moduleId`
- `unlockedAt`, `scheduledUnlockAt`, `sourceScheduleVersion`, `reason`
- Immutable after creation except audited repair fields.

This materialized model gives a durable personal archive and simple authorization. If availability is computed instead, an equivalent immutable schedule snapshot must prevent later cohort edits from rewriting history.

### `enrollments/{enrollmentId}/progress/{contentId}`

- `contentType`: `release | week | module`
- `state`: `not_started | started | completed`
- `startedAt`, `completedAt`, `lastViewedAt`
- `progressVersion`

The path key is a stable required-item ID. Completion writes are owner-scoped and validated against the enrollment's immutable curriculum version.

### `enrollments/{enrollmentId}/reflections/{stepId}`

- `stepId`, `moduleId`, `state`: `locked | available | started | completed`
- `response` (only if stakeholders require stored response text)
- `completedAt`, `updatedAt`

Trusted sequencing logic enforces prior required step completion for forward progress. Previously available/completed steps remain readable and editable according to the approved edit policy, so members can move backwards without unlocking future steps. Each step saves independently. There is no score or pass/fail field.

### `enrollments/{enrollmentId}/progressSummary/current`

- `completedRequiredUnlocked`, `totalRequiredUnlocked`, `percentCaughtUp`
- `completedRequiredProgramme`, `totalRequiredProgramme`, `percentOverallProgramme`
- `currentModuleId`, `currentWeekId`, `nextActionRef`
- `calculationVersion`, `calculatedAt`

This is a repairable server projection. Progress/reflection completion records are authoritative.

### `users/{uid}/notes/{noteId}`

- `contentRef`: `{type, id}`
- `body`, `createdAt`, `updatedAt`
- `deletedAt` for recoverable deletion if required

Only the owner can read/write through normal application paths. Admin/support access is denied by default and any approved exceptional access requires a separate audited workflow.

## Discussions

### `discussionSpaces/{spaceId}`

- `cohortId`, `moduleId`, `weekId`, optional `releaseId`
- `providerMode`: `external | native`
- `externalUrl` (server-validated allowlisted HTTPS URL when external)
- `nativeDiscussionId` (only when native)
- `status`: `scheduled | open | read_only | archived`
- `opensAt`, `closesAt`

Use deterministic `{cohortId}_{weekId}` IDs or enforce a server-side uniqueness guard so duplicate spaces cannot expose divergent threads.

Only one provider target is active at a time. Switching modes is audited and preserves the stable space ID used by releases and summaries.

### `discussionExcerpts/{excerptId}`

- `discussionSpaceId`, `sourceType`, `sourceContributionId` or restricted external source reference
- `contributorUid`, `excerptText`, `status`: `proposed | consented | approved | rejected | withdrawn | published`
- `consent`: `{grantedAt, policyVersion, scope, withdrawnAt}`
- `approvedBy`, `approvedAt`, `summaryWeekId`, `publishedAt`

Both contributor permission and editorial approval are required before summary use. Withdrawal behavior for already-sent email must be explained in the consent notice; future publication stops immediately.

### `discussionSpaces/{spaceId}/threads/{threadId}`

- `authorUid`, `title`, `body`, `status`
- `createdAt`, `updatedAt`, `replyCount`, `lastActivityAt`

### `discussionSpaces/{spaceId}/threads/{threadId}/replies/{replyId}`

- `authorUid`, `body`, `status`, `createdAt`, `updatedAt`

### `discussionReports/{reportId}` and `moderationActions/{actionId}`

- Scoped references, reason/status, actor, timestamps, and outcome.
- Content deletion should preserve the minimum evidence required by the moderation and retention policy.

## Sacred Network and meetups

### `sacredSites/{siteId}`

- `stableId`, `name`, `slug`, `status`: `active | inactive`
- `countryCode`, `region`
- `coordinates` as GeoPoint (`latitude`/`longitude`) with an explicit precision/privacy policy
- `timezone`, `description`

### `meetups/{meetupId}`

- `sacredSiteId`, `title`, `description`, `status`: `draft | scheduled | cancelled | completed`
- `localDate`, `localStartTime`, `timezone`, `startsAt`, `durationMinutes`, `endsAt`
- `meetingPlace`, `coordinates` (the meetup venue; not copied from the Sacred Site by assumption)
- `whatToExpect`, `whatToBring`, `weatherEnabled`
- `recurrenceSourceId`, `organizerDisplay`, `capacity`

`startsAt` is the compiled UTC instant; local fields/timezone preserve organizer intent and are validated together.

### `weatherCache/{cacheKey}`

- `provider`, `locationKey`, `forecastFor`, `fetchedAt`, `expiresAt`
- `summary`, `temperature`, `precipitation`, `units`
- `wind`, `uv`, `providerForecastWindowEndsAt`, `reliabilityState`
- Do not store provider data beyond licensing terms.

### `meetups/{meetupId}/preparationRecommendations/{ruleId}`

- `rulesetVersion`, `reasonCode`, `message`, `generatedAt`, `forecastCacheKey`

Recommendations are deterministic projections. Organizer-authored expectations/what-to-bring fields remain authoritative and are never overwritten.

## Public content

### `pages/{pageId}`, `articles/{articleId}`, `books/{bookId}`, `mediaItems/{mediaId}`

Common fields:

- `title`, `slug`, `status`, `content`, `excerpt`
- `seo`: `{title, description, canonicalUrl, noindex, socialImageId}`
- `publishedAt`, `authorRefs`, `taxonomyRefs`
- `source`: `{system, sourceId, sourceUrl, sourceUpdatedAt, checksum}`
- type-specific structured fields, documented before import

### `redirects/{redirectId}`

- `fromPath`, `toPath`, `statusCode`, `source`, `active`
- Validate against chains and loops.

### `navigationMenus/{menuId}` and `taxonomies/{taxonomyId}`

Versioned/editor-managed navigation and category/tag structures.

## Operations

### `emailJobs/{jobId}`

- `kind`, `uid`, `cohortId`, `weekId`, `templateVersion`
- optional `releaseId`, `summaryId`; `kind`: `release | weekly_summary | account | billing_service`
- `scheduledFor`, `state`, `attempts`, `nextAttemptAt`
- `logicalMessageKey`, `attemptNumber`, `providerMessageId`, `sentAt`, `errorCode`

`logicalMessageKey` is unique for `{kind, uid, cohortId, releaseId}` for teaching mail or `{kind, uid, cohortId, summaryId}` for Sunday mail. It deliberately excludes template version, so editing a template cannot create duplicate delivery. Template version is snapshotted on first queueing.

### `jobRuns/{jobId}`

- `type`, `logicalKey`, `state`, `leaseUntil`, `attempts`
- `scheduledFor`, `startedAt`, `completedAt`, `lastError`

### `auditEvents/{eventId}` (append-only, server only)

- `actorType`, `actorId`, `action`, `resourceType`, `resourceId`
- `occurredAt`, `requestId`, `metadata` (redacted and bounded)

### `migrationRuns/{runId}` and `migrationMappings/{mappingId}`

- Source snapshot, importer version, counts, validation results, state.
- Mappings join WordPress source IDs/URLs to destination IDs/slugs/checksums.

## Required query/index review

Before implementation, write query contracts for member archive, current cohort week, admin publishing lists, meetup search, discussion feeds, email queues, and migration reconciliation. Build only the necessary composite indexes and test Firestore rule behavior for every query.

## Relationship and deletion rules

- Firestore has no foreign keys. Trusted write services validate every referenced document and compatible lifecycle state in a transaction where atomicity is required.
- Published curriculum versions, cohorts with enrollments, enrollments, unlocks, audit events, and processed provider events are not hard-deleted by normal admin tools.
- Archiving a parent does not cascade-delete children. Read paths apply parent lifecycle rules explicitly.
- User deletion is an orchestrated workflow across Auth, profile, notes, discussions (anonymize/delete according to policy), enrollments, email jobs, Storage, and provider references.
- Media records carry visibility classification; references from public content cannot point to member/private assets and vice versa without validation.
- Every Storage object has an owning metadata record. Orphan detection and cleanup are background operations with a quarantine period.
- Taxonomy, navigation, author, release, module, week, cohort, site, and meetup references are validated before publish.
- Counters and denormalized fields are non-authoritative and repairable from source records.

## Scale and Firebase constraints to validate

- Avoid one scheduler query or transaction per entire membership; page/batch work with resumable cursors.
- Avoid hot documents for reply counts, global counters, leases, and weekly fan-out.
- Check Firestore document-size limits for rich text; large bodies/transcripts may need segmented records or Storage with protected metadata.
- Bound arrays such as roles, taxonomies, asset IDs, recipients, and attendees; use subcollections when growth is unbounded.
- Security Rules cannot safely perform arbitrary joins. Design authorization documents/paths for bounded rule lookups and test actual query shapes in the emulator.
- Firestore is not a search engine or durable task queue. Select explicit search and job-execution approaches before features that require them.
