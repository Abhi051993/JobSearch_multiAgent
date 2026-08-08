#!/usr/bin/env node
/**
 * build-portal.mjs — Browsable local job portal generator.
 *
 * Reads data/pipeline.md, and writes a self-contained, filterable HTML
 * board to JobPortal/<YYYY-MM-DD>/index.html plus a hub at
 * JobPortal/index.html listing every day's portal.
 *
 * Open JobPortal/index.html (or a date folder's index.html) in any browser
 * to search, sort, and click through to apply. No server, no build step.
 *
 * Run manually:   node build-portal.mjs
 * Auto-refresh:   invoked by scan-background.bat after each scheduled scan.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PIPELINE = 'data/pipeline.md';
const ROOT = 'JobPortal';
const TODAY = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local tz

// ── Parse pipeline.md ───────────────────────────────────────────────
function parse() {
  const text = readFileSync(PIPELINE, 'utf8');
  const out = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^- \[([ x])\] (.+)$/);
    if (!m) continue;
    const parts = m[2].split('|').map(s => s.trim());
    const urlIdx = parts.findIndex(p => /^https?:\/\//.test(p));
    if (urlIdx === -1) continue;
    const scoreIdx = parts.findIndex(p => /^\d(\.\d)?\/5$/.test(p));
    const url = parts[urlIdx];
    const mid = parts.slice(urlIdx + 1, scoreIdx === -1 ? undefined : scoreIdx);
    const company = mid[0] || '—';
    const role = mid[1] || '—';
    const location = mid[2] || '';
    const score = scoreIdx === -1 ? null : parseFloat(parts[scoreIdx]);
    const note = scoreIdx === -1 ? '' : parts.slice(scoreIdx + 1).join(' | ')
      .replace(/PDF [✅❌]/g, '').replace(/^\(|\)$/g, '').trim();
    out.push({ url, company, role, location, score, note });
  }
  return out;
}

// ── Region + fit classification ─────────────────────────────────────
const REGIONS = [
  ['India', /india|mumbai|pune|bengaluru|bangalore|gurgaon|gurugram|hyderabad|chennai|delhi|noida|ahmedabad|gift|gandhinagar|kolkata/i],
  ['Hong Kong', /hong kong/i],
  ['Singapore', /singapore/i],
  ['UK', /london|united kingdom|remote, uk|bournemouth|dorset|\buk\b/i],
  ['Netherlands', /amsterdam|netherlands/i],
  ['Europe', /prague|athens|greece|zug|warsaw|madrid|frankfurt|denmark|dublin|paris/i],
  ['USA', /new york|chicago|austin|jersey|houston|miami|boulder|united states|, ny|, il|, tx|, nj/i],
  ['Canada', /montreal|mississauga|toronto|canada/i],
  ['UAE', /abu dhabi|dubai|uae/i],
  ['Asia (other)', /shanghai|china|tokyo|japan|sydney|australia|taipei|taiwan/i],
];
function regionOf(loc) {
  if (/mississauga|montreal|toronto|canada/i.test(loc)) return 'Canada';
  for (const [name, re] of REGIONS) if (re.test(loc)) return name;
  return 'Other';
}
const REGION_ORDER = ['India', 'Hong Kong', 'Singapore', 'UK', 'Netherlands', 'Europe', 'UAE', 'USA', 'Canada', 'Asia (other)', 'Other'];

function fitOf(score) {
  if (score === null) return { key: 'unscored', label: 'Unscored' };
  if (score >= 4.4) return { key: 'apply', label: 'Apply now' };
  if (score >= 4.0) return { key: 'strong', label: 'Strong' };
  if (score >= 3.4) return { key: 'consider', label: 'Consider' };
  return { key: 'skip', label: 'Skip' };
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cleanLoc = s => s.replace(/,\s*United States$/i, '').replace(/,\s*United Kingdom$/i, '').replace(/\s+/g, ' ').trim() || '—';

// ── Render one day's portal ─────────────────────────────────────────
function renderPortal(rows, date) {
  rows.forEach(r => { r.region = regionOf(r.region ? r.region : r.location); r.fit = fitOf(r.score); });
  rows.sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.company.localeCompare(b.company));

  const n = rows.length;
  const applyNow = rows.filter(r => r.fit.key === 'apply').length;
  const strong = rows.filter(r => r.score !== null && r.score >= 4.0).length;
  const regionsPresent = REGION_ORDER.filter(rg => rows.some(r => r.region === rg));

  const body = rows.map((r, i) => {
    const pct = r.score === null ? null : Math.round(r.score * 20);
    const search = esc((r.company + ' ' + r.role + ' ' + r.location + ' ' + r.region).toLowerCase());
    return `      <tr class="row" data-fit="${r.fit.key}" data-region="${esc(r.region)}" data-score="${r.score ?? -1}" data-search="${search}">
        <td class="c-rank">${i + 1}</td>
        <td class="c-score">${pct === null
          ? '<span class="chip chip--unscored">—</span>'
          : `<div class="meter" title="${r.score}/5"><span class="meter__bar meter__bar--${r.fit.key}" style="width:${pct}%"></span><b>${pct}%</b></div>`}</td>
        <td class="c-fit"><span class="chip chip--${r.fit.key}">${r.fit.label}</span></td>
        <td class="c-co">${esc(r.company)}</td>
        <td class="c-role">${esc(r.role)}</td>
        <td class="c-loc"><span class="rg">${esc(r.region)}</span>${esc(cleanLoc(r.location))}</td>
        <td class="c-note">${esc(r.note)}</td>
        <td class="c-apply"><a class="apply" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">Apply&nbsp;&rarr;</a></td>
      </tr>`;
  }).join('\n');

  const regionOpts = regionsPresent.map(rg =>
    `<button class="filter" type="button" data-region="${esc(rg)}" aria-pressed="false">${esc(rg)} <b>${rows.filter(r => r.region === rg).length}</b></button>`).join('');

  return PAGE({ date, n, applyNow, strong, regionsN: regionsPresent.length, tableBody: body, regionOpts });
}

function PAGE({ date, n, applyNow, strong, regionsN, tableBody, regionOpts }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Job Portal — ${date}</title>
<style>
:root{
  --ground:#eef1f5; --surface:#fff; --surface2:#f6f8fb; --ink:#0f1620; --soft:#5b6675; --rule:#d6dde6;
  --accent:#1f4e8c; --accent-ink:#fff;
  --apply:#0e6b52; --strong:#16644a; --consider:#8a5a05; --skip:#8e3b38; --unscored:#5b6675;
  --apply-bg:#dcefe8; --strong-bg:#e2f0ea; --consider-bg:#f6ebd8; --skip-bg:#f6e4e3; --unscored-bg:#eceff3;
  --shadow:0 1px 2px rgba(15,22,32,.06),0 8px 24px -18px rgba(15,22,32,.3);
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --ground:#0b1016; --surface:#141c26; --surface2:#19222e; --ink:#e3e9f0; --soft:#8794a5; --rule:#25313f;
  --accent:#7badec; --accent-ink:#0b1016;
  --apply:#5dbe93; --strong:#5dbe93; --consider:#dca84c; --skip:#e58079; --unscored:#8794a5;
  --apply-bg:#123024; --strong-bg:#12261f; --consider-bg:#2a2114; --skip-bg:#2b1918; --unscored-bg:#1b232e;
  --shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px -18px rgba(0,0,0,.8);
}}
:root[data-theme="dark"]{
  --ground:#0b1016; --surface:#141c26; --surface2:#19222e; --ink:#e3e9f0; --soft:#8794a5; --rule:#25313f;
  --accent:#7badec; --accent-ink:#0b1016;
  --apply:#5dbe93; --strong:#5dbe93; --consider:#dca84c; --skip:#e58079; --unscored:#8794a5;
  --apply-bg:#123024; --strong-bg:#12261f; --consider-bg:#2a2114; --skip-bg:#2b1918; --unscored-bg:#1b232e;
  --shadow:0 1px 2px rgba(0,0,0,.4),0 8px 24px -18px rgba(0,0,0,.8);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--ground);color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}
.wrap{max-width:1240px;margin:0 auto;padding:0 18px 64px}
a.home{display:inline-block;margin-top:18px;font-size:12px;color:var(--soft);text-decoration:none;font-family:ui-monospace,Consolas,monospace}
a.home:hover{color:var(--accent)}
.mast{padding:8px 0 18px;border-bottom:1px solid var(--rule)}
.eyebrow{font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--soft);margin:0 0 8px}
h1{font-size:clamp(24px,3.5vw,34px);line-height:1.1;letter-spacing:-.02em;font-weight:680;margin:0 0 10px}
.sub{margin:0;color:var(--soft);max-width:64ch}
.tally{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.tally span{font-family:ui-monospace,Consolas,monospace;font-size:12px;font-variant-numeric:tabular-nums;padding:5px 10px;border-radius:4px;border:1px solid var(--rule);background:var(--surface);color:var(--soft)}
.tally b{color:var(--ink);font-weight:640}
.controls{background:var(--ground);padding:12px 0;border-bottom:1px solid var(--rule);display:flex;flex-wrap:wrap;gap:9px;align-items:center}
#q{flex:1 1 240px;min-width:0;padding:9px 12px;font:inherit;font-size:14px;color:var(--ink);background:var(--surface);border:1px solid var(--rule);border-radius:5px}
#q::placeholder{color:var(--soft)}
#q:focus-visible,.filter:focus-visible,.apply:focus-visible,th.sortable:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.filters{display:flex;gap:6px;flex-wrap:wrap}
.filter{font:inherit;font-size:12.5px;padding:7px 11px;cursor:pointer;background:var(--surface);color:var(--soft);border:1px solid var(--rule);border-radius:5px}
.filter b{color:var(--ink);font-variant-numeric:tabular-nums}
.filter[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.filter[aria-pressed="true"] b{color:var(--accent-ink)}
.filters--fit{margin-right:auto}
.tablewrap{overflow:auto;max-height:calc(100vh - 140px);margin-top:16px;border:1px solid var(--rule);border-radius:8px;box-shadow:var(--shadow);background:var(--surface)}
table{width:100%;border-collapse:separate;border-spacing:0;min-width:920px}
thead th{position:sticky;top:0;z-index:4;background:var(--surface2);text-align:left;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--soft);font-weight:640;padding:10px 12px;border-bottom:1px solid var(--rule);white-space:nowrap}
th.sortable{cursor:pointer;user-select:none}
th.sortable:hover{color:var(--ink)}
th .arw{opacity:.4;font-size:10px}
th[aria-sort="descending"] .arw,th[aria-sort="ascending"] .arw{opacity:1;color:var(--accent)}
tbody td{padding:11px 12px;border-bottom:1px solid var(--rule);vertical-align:top}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover{background:var(--surface2)}
.c-rank{color:var(--soft);font-variant-numeric:tabular-nums;font-family:ui-monospace,Consolas,monospace;font-size:12px;width:34px}
.c-score{width:132px}
.meter{position:relative;height:20px;background:var(--surface2);border:1px solid var(--rule);border-radius:4px;overflow:hidden;min-width:110px}
.meter__bar{position:absolute;left:0;top:0;bottom:0;opacity:.35}
.meter__bar--apply{background:var(--apply)} .meter__bar--strong{background:var(--strong)} .meter__bar--consider{background:var(--consider)} .meter__bar--skip{background:var(--skip)}
.meter b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:640;font-variant-numeric:tabular-nums}
.chip{display:inline-block;font-family:ui-monospace,Consolas,monospace;font-size:10.5px;letter-spacing:.03em;padding:3px 7px;border-radius:4px;white-space:nowrap}
.chip--apply{background:var(--apply-bg);color:var(--apply)} .chip--strong{background:var(--strong-bg);color:var(--strong)}
.chip--consider{background:var(--consider-bg);color:var(--consider)} .chip--skip{background:var(--skip-bg);color:var(--skip)} .chip--unscored{background:var(--unscored-bg);color:var(--unscored)}
.c-co{font-weight:600;min-width:130px}
.c-role{min-width:220px}
.c-loc{color:var(--soft);white-space:nowrap}
.rg{display:inline-block;font-family:ui-monospace,Consolas,monospace;font-size:10px;letter-spacing:.04em;text-transform:uppercase;color:var(--soft);background:var(--surface2);border:1px solid var(--rule);border-radius:3px;padding:1px 5px;margin-right:6px}
.c-note{color:var(--soft);font-size:12.5px;min-width:200px;max-width:320px}
.c-apply{text-align:right;white-space:nowrap}
.apply{font-size:13px;font-weight:560;text-decoration:none;color:var(--accent);border:1px solid var(--rule);border-radius:5px;padding:7px 13px;background:var(--surface2);display:inline-block}
.apply:hover{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
tr.hide{display:none}
.empty{padding:26px;color:var(--soft);text-align:center}
.foot{margin-top:26px;color:var(--soft);font-size:12.5px}
.foot code{font-family:ui-monospace,Consolas,monospace;background:var(--surface2);padding:1px 5px;border-radius:3px}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style>
</head>
<body>
<div class="wrap">
  <a class="home" href="../index.html">&larr; all portals</a>
  <header class="mast">
    <p class="eyebrow">C++ / Low-latency trading &middot; ${date}</p>
    <h1>Job Portal</h1>
    <p class="sub">Every role below was pulled live from an employer job board and scored against your CV. Sort, filter, and click <b>Apply</b> to open the posting. Nothing here is auto-applied &mdash; you decide.</p>
    <div class="tally">
      <span><b>${n}</b> roles</span>
      <span><b>${applyNow}</b> apply-now (&ge;88%)</span>
      <span><b>${strong}</b> strong (&ge;80%)</span>
      <span><b>${regionsN}</b> regions</span>
    </div>
  </header>

  <div class="controls">
    <input id="q" type="search" placeholder="Filter by company, role, or city…" aria-label="Filter roles">
    <div class="filters filters--fit">
      <button class="filter" type="button" data-fit="apply" aria-pressed="false">Apply now</button>
      <button class="filter" type="button" data-fit="strong" aria-pressed="false">Strong</button>
      <button class="filter" type="button" data-fit="consider" aria-pressed="false">Consider</button>
      <button class="filter" type="button" data-fit="skip" aria-pressed="false">Skip</button>
    </div>
    <div class="filters filters--region">${regionOpts}</div>
  </div>

  <div class="tablewrap">
    <table id="tbl">
      <thead><tr>
        <th class="c-rank">#</th>
        <th class="sortable" data-sort="score" aria-sort="descending" tabindex="0">Match <span class="arw">▼</span></th>
        <th>Fit</th>
        <th class="sortable" data-sort="company" tabindex="0">Company <span class="arw">▲▼</span></th>
        <th>Role</th>
        <th class="sortable" data-sort="region" tabindex="0">Location <span class="arw">▲▼</span></th>
        <th>Notes</th>
        <th></th>
      </tr></thead>
      <tbody>
${tableBody}
      </tbody>
    </table>
    <p class="empty" id="empty" hidden>No roles match those filters.</p>
  </div>

  <footer class="foot">
    <p>Scores are triage estimates (title + company tier + domain + location + visa reality), not full JD reads &mdash; they rank the queue. Run <code>/career-ops {url}</code> in Claude Code for a full A&ndash;G evaluation + tailored CV on any role.</p>
    <p>Generated from <code>data/pipeline.md</code> by <code>build-portal.mjs</code>.</p>
  </footer>
</div>

<script>
(function(){
  var q=document.getElementById('q'), empty=document.getElementById('empty');
  var tbody=document.querySelector('#tbl tbody');
  var rows=[].slice.call(tbody.querySelectorAll('tr.row'));
  var activeFit=new Set(), activeRegion=new Set();

  function apply(){
    var term=q.value.trim().toLowerCase(), shown=0;
    rows.forEach(function(r){
      var okFit=activeFit.size===0||activeFit.has(r.dataset.fit);
      var okReg=activeRegion.size===0||activeRegion.has(r.dataset.region);
      var okTerm=!term||r.dataset.search.indexOf(term)>-1;
      var ok=okFit&&okReg&&okTerm;
      r.classList.toggle('hide',!ok); if(ok)shown++;
    });
    empty.hidden=shown>0;
  }
  q.addEventListener('input',apply);
  [].forEach.call(document.querySelectorAll('.filter'),function(b){
    b.addEventListener('click',function(){
      var set=b.dataset.fit?activeFit:activeRegion, key=b.dataset.fit||b.dataset.region;
      if(set.has(key)){set.delete(key);b.setAttribute('aria-pressed','false');}
      else{set.add(key);b.setAttribute('aria-pressed','true');}
      apply();
    });
  });

  // Sorting
  var dir={score:-1,company:1,region:1};
  function sortBy(key){
    var th=document.querySelector('th[data-sort="'+key+'"]');
    dir[key]=-dir[key];
    document.querySelectorAll('th.sortable').forEach(function(x){x.removeAttribute('aria-sort');});
    th.setAttribute('aria-sort',dir[key]>0?'ascending':'descending');
    var sorted=rows.slice().sort(function(a,b){
      var va,vb;
      if(key==='score'){va=+a.dataset.score;vb=+b.dataset.score;return (va-vb)*dir[key];}
      va=a.querySelector(key==='company'?'.c-co':'.c-loc .rg').textContent.toLowerCase();
      vb=b.querySelector(key==='company'?'.c-co':'.c-loc .rg').textContent.toLowerCase();
      return va<vb?-dir[key]:va>vb?dir[key]:0;
    });
    sorted.forEach(function(r){tbody.appendChild(r);});
  }
  document.querySelectorAll('th.sortable').forEach(function(th){
    th.addEventListener('click',function(){sortBy(th.dataset.sort);});
    th.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();sortBy(th.dataset.sort);}});
  });
})();
</script>
</body>
</html>`;
}

// ── Hub index (lists every day's portal) ────────────────────────────
function renderHub(entries) {
  const cards = entries.map(e => `    <a class="card" href="${e.date}/index.html">
      <div class="card__date">${e.date}</div>
      <div class="card__stats"><b>${e.n}</b> roles &middot; <span class="apply">${e.applyNow} apply-now</span></div>
    </a>`).join('\n');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Job Portal — Abhishek</title>
<style>
:root{--ground:#eef1f5;--surface:#fff;--ink:#0f1620;--soft:#5b6675;--rule:#d6dde6;--accent:#1f4e8c;--apply:#0e6b52;--shadow:0 1px 2px rgba(15,22,32,.06),0 10px 30px -20px rgba(15,22,32,.35)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ground:#0b1016;--surface:#141c26;--ink:#e3e9f0;--soft:#8794a5;--rule:#25313f;--accent:#7badec;--apply:#5dbe93;--shadow:0 1px 2px rgba(0,0,0,.4),0 10px 30px -20px rgba(0,0,0,.8)}}
*{box-sizing:border-box}body{margin:0;background:var(--ground);color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:15px}
.wrap{max-width:820px;margin:0 auto;padding:48px 20px 64px}
.eyebrow{font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--soft);margin:0 0 10px}
h1{font-size:clamp(26px,4vw,38px);letter-spacing:-.02em;margin:0 0 10px}
.sub{color:var(--soft);margin:0 0 30px;max-width:60ch}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
.card{display:block;text-decoration:none;color:inherit;background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:20px;box-shadow:var(--shadow)}
.card:hover{border-color:var(--accent)}
.card__date{font-family:ui-monospace,Consolas,monospace;font-size:18px;font-weight:640;letter-spacing:-.01em}
.card__stats{color:var(--soft);font-size:13px;margin-top:8px}
.card__stats .apply{color:var(--apply);font-weight:600}
.card__stats b{color:var(--ink)}
.foot{margin-top:34px;color:var(--soft);font-size:12.5px}
.foot code{font-family:ui-monospace,Consolas,monospace;background:var(--surface);border:1px solid var(--rule);padding:1px 5px;border-radius:3px}
</style></head><body><div class="wrap">
  <p class="eyebrow">Abhishek Kumbhar &middot; C++ / HFT job search</p>
  <h1>Job Portal</h1>
  <p class="sub">Daily snapshots of open low-latency C++ / trading roles, scored against your CV. Open the latest date to browse and apply.</p>
  <div class="grid">
${cards}
  </div>
  <p class="foot">Rebuilt by <code>node build-portal.mjs</code> (also runs after each scheduled scan). Newest first.</p>
</div></body></html>`;
}

// ── Main ────────────────────────────────────────────────────────────
const rows = parse();
const dayDir = join(ROOT, TODAY);
mkdirSync(dayDir, { recursive: true });

const applyNow = rows.filter(r => r.score !== null && r.score >= 4.4).length;
writeFileSync(join(dayDir, 'index.html'), renderPortal(rows, TODAY), 'utf8');
writeFileSync(join(dayDir, 'meta.json'), JSON.stringify({ date: TODAY, n: rows.length, applyNow }), 'utf8');

// Rebuild hub from all date folders that have a meta.json
const dates = readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(d.name) && existsSync(join(ROOT, d.name, 'meta.json')))
  .map(d => JSON.parse(readFileSync(join(ROOT, d.name, 'meta.json'), 'utf8')))
  .sort((a, b) => b.date.localeCompare(a.date));
writeFileSync(join(ROOT, 'index.html'), renderHub(dates), 'utf8');

console.log(`Portal built: ${join(dayDir, 'index.html')}`);
console.log(`  ${rows.length} roles  |  ${applyNow} apply-now  |  hub: ${join(ROOT, 'index.html')} (${dates.length} day${dates.length === 1 ? '' : 's'})`);
