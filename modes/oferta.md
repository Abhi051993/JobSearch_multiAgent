# Mode: oferta — Full Evaluation A-G (HFT / C++ Roles)

When the candidate pastes a job offer (text or URL), ALWAYS deliver all 7 blocks (A-F evaluation + G legitimacy).

**CRITICAL: NEVER submit or auto-apply. Show score and match % so the candidate decides.**

## Step 0 — Archetype Detection

Classify the offer into one of the 6 HFT/trading archetypes (see `_profile.md`). If hybrid, indicate the 2 closest. This determines:
- Which proof points to prioritize in Block B
- How to reframe the summary in Block E
- Which STAR stories to prepare in Block F

## Block A — Role Summary

Table with:
- Detected Archetype
- Domain (HFT / exchange connectivity / OMS / market data / infra)
- Function (build / support / design / optimize)
- Seniority
- Location + Remote policy
- Team size (if mentioned)
- TL;DR in 1 sentence

## Block B — Match with CV

Read `cv.md` and `modes/_profile.md`. Create table mapping each JD requirement to exact lines from the CV.

**Adapted by archetype:**
- HFT / Latency → prioritize FIS gateway work, performance tuning, Valgrind, lock-free/multithreading
- Exchange Gateway → prioritize SEHK/SCHK/ASX/NSE FO/KRX experience, FIX + Binary FIX + native protocols
- Client Connectivity → prioritize Credit Suisse FIX connectivity, order normalization, L3 support
- OMS / EMS → prioritize BNP Paribas trade lifecycle, swap/hedge OMS, regulatory reporting
- Market Data → prioritize 63 Moons ODIN, multithreaded market-data processing, MFC
- Trading Infra → prioritize full-stack depth: IB + fintech vendor + production support breadth

**Gap analysis** for each gap found:
1. Hard blocker or nice-to-have?
2. Can Abhishek demonstrate adjacent experience?
3. Mitigation plan (cover letter phrase, parallel experience, adjacent skill)

**Scoring weights (from _profile.md — APPLY THESE):**
- C++ as primary language → mandatory; tech fit ≤ 2.0 if absent → recommend SKIP
- Low-latency / HFT / algo trading explicitly stated → +0.5
- FIX Protocol / exchange connectivity → +0.3
- Linux/Unix environment → baseline expectation; Windows-only → -0.2
- Non-financial domain (embedded, automotive, gaming, telecom) → domain ≤ 1.5 → SKIP

## Block C — Level and Strategy

1. **Level detected** in JD vs Abhishek's natural level (Senior Lead, 10+ years)
2. **"Sell senior without lying" plan**: specific phrases, exact achievements, multi-exchange breadth (5 exchanges) as differentiator
3. **"If downlevelled" plan**: accept only if comp is fair + 6-month review milestone agreed

## Block D — Comp and Market

Use WebSearch for current salaries:
- India roles: Glassdoor India, Naukri Salary, LinkedIn Salary India, Blind India
- Global roles: eFinancialCareers, Glassdoor, Levels.fyi, Blind

Comp reference from `config/profile.yml`:
- India: ₹40L–70L CTC target; walk-away ₹35L
- Singapore / HK / London: $120K–180K USD equivalent

Table with data and cited sources. If no data, say so rather than invent.

Comp score (1-5): 5=top quartile HFT comp, 4=above-market IB/fintech, 3=median, 2=slightly below, 1=well below.

## Block E — Personalization Plan

| # | Section | Current state | Proposed change | Why |
|---|---------|---------------|-----------------|-----|
| 1 | Summary | ... | ... | ... |

Top 5 CV changes + Top 5 LinkedIn changes. Focus on:
- Injecting exchange names that match JD (SEHK, ASX, NSE FO, KRX, or whatever JD mentions)
- Surfacing protocol specifics (FIX version, Binary FIX, SBE, ITCH/OUCH) matching JD vocabulary
- Reordering experience bullets by JD priority
- Adding any latency metrics if they exist in cv.md

## Block F — Interview Prep

6-10 STAR+R stories mapped to JD requirements:

| # | JD Requirement | STAR+R Story | S | T | A | R | Reflection |
|---|---------------|--------------|---|---|---|---|------------|

**Reflection column**: What was learned or what would be done differently — signals seniority.

**Story bank**: If `interview-prep/story-bank.md` exists, check for existing stories. Append new ones.

**Archetype-adapted selection:**
- HFT / Latency → emphasize profiling results, bottleneck root cause, quantifiable improvement
- Exchange Gateway → emphasize protocol complexity, go-live, incident resolution
- OMS / EMS → emphasize order lifecycle correctness, risk controls, regulatory compliance
- Market Data → emphasize throughput, message processing, recovery scenarios

Also include:
- 1 technical deep-dive topic (e.g., "walk me through your FIX gateway design")
- Red-flag questions and how to answer them
- Trading domain-specific prep questions

## Block G — Posting Legitimacy

Analyze the posting for signals that indicate whether it is a real, active opening.

**Ethical framing**: Present observations, not accusations. The candidate decides how to weigh them.

### Signals to analyze:

**1. Posting Freshness** (from Playwright snapshot):
- Date posted or "X days ago"
- Apply button state (active / closed / missing)
- If URL redirected to generic careers page, flag it

**2. Description Quality** (from JD text):
- Does it name specific exchange names, protocols, tools?
- Does it mention team size, reporting structure?
- Are requirements realistic? (years of experience vs technology age)
- Is salary/compensation mentioned?
- Ratio of role-specific vs generic boilerplate?
- Any internal contradictions? (e.g., "entry-level" title + 10 years experience required)

**3. Company Hiring Signals** (WebSearch, combine with Block D):
- `"{company}" layoffs {year}` — note date, scale, affected departments
- `"{company}" hiring freeze {year}` — note any announcements

**4. Reposting Detection** (from data/scan-history.tsv):
- Same company + similar role title with different URL
- Note frequency and time span

**5. Role Market Context** (qualitative):
- Is this a common trading tech role or a niche one?
- Does this role make sense for this company's trading operations?

### Output format:

**Assessment:** One of three tiers:
- **High Confidence** — Multiple signals suggest a real, active opening
- **Proceed with Caution** — Mixed signals worth noting
- **Suspicious** — Multiple ghost job indicators; investigate before investing time

**Signals table**: Each signal with finding and weight (Positive / Neutral / Concerning).

**Context Notes**: Caveats (niche role, evergreen posting, government timeline, etc.).

---

## Global Score

| Dimension | Score (1-5) |
|-----------|-------------|
| CV Match (C++ + trading domain) | X/5 |
| North Star Alignment (HFT/low-latency fit) | X/5 |
| Comp | X/5 |
| Cultural / firm quality signals | X/5 |
| Red flags | -X (if any) |
| **GLOBAL SCORE** | **X/5 = X×20% match** |

**Score → Match % interpretation:**

| Score | Match % | Meaning | Action |
|-------|---------|---------|--------|
| 4.5–5.0 | 90–100% | Dream HFT role | Apply immediately |
| 4.0–4.4 | 80–88% | Strong IB/fintech match | Apply with priority |
| 3.5–3.9 | 70–78% | Good trading software match | Apply if bandwidth |
| 3.0–3.4 | 60–68% | Acceptable adjacent role | Apply only if pipeline thin |
| 2.5–2.9 | 50–58% | Weak fit | Do NOT apply — wait for better |
| < 2.5 | < 50% | Poor fit | SKIP |

---

## Post-Evaluation (ALWAYS do these)

### 1. Save report .md

Save full evaluation to `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`:
- `{###}` = next sequential number (3 digits, zero-padded)
- `{company-slug}` = company name lowercase with hyphens
- `{YYYY-MM-DD}` = today's date

**Report format:**

```markdown
# Evaluation: {Company} — {Role}

**Date:** {YYYY-MM-DD}
**Archetype:** {detected}
**Score:** {X/5} ({X×20}% profile match)
**Legitimacy:** {High Confidence | Proceed with Caution | Suspicious}
**URL:** {original job URL}
**PDF:** {path or pending}

---

## A) Role Summary
(full block content)

## B) CV Match
(full block content)

## C) Level and Strategy
(full block content)

## D) Comp and Market
(full block content)

## E) Personalization Plan
(full block content)

## F) Interview Prep
(full block content)

## G) Posting Legitimacy
(full block content)

---

## ATS Keywords Extracted
(15-20 keywords from JD)
```

### 2. Register in tracker

Write TSV to `batch/tracker-additions/{sequential}.tsv` (NEVER edit applications.md directly):

```
{num}\t{date}\t{company}\t{role}\tEvaluated\t{X.X}/5\t❌\t[{num}](reports/{###}-{slug}-{date}.md)\t{1-sentence note with match %}
```

Example note: `4.2/5 (84% match) — Strong FIX gateway fit; apply — Optiver Mumbai`
