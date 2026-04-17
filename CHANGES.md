# JobSearch_multiAgent — Setup & Customization Log

**Candidate:** Abhishek Kumbhar  
**Target:** HFT / Low-Latency C++ Developer roles  
**Setup date:** 2026-04-17  
**Base system:** career-ops (https://github.com/santifer/career-ops)

---

## What This Repo Is

This is a personalized fork of the career-ops AI job search pipeline, customized end-to-end for Abhishek Kumbhar's search for **HFT, low-latency C++, and exchange connectivity engineering roles**. The original system was built for AI/ML roles by santifer — every configuration, archetype, keyword, and scoring rule has been changed to match Abhishek's 10+ year C++ trading background.

---

## Files Created / Modified

### 1. `cv.md` — Canonical CV (CREATED)

Converted from `Abhishek_Kumbhar_Resume_2026.pdf`. Clean markdown format covering:
- **Professional Summary:** 10+ years C++ across HFT, exchange connectivity, market connectivity
- **Technical Skills:** C++11/14, FIX Protocol, Binary FIX, Native Exchange Protocols, Linux, Python, Sybase, Valgrind, CMake
- **Trading Domain:** SEHK, SCHK, ASX, NSE FO, KRX exchanges; Order routing, market data, OMS
- **Work History:**
  - FIS Global (Jan 2025–Present) — Senior Lead Engineer C++
  - Credit Suisse Investment Banking (Jan 2022–Dec 2024) — Senior Software Engineer
  - BNP Paribas Global Markets (Mar 2018–Dec 2021) — Senior Software Engineer
  - 63 Moons Technologies (Aug 2015–Mar 2018) — Software Engineer (ODIN trading platform)
- **Education:** PG-DAC (C-DAC 2015), B.E. Computer Science (2014), Diploma Computer Engineering (2011)

**Why:** This is the source of truth for all CV generation. Every evaluation reads this file to tailor the output PDF.

---

### 2. `config/profile.yml` — Personal Configuration (CREATED)

Full profile configuration for the job search system:

**Key changes from default:**
- `candidate.full_name`: Abhishek Kumbhar
- `candidate.email`: kumbharabhishek05@gmail.com
- `candidate.phone`: +91-9960554546
- `candidate.location`: Pune, India
- `target_roles.primary`: HFT C++ Engineer, Exchange Connectivity Developer, Trading Infrastructure Engineer, FIX Protocol Engineer, OMS/EMS Developer, Quant Developer
- `target_roles.archetypes`: 6 HFT/trading archetypes (primary, secondary) replacing AI/ML defaults
- `narrative.headline`: 10+ year C++ engineer specializing in HFT, exchange gateways, and low-latency order routing
- `narrative.superpowers`: Exchange gateway design, FIX/Binary FIX/native protocols, L3 production support, multi-exchange connectivity (5 exchanges)
- `narrative.deal_breakers`: Non-trading C++ roles, Java/Python-only roles, non-financial domain
- `compensation.target_range`: ₹40L–70L CTC (India); $120K–180K USD (Singapore/London/HK)
- `search_strategy.priority_companies`: 30 companies listed across HFT firms, IBs, and fintech vendors
- `location.relocation`: Open to Singapore, London, Hong Kong for tier-1 HFT firms

**Why:** This drives all personalization across evaluations, PDF generation, and negotiation scripts.

---

### 3. `modes/_profile.md` — Scoring Profile & Archetypes (CREATED)

The most critical customization file. Controls how every job is evaluated:

**Archetypes defined:**
1. HFT / Low-Latency C++ Engineer (primary)
2. Exchange Connectivity / Gateway Developer (primary)
3. Trading Infrastructure Engineer (primary)
4. FIX Protocol / Market Connectivity Engineer (secondary)
5. OMS / EMS C++ Developer (secondary)
6. Quantitative Developer C++ (secondary)

**Adaptive framing table:**
- Maps each archetype to specific experience from Abhishek's background
- FIS Global → HFT/gateway archetype
- Credit Suisse → client connectivity archetype
- BNP Paribas → OMS/trade lifecycle archetype
- 63 Moons → market data/feed handler archetype

**Custom scoring weights:**
- C++ as primary language: mandatory (≤ 2.0 if absent)
- Low-latency / HFT domain: +0.5
- FIX Protocol / exchange connectivity: +0.3
- Non-financial domain: score ≤ 1.5 → recommend SKIP

**Score calibration:**
- 4.5–5.0: Dream — HFT prop shop (Citadel, Optiver, IMC, HRT, Jane Street, Flow, Jump, Tower, Virtu)
- 4.0–4.4: Strong — IB electronic trading or top fintech (FIS, ION, Fidessa)
- 3.5–3.9: Good — General trading software / market data with C++ core
- 3.0–3.4: Acceptable — Adjacent fintech / capital markets
- < 3.0: SKIP

**Company tiers:**
- Tier 1 (Dream): 12 major HFT prop shops
- Tier 2 (Strong): 7 investment banks with electronic trading teams
- Tier 3 (Good): 7 fintech/market connectivity vendors
- Tier 4 (India-specific): 8 Indian trading tech companies

**Negotiation scripts:** Customized for India ₹40L–70L CTC context

**Why:** This is the brain of the evaluation system. Without this, every job would be scored against generic AI/ML criteria instead of HFT C++ criteria.

---

### 4. `portals.yml` — Job Scanner Configuration (CREATED)

Complete replacement of the default AI/ML-focused portals with HFT/trading-focused ones:

**Title filter changes:**
- Removed: All AI, ML, LLM, Agent, GenAI, DevRel, No-Code, Automation keywords
- Added: C++ Engineer, Low Latency, High Frequency, HFT, Exchange Connectivity, FIX Protocol, Market Data, Order Routing, Matching Engine, FPGA, Kernel Bypass, RDMA, DPDK, OMS Developer, EMS Developer, Quantitative Developer, Electronic Trading, Algo Trading
- Negative filters: Embedded, Automotive, Gaming, Telecom, Firmware, Mobile, React, Ruby, Blockchain, Web3, Data Scientist, Machine Learning

**Search queries added (25 total):**
- LinkedIn C++ Low Latency India
- Naukri FIX Protocol C++
- Naukri C++ Trading Systems
- eFinancialCareers C++ HFT
- eFinancialCareers FIX Protocol
- Indeed India C++ Low Latency
- IIMJobs C++ Trading
- Greenhouse / Lever / Ashby C++ Trading
- Direct company career page searches for: Citadel, Optiver, IMC, Jane Street, Tower, HRT, Jump, Flow, Virtu, SIG, ION Group, FIS Global, Broadridge

**Tracked companies (60+ total, 6 tiers):**

| Tier | Category | Companies |
|------|----------|-----------|
| 1 | HFT Prop Shops | Citadel Securities, Citadel LLC, Jane Street, Two Sigma, HRT, Optiver, IMC Trading, Virtu Financial, Flow Traders, Tower Research, Jump Trading, SIG, DRW, XTX Markets, Akuna Capital, Five Rings, Millennium, DE Shaw, WorldQuant, Squarepoint, Tibra, Maven Securities, QRT |
| 2 | Investment Banks | Goldman Sachs, Morgan Stanley, JP Morgan, Barclays, Deutsche Bank, UBS, BNP Paribas, Société Générale, Credit Agricole, Nomura, HSBC, Standard Chartered, Macquarie |
| 3 | Fintech Vendors | ION Group, FIS Global, Broadridge, Refinitiv/LSEG, Bloomberg, Cboe, Nasdaq Market Tech, Murex, Calypso/Adenza, Fidessa, FactSet, SimCorp, SS&C, CME Group |
| 4 | India Trading Tech | NSE Technologies, BSE Technologies, 63 Moons, Zerodha, Edelweiss, Motilal Oswal, ICICI Securities, Sharekhan, Angel One, HDFC Securities, Kotak Securities |
| 5 | Singapore/APAC HFT | Grasshopper, Quantedge, Dymon Asia, Andurand |
| 6 | IT Services India | TCS, Infosys, Wipro, Mphasis, Capgemini, Accenture (capital markets practices) |

**Why:** The scanner will now only surface C++ trading roles, not random AI/ML openings.

---

### 5. `data/applications.md` — Application Tracker (CREATED)

Empty tracker initialized with correct headers for Abhishek's job search. Every evaluated role will be added here via `merge-tracker.mjs`.

---

### 6. `data/pipeline.md` — URL Inbox (CREATED)

Empty inbox for job URLs. Add URLs here and run `/career-ops pipeline` to batch-evaluate them.

**Usage:** Paste any job URL (LinkedIn, Naukri, company career page) into this file and the system will evaluate it automatically.

---

### 7. `data/follow-ups.md` — Follow-Up Tracker (CREATED)

Empty follow-up tracker. Populated by `/career-ops followup` after applications are submitted.

---

### 8. `data/scan-history.tsv` — Scanner Dedup (CREATED)

Empty scan history. The scanner uses this to avoid showing the same role twice. Auto-populated on first scan.

---

### 9. `batch/batch-prompt.md` — Batch Evaluation Prompt (MODIFIED)

Complete rewrite of the batch evaluation worker. Key changes:

**Language:** Changed from Spanish to English throughout.

**Archetype detection:** Replaced AI/ML archetypes with 6 HFT/trading archetypes:
- HFT / Low-Latency C++ Engineer
- Exchange Connectivity / Gateway Developer
- Trading Infrastructure Engineer
- FIX Protocol / Market Connectivity Engineer
- OMS / EMS C++ Developer
- Quantitative Developer (C++)

**Adaptive framing:** Now maps to Abhishek's actual experience (FIS, Credit Suisse, BNP, 63 Moons) for each archetype instead of generic AI skills.

**Scoring weights:** Added HFT-specific rules (C++ mandatory, latency domain +0.5, FIX +0.3, non-financial ≤ 1.5 → SKIP).

**PDF generation:** Updated file naming to `cv-abhishek-kumbhar-{company-slug}.pdf`. Default format A4 (India/APAC/EU standard).

**Keyword injection examples:** Changed from AI/ML examples ("RAG pipelines") to C++ trading examples ("Binary FIX encoding", "ITCH/OUCH protocols").

**Global rules:** Added explicit rules to SKIP non-C++ roles and non-financial domain roles.

**Comp references:** Now references Indian comp ranges (₹40L–70L CTC) and APAC/London ranges ($120K–180K USD) from profile.yml.

---

## What Was NOT Changed (System Layer — Auto-Updatable)

The following files were copied from career-ops verbatim and should not have user data:
- `modes/_shared.md` — Shared evaluation framework
- `modes/oferta.md`, `modes/scan.md`, `modes/apply.md`, etc. — Mode prompts
- `*.mjs` scripts — Pipeline scripts
- `templates/cv-template.html` — CV HTML template
- `dashboard/` — Web dashboard
- `CLAUDE.md` — System instructions

These will be updated automatically if career-ops releases updates (via `node update-system.mjs apply`). Your customizations in `cv.md`, `config/profile.yml`, `modes/_profile.md`, and `portals.yml` are in the **user layer** and will never be overwritten.

---

## How to Use

### Evaluate a single job
Paste a job URL in the chat. The system auto-detects it and runs the full evaluation pipeline.

### Scan for new HFT roles
```
/career-ops scan
```
Scans all 60+ companies in `portals.yml` and surfaces new C++ trading roles matching the title filter.

### Process multiple URLs
Add URLs to `data/pipeline.md`, then:
```
/career-ops pipeline
```

### Batch evaluate
```
/career-ops batch
```
Evaluates all pending URLs in parallel with separate worker processes.

### See application tracker
```
/career-ops tracker
```

### Generate tailored CV PDF
```
/career-ops pdf
```
(or paste a JD — the auto-pipeline generates the PDF automatically)

---

## Score Interpretation

| Score | Meaning | Action |
|-------|---------|--------|
| 4.5–5.0 | Dream HFT role | Apply immediately |
| 4.0–4.4 | Strong IB/fintech match | Apply with high priority |
| 3.5–3.9 | Good trading software match | Apply if bandwidth allows |
| 3.0–3.4 | Acceptable adjacent role | Apply only if pipeline is thin |
| < 3.0 | Poor fit | SKIP — do not waste time |

---

## Key Customization Points for Future Updates

If you want to change anything:
- **Salary targets** → `config/profile.yml` under `compensation`
- **Location preferences** → `config/profile.yml` under `location` and `modes/_profile.md`
- **Add more companies to scan** → `portals.yml` under `tracked_companies`
- **Adjust scoring weights** → `modes/_profile.md` under "Scoring Weights"
- **Change archetypes** → `modes/_profile.md` under "Target Archetypes"
- **Update CV** → `cv.md` directly

---

## Local vs GitHub Repo Comparison

The original career-ops system is at:  
`C:\Users\abhik\OneDrive\Github_repos\career-ops`

This customized repo is at:  
`C:\Users\abhik\OneDrive\Github_repos\JobSearch_multiAgent`  
(also pushed to: https://github.com/Abhi051993/JobSearch_multiAgent)

**Key differences (this repo vs original career-ops):**
- `cv.md`: Created from scratch (original had example data)
- `config/profile.yml`: Abhishek's profile (original had generic example)
- `modes/_profile.md`: HFT/C++ archetypes (original had AI/ML archetypes)
- `portals.yml`: 60+ HFT/trading companies (original had AI/startup companies)
- `batch/batch-prompt.md`: English, HFT-focused (original was in Spanish, AI-focused)
- `data/*.md`: Empty trackers initialized (original had example data)
