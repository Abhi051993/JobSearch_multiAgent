---
description: Search all job boards worldwide for new C++ / HFT roles
---

Run a full portal scan for new low-latency C++ / electronic trading roles.
Discovery only — do not evaluate, score, or apply to anything.

## Steps

1. **ATS scan first** (zero tokens, hits employer job boards directly):

   ```
   node scan.mjs
   ```

   This covers the enterprise ATS platforms banks use — Citi and Barclays
   (Radancy), JP Morgan (Oracle HCM), Morgan Stanley and Deutsche Bank
   (Workday) — plus every company in `portals.yml` with a Greenhouse, Ashby,
   or Lever board.

2. **Then fill the gaps.** Read `modes/_shared.md` + `modes/scan.md` and run
   Level 3 discovery over `search_queries` for portals with no API:
   eFinancialCareers, Naukri, iimjobs, LinkedIn.

   Be aware the search backend frequently ignores `site:` filters — verify that
   results actually come from the portal you asked for before trusting them.

3. **Deduplicate** against `data/scan-history.tsv`, `data/pipeline.md`, and
   `data/applications.md`.

4. **Filter by title** using `title_filter` in `portals.yml`. Apply the scoring
   rules in `modes/_profile.md`: C++ must be the primary language. Mark
   Java-primary, Python-primary, and non-engineering titles as **off-profile**
   and list them separately — never present them as matches.

5. **Record everything**: new roles to `data/pipeline.md`, every URL seen to
   `data/scan-history.tsv` (added / skipped_title / skipped_dup /
   skipped_expired).

6. **Report** grouped by location in priority order — India, Hong Kong,
   Singapore, London, Netherlands, Germany, Japan, USA, Canada — with a direct
   apply link for every role and a count per region.

Finish by reminding me that `/career-ops pipeline` scores these against my CV.
