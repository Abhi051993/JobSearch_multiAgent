# How to Run — HFT C++ Job Search

**For: Abhishek Kumbhar — Senior Lead C++ Engineer | Low-Latency Trading**

---

## What This System Does

This is an AI-powered job search assistant running inside Claude Code. It:
1. **Scans** 60+ company career pages and job boards worldwide for matching HFT/C++ roles
2. **Shows you match %** for each role (based on your CV + profile)
3. **Evaluates** any job you paste and gives a detailed A-G report
4. **Generates** tailored CVs as PDFs
5. **Tracks** all evaluated applications

**IMPORTANT: It NEVER auto-applies. You see the score/match % and YOU decide.**

---

## Prerequisites

### 1. Claude Code (required)
You're already using this — it's the CLI/VS Code extension you're in right now.

### 2. Node.js (required for PDF generation only)
Scanning and evaluation work without Node.js. Only PDF generation needs it.

To check if Node.js is installed:
```bash
node --version
```

If not installed: https://nodejs.org/en/download — install the LTS version.

After installing Node.js, install dependencies:
```bash
cd C:\Users\abhik\OneDrive\Github_repos\JobSearch_multiAgent
npm install
```

Then install Playwright browser:
```bash
npx playwright install chromium
```

### 3. No other setup needed
No server to start. No API keys needed (Claude Code handles that). No Docker.

---

## How to Run — Step by Step

### Option A: Scan for new jobs worldwide

Type in Claude Code chat:
```
/career-ops scan
```

This will:
1. Check 60+ company career pages (Citadel, Optiver, IMC, Jane Street, HRT, FIS, ION Group, etc.)
2. Run search queries across Naukri, LinkedIn, eFinancialCareers, Indeed, Glassdoor etc.
3. Filter by your title keywords (C++, low latency, FIX protocol, exchange connectivity, etc.)
4. Show you a list of new roles grouped by location (India first, then HK, Singapore, London, Amsterdam, Germany, Japan, USA, Canada)
5. Add matching roles to `data/pipeline.md` for evaluation

**Location priority:** India → Hong Kong → Singapore → London → Netherlands → Germany → Japan → USA → Canada

**No roles are evaluated automatically. You see the list first.**

---

### Option B: Evaluate a specific job (paste URL or JD)

Paste any job URL or JD text directly in the chat. Example:

```
https://optiver.com/working-at-optiver/career-opportunities/12345/
```

Or paste the full job description text.

The system will:
1. Read your CV from `cv.md`
2. Read your profile from `config/profile.yml` and `modes/_profile.md`
3. Run a full A-G evaluation
4. Show you:
   - **Match %** (e.g., "4.2/5 = 84% profile match")
   - Block A: Role summary
   - Block B: CV match table (your experience mapped to each JD requirement)
   - Block C: Level and strategy
   - Block D: Salary/comp data (searched live from Glassdoor, Naukri, etc.)
   - Block E: CV personalization plan (top 5 changes to make)
   - Block F: Interview prep (STAR stories mapped to JD)
   - Block G: Posting legitimacy (is this a real open role?)
5. Save the report to `reports/`
6. Add to `data/applications.md` tracker

**YOU decide whether to apply. The system stops here.**

---

### Option C: Evaluate all pending jobs from pipeline

After a scan adds jobs to `data/pipeline.md`:
```
/career-ops pipeline
```

This evaluates each pending URL and shows you the match % + brief summary for each one.

---

### Option D: Compare multiple offers

When you have 2-5 offers to compare:
```
/career-ops compare
```

Ranks them side-by-side with match % for each.

---

### Option E: Generate PDF CV for a specific role

After evaluating a role:
```
/career-ops pdf
```

Or as part of the evaluation, ask:
```
Generate the PDF CV for this role
```

Requires Node.js + Playwright to be installed (see Prerequisites).

---

### Option F: Check application status

```
/career-ops tracker
```

Shows all evaluated roles with their scores and current status.

---

## Understanding Match %

Every role gets a score from 1.0 to 5.0, shown as a percentage:

| Score | Match % | What it means | Your action |
|-------|---------|---------------|-------------|
| 4.5–5.0 | 90–100% | Dream HFT role — perfect match | Apply immediately |
| 4.0–4.4 | 80–88% | Strong fit (top IB e-trading or HFT vendor) | Apply with priority |
| 3.5–3.9 | 70–78% | Good fit (trading software with C++ core) | Apply if you have bandwidth |
| 3.0–3.4 | 60–68% | Acceptable (adjacent capital markets, C++ core) | Apply only if pipeline is thin |
| 2.5–2.9 | 50–58% | Weak fit | Do NOT apply |
| < 2.5 | < 50% | Poor fit (wrong domain or no C++) | SKIP |

The system will explicitly tell you "RECOMMEND: Apply" or "RECOMMEND: SKIP".

### What drives the score
- C++ as the primary language: **mandatory** (non-C++ roles score ≤ 2.0)
- Low-latency / HFT domain: **+10% boost**
- FIX Protocol / exchange connectivity: **+6% boost**
- Non-financial domain (embedded, gaming, automotive): **auto-SKIP**
- Linux/Unix environment: **baseline** (Windows-only → small penalty)

---

## Files You Should Know

| File | Purpose | Edit? |
|------|---------|-------|
| `cv.md` | Your CV — source of truth for all evaluations | Yes — keep updated |
| `config/profile.yml` | Your profile, targets, comp ranges | Yes — update as needed |
| `modes/_profile.md` | Scoring weights, archetypes, tier lists | Yes — customize |
| `portals.yml` | Companies + search queries for scanning | Yes — add companies |
| `data/applications.md` | Auto-populated tracker | No — auto-managed |
| `data/pipeline.md` | Pending URLs to evaluate | Add URLs manually |
| `reports/` | Full evaluation reports (A-G) | Read-only output |
| `output/` | Generated PDF CVs | Read-only output |
| `HOW_TO_RUN.md` | This file | Reference |

---

## Worldwide Search Coverage

The scan covers these regions in priority order:

### Priority 1: India
- **Boards:** Naukri, Indeed India, IIMJobs, LinkedIn India
- **Companies:** FIS Global (Pune), Optiver (Mumbai), IMC Trading (Mumbai), HRT (Bangalore), Jump Trading (Mumbai/Bangalore), Goldman Sachs (Bangalore), Morgan Stanley (Mumbai), Credit Suisse/UBS (Pune), Deutsche Bank (Mumbai), Zerodha, NSE Technologies, 63 Moons, etc.

### Priority 2: Hong Kong
- **Boards:** eFinancialCareers, LinkedIn HK, JobsDB HK
- **Companies:** Jane Street (HK), Goldman Sachs (HK), Morgan Stanley (HK), HSBC, Standard Chartered, etc.

### Priority 3: Singapore
- **Boards:** eFinancialCareers, LinkedIn SG, JobsDB SG, Indeed SG
- **Companies:** Optiver (Singapore), IMC Trading (Singapore), Quantedge, Dymon Asia, Jump Trading (Singapore), DRW (Singapore), etc.

### Priority 4: London (UK)
- **Boards:** eFinancialCareers, Indeed UK, TotalJobs, CityJobs, LinkedIn UK
- **Companies:** Citadel, Jane Street (London), Flow Traders (London), XTX Markets, Virtu Financial (Dublin), Tower Research (London), SIG (London/Dublin), Goldman Sachs (London), Barclays, Deutsche Bank, etc.

### Priority 5: Netherlands (Amsterdam)
- **Boards:** eFinancialCareers, LinkedIn NL, Indeed NL
- **Companies:** Optiver (Amsterdam HQ), Flow Traders (Amsterdam HQ), IMC Trading (Amsterdam HQ), Maven Securities, etc.

### Priority 6: Germany
- **Boards:** StepStone, XING, LinkedIn DE, eFinancialCareers
- **Companies:** Deutsche Bank (Frankfurt), Deutsche Börse, Frankfurt exchanges, Commerzbank, etc.

### Priority 7: Japan
- **Boards:** GaijinPot, LinkedIn Japan, eFinancialCareers Japan
- **Companies:** Jane Street (Tokyo), Goldman Sachs (Tokyo), Nomura, Mizuho, SoftBank Vision Fund tech, etc.

### Priority 8: USA
- **Boards:** eFinancialCareers, Indeed, Dice, Glassdoor, LinkedIn USA
- **Companies:** Citadel Securities (Chicago), HRT (NYC), Tower Research (NYC), Two Sigma (NYC), DRW (Chicago), SIG (Bala Cynwyd), Akuna Capital (Chicago), etc.

### Priority 9: Canada
- **Boards:** Indeed CA, LinkedIn Canada, eFinancialCareers
- **Companies:** TD Bank algo trading, RBC Capital Markets, Cowen, BMO Electronic Trading, etc.

---

## Common Commands Reference

| What you want | What to type |
|---------------|-------------|
| Scan all 60+ companies worldwide | `/career-ops scan` |
| Evaluate a specific job URL | Paste the URL directly |
| Evaluate all pending pipeline jobs | `/career-ops pipeline` |
| Compare 2-5 offers | `/career-ops pipeline` then `/career-ops compare` |
| See all tracked applications | `/career-ops tracker` |
| Generate tailored CV PDF | `/career-ops pdf` |
| Deep research on a company | `/career-ops deep` |
| Interview prep for a company | Paste company name + "interview prep" |
| Follow-up on applications | `/career-ops followup` |
| Analyze rejection patterns | `/career-ops patterns` |
| Check for system updates | `check for updates` |

---

## Repo Location

- **Local:** `C:\Users\abhik\OneDrive\Github_repos\JobSearch_multiAgent`
- **GitHub:** https://github.com/Abhi051993/JobSearch_multiAgent
- **Original system:** `C:\Users\abhik\OneDrive\Github_repos\career-ops` (for comparison)
