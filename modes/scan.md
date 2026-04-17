# Mode: scan — Portal Scanner (Job Discovery)

Scans configured job portals, filters by title relevance, and adds new offers to the pipeline for evaluation.

**IMPORTANT: This mode ONLY discovers and lists jobs with their match relevance. It does NOT evaluate, apply, or take any action on behalf of the candidate. The candidate reviews the list and decides what to evaluate.**

## Recommended execution

Run as a subagent to avoid consuming main context:

```
Agent(
    subagent_type="general-purpose",
    prompt="[content of this file + specific data]",
    run_in_background=True
)
```

## Configuration

Read `portals.yml` which contains:
- `search_queries`: WebSearch queries with `site:` filters per portal (broad discovery)
- `tracked_companies`: Companies with `careers_url` for direct navigation
- `title_filter`: Positive/negative/seniority_boost keywords for title filtering

## Location Priority

Search in this order of priority per `config/profile.yml`:
1. **India** — Pune, Mumbai, Bangalore, Hyderabad, Delhi NCR (+ Remote)
2. **Hong Kong** — HFT/sell-side roles
3. **Singapore** — HFT prop shops (Optiver, IMC, Jump, etc.)
4. **London** — Investment banks electronic trading, HFT firms
5. **Netherlands (Amsterdam)** — Optiver, Flow Traders, IMC HQ
6. **Germany** — Frankfurt/Munich (Deutsche Bank, Allianz, prop shops)
7. **Japan** — Tokyo (Jane Street, Goldman Sachs Tokyo, local firms)
8. **USA** — Chicago/NYC (Citadel, HRT, DRW, SIG, Tower)
9. **Canada** — Toronto (TD, RBC algo trading, fintech)

When displaying results, group by location if possible, India first.

## Discovery Strategy (3 levels)

### Level 1 — Direct Playwright (PRIMARY)

**For each company in `tracked_companies`:** Navigate to its `careers_url` with Playwright (`browser_navigate` + `browser_snapshot`), read ALL visible job listings, extract title + URL. Most reliable because:
- Real-time (no Google cache)
- Works with SPAs (Ashby, Lever, Workday)
- Instantly detects new postings

Each company MUST have `careers_url` in portals.yml. If missing, search for it and save it.

### Level 2 — ATS APIs (COMPLEMENTARY)

For companies with a public API or structured feed:
- **Greenhouse**: `https://boards-api.greenhouse.io/v1/boards/{slug}/jobs`
- **Ashby**: POST GraphQL to `https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams`
- **Lever**: `https://api.lever.co/v0/postings/{slug}?mode=json`
- **BambooHR**: list `https://{company}.bamboohr.com/careers/list`; detail `https://{company}.bamboohr.com/careers/{id}/detail`
- **Workday**: POST JSON to `https://{company}.{shard}.myworkdayjobs.com/wday/cxs/{company}/{site}/jobs`

### Level 3 — WebSearch queries (BROAD DISCOVERY)

`search_queries` with `site:` filters cover portals transversally. Useful to discover NEW companies not yet in `tracked_companies`, but results may be stale (Google caches for weeks).

**Execution priority:**
1. Level 1: Playwright → all `tracked_companies` with `careers_url`
2. Level 2: API → all `tracked_companies` with `api:`
3. Level 3: WebSearch → all `search_queries` with `enabled: true`

All levels run and results merge + deduplicate.

## Workflow

1. **Read config**: `portals.yml`
2. **Read history**: `data/scan-history.tsv` → already-seen URLs
3. **Read dedup sources**: `data/applications.md` + `data/pipeline.md`

4. **Level 1 — Playwright scan** (parallel batches of 3-5):
   For each company in `tracked_companies` with `enabled: true` and `careers_url`:
   a. `browser_navigate` to `careers_url`
   b. `browser_snapshot` to read all job listings
   c. Navigate department/filter sections if present
   d. Extract: `{title, url, company, location}`
   e. If results paginate, navigate additional pages
   f. If `careers_url` fails (404, redirect), use `scan_query` as fallback

5. **Level 2 — ATS APIs** (parallel):
   For each company in `tracked_companies` with `api:`:
   a. WebFetch the API URL
   b. Infer provider from domain if not explicit
   c. For Ashby: POST GraphQL with `operationName: ApiJobBoardWithTeams`
   d. For Workday: POST JSON with `{"appliedFacets":{},"limit":20,"offset":0,"searchText":""}`
   e. Extract and normalize: `{title, url, company, location}`

6. **Level 3 — WebSearch queries** (parallel if possible):
   For each query in `search_queries` with `enabled: true`:
   a. Run WebSearch with the defined `query`
   b. Extract `{title, url, company, location}` from each result
   c. Merge into candidate list

7. **Filter by title** using `title_filter` from `portals.yml`:
   - At least 1 `positive` keyword must appear in title (case-insensitive)
   - 0 `negative` keywords must appear
   - `seniority_boost` keywords increase priority but are not required

8. **Deduplicate** against 3 sources:
   - `scan-history.tsv` → exact URL already seen
   - `applications.md` → company + normalized role already evaluated
   - `pipeline.md` → exact URL already pending

9. **Verify liveness of Level 3 results** — BEFORE adding to pipeline:

   WebSearch results may be stale. For each new URL from Level 3 (sequential — NEVER Playwright in parallel):
   a. `browser_navigate` to the URL
   b. `browser_snapshot` to read content
   c. Classify:
      - **Active**: job title visible + description + Apply/Submit button in main content
      - **Expired**: `?error=true` in URL (Greenhouse closed jobs), "no longer available", "position has been filled", empty page
   d. If expired: record in `scan-history.tsv` as `skipped_expired`, discard
   e. If active: proceed to step 10

10. **For each new verified offer passing filters**:
    a. Add to `pipeline.md` section "Pending": `- [ ] {url} | {company} | {title} | {location}`
    b. Record in `scan-history.tsv`: `{url}\t{date}\t{query_name}\t{title}\t{company}\tadded`

11. **Filtered by title**: record in `scan-history.tsv` with status `skipped_title`
12. **Duplicates**: record with status `skipped_dup`
13. **Expired (Level 3)**: record with status `skipped_expired`

## Output Summary

```
Portal Scan — {YYYY-MM-DD}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Queries run: N
Offers found: N total
Filtered by title (relevant): N
Duplicates (already seen): N
Expired (dead links): N
New offers added to pipeline.md: N

BY LOCATION:
  India:       N roles
  Hong Kong:   N roles
  Singapore:   N roles
  London:      N roles
  Netherlands: N roles
  Germany:     N roles
  Japan:       N roles
  USA:         N roles
  Canada:      N roles
  Other/Remote: N roles

NEW ROLES FOUND:
  + {company} | {title} | {location} | {portal}
  ...

→ Run /career-ops pipeline to evaluate pending offers and see match %.
→ Or paste any URL directly to evaluate it immediately.
```

## Scan History Format

`data/scan-history.tsv` tracks ALL seen URLs:

```
url	first_seen	portal	title	company	status
https://...	2026-04-17	Naukri — C++ Low Latency	Senior C++ Engineer	Optiver	added
https://...	2026-04-17	Greenhouse — C++ Trading	Junior Dev	BigCo	skipped_title
https://...	2026-04-17	LinkedIn India	C++ Engineer	FIS Global	skipped_dup
https://...	2026-04-17	eFinancialCareers	C++ HFT	ClosedCo	skipped_expired
```

## careers_url Maintenance

Known patterns by platform:
- **Ashby:** `https://jobs.ashbyhq.com/{slug}`
- **Greenhouse:** `https://job-boards.greenhouse.io/{slug}`
- **Lever:** `https://jobs.lever.co/{slug}`
- **Workday:** `https://{company}.{shard}.myworkdayjobs.com/{site}`
- **Custom:** Company's own careers URL

If `careers_url` is missing: search once, save it, use in future scans.
If `careers_url` returns 404: flag in output summary, try `scan_query` as fallback.
