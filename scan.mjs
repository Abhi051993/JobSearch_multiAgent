#!/usr/bin/env node

/**
 * scan.mjs — Zero-token portal scanner
 *
 * Fetches company job boards directly, applies title filters from
 * portals.yml, deduplicates against existing history, and appends new
 * offers to pipeline.md + scan-history.tsv.
 *
 * Supported platforms:
 *   Startup/prop-shop ATS  — Greenhouse, Ashby, Lever  (auto-detected from careers_url)
 *   Enterprise/bank ATS    — Radancy, Workday, Oracle HCM  (explicit `ats:` block)
 *
 * Banks do not use Greenhouse/Ashby/Lever, which is why they were
 * invisible to earlier versions of this scanner. Configure them with an
 * `ats:` block in portals.yml — see templates/portals.example.yml.
 *
 * Zero Claude API tokens — pure HTTP + JSON.
 *
 * Usage:
 *   node scan.mjs                  # scan all enabled companies
 *   node scan.mjs --dry-run        # preview without writing files
 *   node scan.mjs --company Citi   # scan a single company
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import yaml from 'js-yaml';
const parseYaml = yaml.load;

// ── Config ──────────────────────────────────────────────────────────

const PORTALS_PATH = 'portals.yml';
const SCAN_HISTORY_PATH = 'data/scan-history.tsv';
const PIPELINE_PATH = 'data/pipeline.md';
const APPLICATIONS_PATH = 'data/applications.md';

// Ensure required directories exist (fresh setup)
mkdirSync('data', { recursive: true });

const CONCURRENCY = 10;
const FETCH_TIMEOUT_MS = 10_000;

// Named --location presets. Values are matched as case-insensitive
// substrings against each posting's location string.
const LOCATION_PRESETS = {
  india: ['india', 'mumbai', 'pune', 'bengaluru', 'bangalore', 'gurgaon', 'gurugram',
          'hyderabad', 'chennai', 'delhi', 'noida', 'ahmedabad', 'gift city',
          'gandhinagar', 'kolkata', 'remote'],
  apac: ['india', 'mumbai', 'pune', 'bengaluru', 'bangalore', 'gurgaon', 'hong kong',
         'singapore', 'tokyo', 'japan', 'shanghai', 'sydney', 'australia'],
  emea: ['london', 'united kingdom', 'amsterdam', 'netherlands', 'frankfurt', 'germany',
         'paris', 'france', 'zurich', 'switzerland', 'dublin', 'ireland', 'prague'],
  us: ['united states', 'new york', 'chicago', 'austin', 'jersey city', 'houston', 'miami'],
};

// ── API detection ───────────────────────────────────────────────────

function detectApi(company) {
  // Explicit enterprise ATS block (Radancy / Workday / Oracle HCM).
  // Checked first: banks and exchanges never expose a Greenhouse board.
  if (company.ats && ATS_ADAPTERS[company.ats.type]) {
    return { type: 'ats', cfg: company.ats };
  }

  // Greenhouse: explicit api field
  if (company.api && company.api.includes('greenhouse')) {
    return { type: 'greenhouse', url: company.api };
  }

  const url = company.careers_url || '';

  // Ashby
  const ashbyMatch = url.match(/jobs\.ashbyhq\.com\/([^/?#]+)/);
  if (ashbyMatch) {
    return {
      type: 'ashby',
      url: `https://api.ashbyhq.com/posting-api/job-board/${ashbyMatch[1]}?includeCompensation=true`,
    };
  }

  // Lever
  const leverMatch = url.match(/jobs\.lever\.co\/([^/?#]+)/);
  if (leverMatch) {
    return {
      type: 'lever',
      url: `https://api.lever.co/v0/postings/${leverMatch[1]}`,
    };
  }

  // Greenhouse EU boards
  const ghEuMatch = url.match(/job-boards(?:\.eu)?\.greenhouse\.io\/([^/?#]+)/);
  if (ghEuMatch && !company.api) {
    return {
      type: 'greenhouse',
      url: `https://boards-api.greenhouse.io/v1/boards/${ghEuMatch[1]}/jobs`,
    };
  }

  return null;
}

// ── API parsers ─────────────────────────────────────────────────────

function parseGreenhouse(json, companyName) {
  const jobs = json.jobs || [];
  return jobs.map(j => ({
    title: j.title || '',
    url: j.absolute_url || '',
    company: companyName,
    location: j.location?.name || '',
  }));
}

function parseAshby(json, companyName) {
  const jobs = json.jobs || [];
  return jobs.map(j => ({
    title: j.title || '',
    url: j.jobUrl || '',
    company: companyName,
    location: j.location || '',
  }));
}

function parseLever(json, companyName) {
  if (!Array.isArray(json)) return [];
  return json.map(j => ({
    title: j.text || '',
    url: j.hostedUrl || '',
    company: companyName,
    location: j.categories?.location || '',
  }));
}

const PARSERS = { greenhouse: parseGreenhouse, ashby: parseAshby, lever: parseLever };

// ── Enterprise ATS adapters (banks, exchanges, vendors) ─────────────
//
// Unlike the Greenhouse/Ashby/Lever boards used by prop shops, these
// platforms need a per-vendor request shape. Each adapter takes the
// `ats:` block from portals.yml and returns a flat job array.

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&(?:#39|apos);/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchText(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      ...opts,
      headers: { 'User-Agent': BROWSER_UA, ...(opts.headers || {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Radancy Talent Brew (jobs.citi.com, search.jobs.barclays, ...).
 *
 * Keyword filtering only works through the URL *path* — the `Keyword`
 * query parameter on the AJAX endpoint is silently ignored, which
 * returns the company's entire req list. So: hit the path form, and if
 * the shell renders results client-side (Barclays), fall back to the
 * AJAX endpoint and lean on the title filter instead.
 */
async function atsRadancy(cfg, companyName) {
  const board = cfg.board.replace(/\/$/, '');
  const org = cfg.org ?? '1';
  const maxPages = cfg.max_pages ?? 2;
  const keywords = cfg.keywords?.length ? cfg.keywords : ['C++'];
  const jobs = [];
  const seenHere = new Set();

  const harvest = (html) => {
    let found = 0;
    for (const m of html.matchAll(/href="(\/job\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
      const href = m[1];
      const title = decodeEntities(m[2].replace(/<[^>]+>/g, ''));
      if (!title || seenHere.has(href)) continue;
      seenHere.add(href);
      found++;
      const city = (href.match(/^\/job\/([^/]+)\//) || [])[1] || '';
      jobs.push({
        title,
        url: board + href,
        company: companyName,
        location: city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      });
    }
    return found;
  };

  // Escape hatch: exact faceted search URLs copied from the careers site.
  // Radancy's location filter needs internal facet IDs that cannot be
  // constructed from a city name, so pasting the URL is the only way to
  // pin a search to one office.
  for (const verbatim of cfg.urls || []) {
    try {
      harvest(await fetchText(verbatim));
    } catch { /* URL stale — facet IDs change when offices are reorganised */ }
  }

  for (const keyword of keywords) {
    for (let page = 1; page <= maxPages; page++) {
      const pathUrl = `${board}/search-jobs/${encodeURIComponent(keyword)}/${org}/${page}`;
      let html;
      try {
        html = await fetchText(pathUrl);
      } catch {
        break;
      }
      const before = jobs.length;
      harvest(html);

      // Shell-only render: results arrive via AJAX. Fetch once, then stop
      // paginating this keyword — the AJAX list is not keyword-filtered.
      if (jobs.length === before && page === 1) {
        const q = new URLSearchParams({
          ActiveFacetID: '0', CurrentPage: '1', RecordsPerPage: '100',
          Distance: '50', RadiusUnitType: '0', Keyword: keyword, Location: '',
          ShowRadius: 'False', IsPagination: 'False', FacetType: '0',
          SearchResultsModuleName: 'Search Results',
          SearchFiltersModuleName: 'Search Filters',
          SortCriteria: '0', SortDirection: '0',
        });
        try {
          const json = JSON.parse(await fetchText(`${board}/search-jobs/results?${q}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
          }));
          harvest(json.results || '');
        } catch { /* board offline or shape changed */ }
        break;
      }

      const total = Number((html.match(/data-total-results="(\d+)"/) || [])[1] || 0);
      if (page * 15 >= total) break;
    }
  }
  return jobs;
}

/**
 * Workday CXS (ms.wd5, db.wd3, ...).
 *
 * Note: Workday's `searchText` tokenizer drops '+', so a bare "C++"
 * matches everything. Configure multi-word keywords ("c++ developer",
 * "low latency") and let the title filter do the real work.
 */
async function atsWorkday(cfg, companyName) {
  const host = `https://${cfg.tenant}.${cfg.host}.myworkdayjobs.com`;
  const endpoint = `${host}/wday/cxs/${cfg.tenant}/${cfg.site}/jobs`;
  const keywords = cfg.keywords?.length ? cfg.keywords : ['c++ developer'];
  const limit = cfg.limit ?? 20;
  const jobs = [];
  const seenHere = new Set();

  for (const searchText of keywords) {
    let json;
    try {
      json = JSON.parse(await fetchText(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ appliedFacets: {}, limit, offset: 0, searchText }),
      }));
    } catch {
      continue;
    }
    for (const j of json.jobPostings || []) {
      const path = j.externalPath || '';
      if (!path || seenHere.has(path)) continue;
      seenHere.add(path);
      jobs.push({
        title: j.title || '',
        url: `${host}/${cfg.site}${path}`,
        company: companyName,
        location: j.locationsText || '',
      });
    }
  }
  return jobs;
}

/** Oracle HCM recruiting API (jpmc.fa.oraclecloud.com, ...). */
async function atsOracle(cfg, companyName) {
  const keywords = cfg.keywords?.length ? cfg.keywords : ['C++'];
  const limit = cfg.limit ?? 25;
  const jobs = [];
  const seenHere = new Set();

  for (const keyword of keywords) {
    const finder = `findReqs;siteNumber=${cfg.site},keyword=${encodeURIComponent(keyword)},limit=${limit}`;
    const url = `https://${cfg.host}/hcmRestApi/resources/latest/recruitingCEJobRequisitions`
      + `?onlyData=true&expand=requisitionList&finder=${finder}`;
    let json;
    try {
      json = JSON.parse(await fetchText(url, { headers: { Accept: 'application/json' } }));
    } catch {
      continue;
    }
    for (const j of json.items?.[0]?.requisitionList || []) {
      if (!j.Id || seenHere.has(j.Id)) continue;
      seenHere.add(j.Id);
      jobs.push({
        title: j.Title || '',
        url: `https://${cfg.host}/hcmUI/CandidateExperience/en/sites/${cfg.site}/job/${j.Id}`,
        company: companyName,
        location: j.PrimaryLocation || '',
      });
    }
  }
  return jobs;
}

const ATS_ADAPTERS = { radancy: atsRadancy, workday: atsWorkday, oracle: atsOracle };

// ── Fetch with timeout ──────────────────────────────────────────────

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ── Title filter ────────────────────────────────────────────────────

function buildTitleFilter(titleFilter) {
  const positive = (titleFilter?.positive || []).map(k => k.toLowerCase());
  const negative = (titleFilter?.negative || []).map(k => k.toLowerCase());

  return (title) => {
    const lower = title.toLowerCase();
    const hasPositive = positive.length === 0 || positive.some(k => lower.includes(k));
    const hasNegative = negative.some(k => lower.includes(k));
    return hasPositive && !hasNegative;
  };
}

// ── Dedup ───────────────────────────────────────────────────────────

function loadSeenUrls() {
  const seen = new Set();

  // scan-history.tsv
  if (existsSync(SCAN_HISTORY_PATH)) {
    const lines = readFileSync(SCAN_HISTORY_PATH, 'utf-8').split('\n');
    for (const line of lines.slice(1)) { // skip header
      const url = line.split('\t')[0];
      if (url) seen.add(url);
    }
  }

  // pipeline.md — extract URLs from checkbox lines
  if (existsSync(PIPELINE_PATH)) {
    const text = readFileSync(PIPELINE_PATH, 'utf-8');
    for (const match of text.matchAll(/- \[[ x]\] (https?:\/\/\S+)/g)) {
      seen.add(match[1]);
    }
  }

  // applications.md — extract URLs from report links and any inline URLs
  if (existsSync(APPLICATIONS_PATH)) {
    const text = readFileSync(APPLICATIONS_PATH, 'utf-8');
    for (const match of text.matchAll(/https?:\/\/[^\s|)]+/g)) {
      seen.add(match[0]);
    }
  }

  return seen;
}

function loadSeenCompanyRoles() {
  const seen = new Set();
  if (existsSync(APPLICATIONS_PATH)) {
    const text = readFileSync(APPLICATIONS_PATH, 'utf-8');
    // Parse markdown table rows: | # | Date | Company | Role | ...
    for (const match of text.matchAll(/\|[^|]+\|[^|]+\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g)) {
      const company = match[1].trim().toLowerCase();
      const role = match[2].trim().toLowerCase();
      if (company && role && company !== 'company') {
        seen.add(`${company}::${role}`);
      }
    }
  }
  return seen;
}

// ── Pipeline writer ─────────────────────────────────────────────────

function appendToPipeline(offers) {
  if (offers.length === 0) return;

  let text = readFileSync(PIPELINE_PATH, 'utf-8');

  const line = (o) => `- [ ] ${o.url} | ${o.company} | ${o.title}${o.location ? ` | ${o.location}` : ''}`;

  // Find the pending section and append to it. Accept either language —
  // pipeline.md is user-owned and may have been translated.
  const marker = ['## Pendientes', '## Pending'].find(m => text.includes(m)) || '## Pendientes';
  const idx = text.indexOf(marker);
  if (idx === -1) {
    // No pending section — insert before the processed section
    const procIdx = ['## Procesadas', '## Processed']
      .map(m => text.indexOf(m)).filter(i => i !== -1).sort((a, b) => a - b)[0];
    const insertAt = procIdx === undefined ? text.length : procIdx;
    const block = `\n${marker}\n\n` + offers.map(line).join('\n') + '\n\n';
    text = text.slice(0, insertAt) + block + text.slice(insertAt);
  } else {
    // Find the end of existing Pendientes content (next ## or end)
    const afterMarker = idx + marker.length;
    const nextSection = text.indexOf('\n## ', afterMarker);
    const insertAt = nextSection === -1 ? text.length : nextSection;

    const block = '\n' + offers.map(line).join('\n') + '\n';
    text = text.slice(0, insertAt) + block + text.slice(insertAt);
  }

  writeFileSync(PIPELINE_PATH, text, 'utf-8');
}

const HISTORY_COLUMNS = ['url', 'title', 'company', 'date_seen', 'portal', 'status'];

function appendToScanHistory(offers, date) {
  // Ensure file + header exist
  if (!existsSync(SCAN_HISTORY_PATH)) {
    writeFileSync(SCAN_HISTORY_PATH, HISTORY_COLUMNS.join('\t') + '\n', 'utf-8');
  }

  // Honour the column order already in the file rather than assuming one.
  // Existing histories were written with a different order, and appending
  // blind would shift every field by one column.
  const existing = readFileSync(SCAN_HISTORY_PATH, 'utf-8');
  const header = existing.split('\n')[0].split('\t').map(h => h.trim());
  const columns = header.length >= 5 ? header : HISTORY_COLUMNS;

  const field = (o, name) => ({
    url: o.url,
    title: o.title,
    company: o.company,
    date_seen: date,
    first_seen: date,
    portal: o.source,
    status: 'added',
  }[name] ?? '');

  const lines = offers.map(o => columns.map(c => field(o, c)).join('\t')).join('\n') + '\n';

  if (existing.length > 0 && !existing.endsWith('\n')) appendFileSync(SCAN_HISTORY_PATH, '\n', 'utf-8');
  appendFileSync(SCAN_HISTORY_PATH, lines, 'utf-8');
}

// ── Parallel fetch with concurrency limit ───────────────────────────

async function parallelFetch(tasks, limit) {
  const results = [];
  let i = 0;

  async function next() {
    while (i < tasks.length) {
      const task = tasks[i++];
      results.push(await task());
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => next());
  await Promise.all(workers);
  return results;
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const companyFlag = args.indexOf('--company');
  const filterCompany = companyFlag !== -1 ? args[companyFlag + 1]?.toLowerCase() : null;

  // --location accepts a comma-separated list of city/country substrings.
  // Named presets keep the common cases short (see LOCATION_PRESETS).
  const locFlag = args.indexOf('--location');
  const locRaw = locFlag !== -1 ? args[locFlag + 1] : null;
  const locTerms = locRaw
    ? (LOCATION_PRESETS[locRaw.toLowerCase()] || locRaw.split(','))
        .map(t => t.trim().toLowerCase()).filter(Boolean)
    : null;
  // A job with no location string is kept: better a false positive the user
  // can discard than a silently dropped role.
  const locationFilter = job =>
    !locTerms || !job.location || locTerms.some(t => job.location.toLowerCase().includes(t));

  // 1. Read portals.yml
  if (!existsSync(PORTALS_PATH)) {
    console.error('Error: portals.yml not found. Run onboarding first.');
    process.exit(1);
  }

  const config = parseYaml(readFileSync(PORTALS_PATH, 'utf-8'));
  const companies = config.tracked_companies || [];
  const titleFilter = buildTitleFilter(config.title_filter);

  // 2. Filter to enabled companies with detectable APIs
  const targets = companies
    .filter(c => c.enabled !== false)
    .filter(c => !filterCompany || c.name.toLowerCase().includes(filterCompany))
    .map(c => ({ ...c, _api: detectApi(c) }))
    .filter(c => c._api !== null);

  const skippedCount = companies.filter(c => c.enabled !== false).length - targets.length;

  console.log(`Scanning ${targets.length} companies via API (${skippedCount} skipped — no API detected)`);
  if (dryRun) console.log('(dry run — no files will be written)\n');

  // 3. Load dedup sets
  const seenUrls = loadSeenUrls();
  const seenCompanyRoles = loadSeenCompanyRoles();

  // 4. Fetch all APIs
  const date = new Date().toISOString().slice(0, 10);
  let totalFound = 0;
  let totalFiltered = 0;
  let totalOutOfArea = 0;
  let totalDupes = 0;
  const newOffers = [];
  const errors = [];

  const tasks = targets.map(company => async () => {
    const { type, url, cfg } = company._api;
    try {
      const jobs = type === 'ats'
        ? await ATS_ADAPTERS[cfg.type](cfg, company.name)
        : PARSERS[type](await fetchJson(url), company.name);
      totalFound += jobs.length;

      for (const job of jobs) {
        if (!titleFilter(job.title)) {
          totalFiltered++;
          continue;
        }
        if (!locationFilter(job)) {
          totalOutOfArea++;
          continue;
        }
        if (seenUrls.has(job.url)) {
          totalDupes++;
          continue;
        }
        const key = `${job.company.toLowerCase()}::${job.title.toLowerCase()}`;
        if (seenCompanyRoles.has(key)) {
          totalDupes++;
          continue;
        }
        // Mark as seen to avoid intra-scan dupes
        seenUrls.add(job.url);
        seenCompanyRoles.add(key);
        newOffers.push({ ...job, source: type === 'ats' ? `${cfg.type}-ats` : `${type}-api` });
      }
    } catch (err) {
      errors.push({ company: company.name, error: err.message });
    }
  });

  await parallelFetch(tasks, CONCURRENCY);

  // 5. Write results
  if (!dryRun && newOffers.length > 0) {
    appendToPipeline(newOffers);
    appendToScanHistory(newOffers, date);
  }

  // 6. Print summary
  console.log(`\n${'━'.repeat(45)}`);
  console.log(`Portal Scan — ${date}`);
  console.log(`${'━'.repeat(45)}`);
  console.log(`Companies scanned:     ${targets.length}`);
  console.log(`Total jobs found:      ${totalFound}`);
  console.log(`Filtered by title:     ${totalFiltered} removed`);
  if (locTerms) {
    console.log(`Outside ${(locRaw + ':').padEnd(13)} ${totalOutOfArea} removed`);
  }
  console.log(`Duplicates:            ${totalDupes} skipped`);
  console.log(`New offers added:      ${newOffers.length}`);

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    for (const e of errors) {
      console.log(`  ✗ ${e.company}: ${e.error}`);
    }
  }

  if (newOffers.length > 0) {
    console.log('\nNew offers:');
    for (const o of newOffers) {
      console.log(`  + ${o.company} | ${o.title} | ${o.location || 'N/A'}`);
    }
    if (dryRun) {
      console.log('\n(dry run — run without --dry-run to save results)');
    } else {
      console.log(`\nResults saved to ${PIPELINE_PATH} and ${SCAN_HISTORY_PATH}`);
    }
  }

  console.log(`\n→ Run /career-ops pipeline to evaluate new offers.`);
  console.log('→ Share results and get help: https://discord.gg/8pRpHETxa4');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
