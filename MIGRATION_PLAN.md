# Migration plan

## Principles

- WordPress remains unchanged until a separately approved cutover.
- Extract through read-only exports, database snapshots, APIs, or media copies approved by the site owner.
- Preserve source identifiers, URLs, timestamps, attribution, rights metadata, and checksums.
- Make import repeatable and idempotent; never rely on a one-off manual copy as the system of record.
- Validate content, security, accessibility, SEO, and redirects before changing traffic.
- Development never writes to WordPress. Even final extraction is read-only; traffic cutover and later decommissioning are separate approved operations.

## Phase 1: discovery and inventory

- Record WordPress core version, hosting/export access, multisite status, languages, and environments.
- Inventory post types, taxonomies, users/authors, menus, widgets, templates, plugins, shortcodes, custom fields, forms, comments, redirects, SEO configuration, and search behavior.
- Inventory Sacred Network and Sacred Path material separately, including current access restrictions.
- Inventory existing Sacred Sites as first-class candidates with stable IDs, country/region, coordinates, timezone, description, status, and source provenance; do not flatten Site data into user/member records.
- Measure item counts, media volume/types, maximum sizes, broken links, duplicates, and orphaned records.
- Map current URL patterns and identify high-value pages from analytics/search data.
- Identify personal/sensitive data and determine what is legally and operationally appropriate to migrate.
- Confirm content ownership and media licensing.
- Identify whether current WordPress content changes during rebuild and establish a delta/change-freeze strategy early; a final full snapshot alone may miss deletions, URL changes, or plugin-generated state.
- Treat plugin-rendered output, shortcodes, embeds, serialized fields, and filesystem media as separate discovery risks rather than assuming the WordPress API is complete.

Deliverable: signed-off inventory and migration scope, including exclusions.

## Phase 2: source snapshot and mapping

- Produce a versioned, read-only source snapshot with timestamp and checksum manifest.
- Define field mappings from every in-scope WordPress type/plugin field to the new content schema.
- Define mappings for pages, posts/articles, books, media, existing URLs/slugs, categories, relevant metadata, Sacred Network/Site content, events, and other Rory Duff material. No category is discarded merely because the new information architecture is not final.
- Define rich-text transformations for Gutenberg blocks, classic HTML, embeds, galleries, shortcodes, and internal links.
- Define author handling that does not accidentally create member accounts.
- Define identity matching without relying only on mutable or case-variant email addresses. Never merge WordPress users, Firebase users, and Stripe customers automatically when evidence conflicts.
- Create URL mapping rules and an explicit redirect table.
- Classify media as public, member-only, private, external, replace, or exclude.
- Treat imported source teaching as authored material. Migration or later AI-assisted email conversion may normalize/format it but must preserve provenance and cannot invent teachings or factual claims.

Deliverable: mapping specification and representative fixtures for each source variant.

## Phase 3: importer prototype

- Build later as a separate, versioned migration tool—not as runtime page rendering.
- Import into a non-production Firebase environment.
- Use stable source keys and checksums so reruns update safely and report conflicts.
- Quarantine malformed or unsafe content instead of silently dropping it.
- Sanitize HTML, reject executable embeds, validate external URLs, and rewrite internal links.
- Generate a machine-readable report of created, updated, unchanged, skipped, warning, and failed items.

Deliverable: repeatable dry run against a representative subset.

## Phase 4: full rehearsal

- Import the complete snapshot into staging.
- Reconcile counts by type, taxonomy, publication status, author, and media class.
- Crawl old and new URLs; verify redirects, canonicals, metadata, structured data, sitemaps, internal links, and status codes.
- Compare representative page rendering across templates and edge cases.
- Check accessibility and responsive media behavior.
- Verify member-only content remains protected in Firestore/Storage and cannot be indexed.
- Compare authorization classifications independently of content counts; source visibility/plugin rules may not map cleanly to public/member/private.
- Obtain editorial, product, security, and SEO sign-off.

Deliverable: rehearsal report with blocking defects and accepted exceptions.

## Phase 5: cutover preparation

- Agree change-freeze or delta-migration window.
- Lower DNS TTL if applicable and document domain/CDN/Vercel changes.
- Back up WordPress and verify rollback access.
- Prepare final export/delta process, redirect deployment, cache warming, sitemap submission, monitoring, and support communications.
- Define go/no-go thresholds and named decision owners.
- Rehearse rollback without deleting or mutating WordPress.

Deliverable: timed runbook and approved go/no-go checklist.

## Phase 6: final migration and cutover

- Capture final snapshot/delta and verify checksums.
- Run idempotent import and reconciliation.
- Run smoke tests for priority URLs, auth, checkout, entitlements, member content, admin, email, and media.
- Switch traffic only after go approval.
- Preserve WordPress in restricted/read-only form for rollback and audit according to policy.

## Phase 7: monitoring and decommission decision

- Monitor 404s, redirect chains, crawl/indexing, performance, errors, conversions, login/support issues, and protected-content leakage.
- Fix mappings through versioned migration/redirect changes.
- Compare search traffic and priority-page behavior over an agreed period.
- Decommission or further restrict WordPress only under a separate approved plan covering backups, records, DNS, and credentials.

## Reconciliation criteria

- Counts match expected in-scope totals or every exception is documented.
- Every migrated record retains source ID, source URL, source update time, and checksum.
- Priority URLs return correct content or a single intended redirect.
- No redirect loops/chains above the agreed limit.
- No mixed-content or broken internal asset links.
- No draft/private/paid source item becomes publicly accessible.
- Sampled content passes editorial and visual comparison.
- All imported HTML passes sanitization and unsafe-embed review.

## Rollback

- Trigger examples: authorization leak, materially broken checkout/access, widespread 5xx/404, failed data reconciliation, or severe SEO/configuration fault.
- Repoint traffic to the preserved WordPress site using the rehearsed mechanism.
- Stop outbound migration-related jobs and new writes where necessary.
- Preserve logs and migrated state for diagnosis; do not destroy evidence.
- Communicate status and retry only after fixes and a new go/no-go review.

## Unresolved migration questions

- WordPress access method and whether production can provide a safe snapshot.
- Exact plugins/custom types and the current Sacred Path/member implementation.
- Whether WordPress users, memberships, orders, comments, forms, and mailing lists are in scope. Public pages/posts, books, research/articles, media, Sacred Network content, important URLs, and relevant metadata are presumed in scope pending inventory.
- Password migration feasibility; assume users may require account activation/reset because password hashes may not be portable or appropriate.
- Source-of-truth and conflict policy for WordPress user/member records versus Stripe billing records, including duplicate emails and subscriptions without matching users.
- URL and domain strategy, multilingual behavior, and canonical ownership.
- Media rights, storage budget, transformations, and protected media classification.
- Whether historical discussion/community data should migrate.
- Analytics baseline, redirect owner, freeze window, and rollback duration.
- Whether deletion/tombstone events and post-cutoff WordPress edits require a delta feed, manual ledger, or strict publishing freeze.
