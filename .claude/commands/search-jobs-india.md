---
description: Search for new C++ / HFT roles in India only
---

Run a portal scan restricted to **India**. Discovery only — do not evaluate,
score, or apply to anything.

## Steps

1. **ATS scan, India-filtered** (zero tokens):

   ```
   node scan.mjs --location india
   ```

   The `india` preset matches Mumbai, Pune, Bengaluru/Bangalore, Gurgaon/
   Gurugram, Hyderabad, Chennai, Delhi, Noida, Ahmedabad, GIFT City,
   Gandhinagar, Kolkata, and Remote. It covers Citi and Barclays (Radancy),
   JP Morgan (Oracle HCM), Morgan Stanley and Deutsche Bank (Workday), plus
   every Greenhouse/Ashby/Lever board in `portals.yml`.

2. **Then search India-specific portals** the APIs don't reach. Read
   `modes/_shared.md` + `modes/scan.md` and run the Priority 1 queries from
   `search_queries`: Naukri, iimjobs, Indeed India, LinkedIn India,
   eFinancialCareers India, foundit, instahyre, cutshort.

   Also check the India prop shops and vendors directly — their boards move
   faster than the aggregators:
   NK Securities Research, iRage Capital, Quadeye, Graviton Research,
   AlphaGrep, Dolat Capital, Tower Research (Gurgaon), IMC (Mumbai),
   Optiver (Mumbai), Jump Trading, Trading Technologies (GIFT City),
   FIS Global (Pune), ION Group, 63 Moons, NSE/BSE Technologies.

3. **Deduplicate** against `data/scan-history.tsv`, `data/pipeline.md`, and
   `data/applications.md`.

4. **Filter by title** using `title_filter` in `portals.yml`, then apply
   `modes/_profile.md`: C++ must be primary. Mark Java-primary, Python-primary,
   and non-engineering titles as **off-profile** and list them separately.

5. **Drop anything outside India.** If a role is genuinely excellent but
   located elsewhere, mention it in a single closing line — do not mix it into
   the India list.

6. **Record everything**: new roles to `data/pipeline.md`, every URL seen to
   `data/scan-history.tsv`.

7. **Report** grouped by city, in this order: Pune, Mumbai, Bangalore,
   Hyderabad, Gurgaon/Delhi NCR, GIFT City/Ahmedabad, Chennai, Remote.
   Give every role a direct apply link. Pune first — it is home base and needs
   no relocation.

Finish by reminding me that `/career-ops pipeline` scores these against my CV.