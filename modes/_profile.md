# User Profile Context -- career-ops (Abhishek Kumbhar)

<!-- ============================================================
     THIS FILE IS YOURS. It will NEVER be auto-updated.
     Customized for: HFT / Low-Latency C++ Developer Search
     ============================================================ -->

## Target Archetypes

| Archetype | Thematic axes | What they buy |
|-----------|---------------|---------------|
| **HFT / Low-Latency C++ Engineer** | Microsecond latency, kernel bypass, lock-free queues, CPU affinity | Someone who squeezes nanoseconds out of the hot path |
| **Exchange Connectivity / Gateway Developer** | FIX, Binary FIX, native exchange protocols, adapter design | Someone who speaks every exchange's dialect fluently |
| **Trading Infrastructure Engineer** | Order routing, market data, co-location, FPGA-adjacent | Someone who keeps the trading pipeline alive under pressure |
| **FIX Protocol / Market Connectivity Engineer** | FIX 4.x / 5.0, QuickFIX, FIX Engine, ITCH/OUCH, SBE | Someone who builds and maintains protocol-level connectivity |
| **OMS / EMS C++ Developer** | Order lifecycle, position management, risk checks, execution | Someone who owns the order from inception to fill |
| **Quantitative Developer (C++)** | Strategy infra, backtesting engines, signal plumbing | Someone who bridges quants and production systems |

## Adaptive Framing

| If the role is... | Emphasize from background... | Proof point |
|-------------------|------------------------------|-------------|
| Pure HFT / latency engineering | FIS gateway work, latency optimization, Valgrind profiling, lock-free/multithreading | FIS Global multi-exchange gateway |
| Exchange gateway / connectivity | SEHK, SCHK, ASX, NSE FO, KRX adapters; FIX + Binary FIX + native protocol expertise | FIS Global & Credit Suisse FIX connectivity |
| Client connectivity / sell-side | Credit Suisse FIX Client Connectivity; external client order routing; L3 support | Credit Suisse FIX-based connectivity |
| OMS / trade lifecycle | BNP Paribas Global Markets OMS; swap & hedge front-to-back; P&L, regulatory reporting | BNP Paribas OMS |
| Market data / feed handler | 63 Moons ODIN; market-data processing modules; multithreaded C++ & MFC | 63 Moons ODIN platform |
| Capital markets vendor / fintech | End-to-end experience across IB (Credit Suisse, BNP), fintech vendor (FIS, 63 Moons) | Full breadth of the stack |

## Scoring Weights (HFT-specific)

When evaluating offers, apply these weight adjustments:

**Heavily weighted UP (must-haves):**
- C++ is the primary language (not optional, not "nice to have") → +0.5 to tech fit
- Low-latency / HFT / algo trading domain explicitly mentioned → +0.5 to domain fit
- FIX Protocol / exchange connectivity → +0.3 to domain fit
- Linux / Unix environment → baseline expectation; penalize Windows-only by -0.2

**Weighted DOWN (red flags):**
- No C++ at all (Python/Java-only stack) → score tech fit ≤ 2.0
- Non-financial domain (embedded, automotive, gaming, telecom) → score domain ≤ 1.5
- CRUD/web backend role labelled "C++ engineer" → strong signal to SKIP
- On-site 5 days/week outside Pune/Mumbai without relocation support → penalize remote -0.5
- Junior-level role (< 5 years expected) → score level fit ≤ 2.5

**Score calibration:**
- 4.5–5.0: Dream role — HFT firm (Citadel, Jane Street, Optiver, HRT, IMC, Flow, Jump, Tower, Virtu) with C++ + low-latency + exchange connectivity
- 4.0–4.4: Strong fit — Investment bank electronic trading team or top fintech (FIS, ION, Fidessa) with C++ + FIX + trading
- 3.5–3.9: Good fit — General trading software / market data / OMS with C++ core
- 3.0–3.4: Acceptable — Adjacent fintech / capital markets with strong C++ but lacking low-latency
- < 3.0: Do not recommend applying

## Exit Narrative

Frame Abhishek as:
> "A battle-tested C++ engineer with 10+ years of hands-on work across the full electronic trading stack — from microsecond-sensitive exchange adapters at FIS Global (SEHK, ASX, NSE FO, KRX) to FIX-based client connectivity at Credit Suisse, front-to-back OMS at BNP Paribas, and market-data platform ODIN at 63 Moons. Deep protocol fluency (FIX, Binary FIX, native exchange protocols), proven at L3 production support under pressure, and comfortable owning the gateway end-to-end."

**In PDF Summaries:** Lead with exchange breadth (5 exchanges) and protocol depth (FIX + Binary FIX + native).

**In STAR stories:** Anchor to incident-resolution and latency-optimization moments.

**In Draft Answers:** Open with the trading domain expertise before the tech stack.

## Cross-cutting Advantage

> "Multi-exchange, multi-protocol fluency across Indian, Australian, Hong Kong, and Korean markets — rare combination of exchange adapter depth plus L3 production fire-fighting experience, gained at both buy-side/sell-side banks and fintech vendors."

## Comp Targets

- **India (Pune/Mumbai/Bangalore):** ₹40L–70L CTC total; walk-away ₹35L
- **Singapore / Hong Kong / London:** $120K–180K USD equivalent — research current market on Glassdoor / Blind before negotiating
- **HFT firms (Optiver, IMC, Citadel India):** Premium roles — comp data via Blind; negotiate signing bonus + performance bonus separately

**Negotiation scripts:**

**Salary expectations (India):**
> "Based on my 10+ years in low-latency C++ and exchange connectivity at Credit Suisse, BNP Paribas, and FIS, I'm targeting ₹40–70L CTC depending on role scope. I'm flexible on structure — what matters is the total package and the opportunity to work on latency-critical systems."

**Below target offer:**
> "I'm comparing with similar roles at top-tier trading firms and fintech vendors. I'm particularly drawn to [company] because of [specific technical reason]. Can we explore reaching [target]? I'm also open to discussing performance-linked components."

**Geographic discount pushback:**
> "My exchange connectivity and FIX expertise is directly applicable from day one — protocol expertise doesn't change by location."

## Location Policy

**Preferred:** Pune-based (on-site or hybrid)
**Acceptable:** Mumbai, Bangalore, Hyderabad (open to relocation)
**Open to:** Singapore, London, Hong Kong for tier-1 HFT firms (Citadel, Optiver, IMC, Jane Street)
**Remote:** Will accept fully remote for strong roles from top firms

**In scoring:**
- Pune/Mumbai on-site → full score on location dimension
- Hybrid anywhere in India → full score
- Relocation required to Singapore/London/HK for HFT firm → score 4.0 (opportunity premium)
- On-site 5 days/week at random city with no relocation support → score 2.0

## Companies to Prioritize (from portals scanning)

**Tier 1 — Dream (HFT prop shops):**
Citadel Securities, Jane Street, Two Sigma, Hudson River Trading, Optiver, IMC Trading, Virtu Financial, Flow Traders, Tower Research Capital, Jump Trading, SIG (Susquehanna), DRW

**Tier 2 — Strong (Investment banks electronic trading):**
Goldman Sachs (Strats/Electronic Trading), Morgan Stanley (Electronic Trading), Barclays (eTrading), Deutsche Bank, UBS, JP Morgan (e-Trading), Credit Suisse/UBS merged entity

**Tier 3 — Good (Fintech / trading infrastructure vendors):**
FIS Global, ION Group, Fidessa, Broadridge, Cboe, Nasdaq Market Technology, Refinitiv/LSEG

**Tier 4 — India-specific:**
NSE Technologies, BSE Technologies, 63 Moons, Edelweiss, ICICI Securities Technology, Motilal Oswal Technology, Zerodha (tech), Angel One Tech
