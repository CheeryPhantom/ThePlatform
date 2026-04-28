# The Platform — Roadmap & Competitive Gap Analysis

_Last updated: 2026-04-26_

This document captures what The Platform has today, what comparable global and South-Asian job platforms offer, and a prioritised plan for closing the gaps.

---

## What we ship today

**Auth** — email + password (bcrypt), JWT (7-day), candidate/employer/admin roles.
**Candidate profile** — split name, Nepal address picker (province → district → municipality + ward), DOB, gender, headline, phone, experience years, skills (curated taxonomy), social URLs, resume upload (Supabase Storage), preferences (employment types, work modes, salary range NPR/USD/INR, availability, work authorisation, company size, willing-to-relocate, open-to-work), certifications + auto-awarded tier badges from trusted issuers, training enrollments with stale-reminder.
**Employer profile** — company name, website, bio, location, industry, size, founded year, logo URL, view/edit toggle.
**Jobs** — employer CRUD with draft/publish/close, required skills + min years + employment type + experience level + Nepal location + remote toggle + salary range + external URL. Candidate feed with skill-overlap match score, single-job page with per-skill matched/missing breakdown, Quick Apply with optional cover letter, applicant list per job for the owning employer.
**Pages** — landing, login/register, dashboard (role-aware), /profile, /employer-profile, /jobs, /jobs/new, /jobs/:id, /jobs/:id/edit, /assessment, /training, /messages, /settings (last four mostly stubs), header user menu with Logout.

---

## What competitors offer that we don't

### LinkedIn Jobs / Recruiter
- **Open To Work signal** — candidates expose notice period and target salary directly to recruiters (we have a checkbox, not the structured signal)
- **Easy Apply with profile snapshot** — application is a profile + answers to screening questions, not a re-typed cover letter
- **Top Applicant indicator** — show candidate where they rank vs other applicants
- **Application Insights** — viewer count, applicant volume, "actively reviewing" status
- **Saved searches with multi-alert tiers** (broad, exact-fit, adjacent)
- **Recruiter pipeline stages** — applied → screened → interview → offer → hired with custom stages and bulk moves
- **InMail / messaging** with templates and analytics
- **Talent Insights** — market data on supply/demand for a role
- **Skills Assessments** with badges visible to employers
- _AI: profile writing, hiring assistant — flag as later_

### Indeed
- **Sponsored vs free listings** — pay-per-application boost
- **Resume database search** for employers (search any candidate, not just applicants)
- **Virtual interviews scheduled inline**
- **Candidate notes + status** in the dashboard
- **Application/spend analytics** — cost per application, conversion funnel
- **Indeed Assessments** — skills tests as a screening filter
- **Smart Sourcing** — outbound contact credits
- **Company Pages** — public branded page with reviews

### Wellfound (AngelList Talent)
- **Salary + equity transparent on the listing** — compensation isn't hidden behind apply
- **Profile-first applications** — no resume re-upload, profile is the application
- **Curated candidate matches** — operator-curated batch instead of inbound spam
- **Anonymous browse / two-sided opt-in** — candidate matches employer without revealing identity until both opt in

### Glassdoor
- **Company reviews + ratings** — overall, work-life, salary
- **Salary insights database** — see what real people earn for a role
- **Interview question library** — what got asked in past interviews at a company

### Naukri / Shine (India, closest cultural neighbour)
- **AI Resume Maker** — ATS-friendly templates, profile → PDF
- **"Recommended jobs" feed** — ML on profile + activity
- **Recruiter Messages inbox** — separate from notifications
- **Consultant layer** — third parties post on behalf of multiple companies (huge in NP/IN market)
- **Profile completeness scoring** that affects search rank
- **CV download counter** — candidate sees who downloaded their CV

### Merojob (Nepal — direct competitor)
- **Mobile-first** — most Nepali users are on Play Store
- **Phone-call as a contact channel** — many local employers want a phone number, not an email thread
- **Nepali-language toggle**
- **Industry browsing tree** — banking / NGO / hospitality / IT etc as a primary nav, not a search facet
- **Company verification badge** — important in a market with informal hirers

### ATS-side (Greenhouse / Lever)
- **Custom screening questions** per posting (must-have for most real jobs)
- **Application stages** with notes, scorecards, structured interview kits
- **Bulk actions** on applicants

---

## Consolidated gap list (prioritised)

Effort key: **S** = ≤1 day, **M** = 2–5 days, **L** = 1–2 weeks.

### Candidate-side
| # | Gap | Effort | Why it matters |
|---|---|---|---|
| C1 | Saved jobs / bookmarks (real, persisted) | S | Bookmark icon currently does nothing |
| C2 | Job alerts — saved searches that email new matches | M | Core competitor feature; Naukri / LinkedIn / Indeed all have it |
| C3 | My Applications page with status tracker | S | We have the data, need UI |
| C4 | Screening questions in Apply flow | M | Employers need this; no real role has just "send resume" |
| C5 | "Top Applicant" / match-rank indicator on apply | S | Tiny UI, big psychological effect |
| C6 | Profile completeness % (real, with checklist) | S | Drives candidate to fill in fields → better matches |
| C7 | Resume-builder export (PDF from profile) | M | Naukri's killer feature; Nepal candidates often need a PDF |
| C8 | Public profile page (`/u/:username`) for sharing | M | Recruiter outreach pivots on a shareable link |
| C9 | Withdraw application | S | Legal/UX must-have |
| C10 | Application notifications (in-app + email) | M | We have a notifications table, nothing wired |

### Employer-side
| # | Gap | Effort | Why it matters |
|---|---|---|---|
| E1 | Pipeline stages (new → screening → interview → offer → hired/rejected) | M | Greenhouse/Lever standard; replaces Excel for SMEs |
| E2 | Applicant notes + tags | S | Easy add now we have applicants table |
| E3 | Custom screening questions per job | M | Pairs with C4 |
| E4 | Resume database search (find candidates not just applicants) | L | Naukri/Indeed core revenue feature; needs candidate-discoverable opt-in |
| E5 | Company verification + badge | S | Critical trust signal in Nepal market |
| E6 | Sponsored / featured listing flag | S | Clear monetisation hook even before billing |
| E7 | Listing analytics (views, applies, conversion) | M | Easy with one events table |
| E8 | Bulk export applicants to CSV | S | Most early hires happen in spreadsheets anyway |
| E9 | Email candidate (in-platform message thread) | M | Pairs with messaging |
| E10 | Job duplication ("clone listing") | S | Trivial, huge UX win |

### Shared / platform
| # | Gap | Effort | Why it matters |
|---|---|---|---|
| P1 | Public company pages (`/c/:slug`) | M | Indeed/Glassdoor parity; SEO win |
| P2 | Industry / category browse (tree, not just search) | S | Merojob does this; helps non-IT users |
| P3 | In-app notifications dropdown (already have schema) | M | Bell icon is a no-op today |
| P4 | Email-out (transactional: applied, status change, new match) | M | Resend/SES wiring |
| P5 | Search across jobs + companies (FTS) | S | We already have a `to_tsvector` index — just expose it |
| P6 | Salary insights (rolled-up averages by role/location) | M | Glassdoor draw; needs anon aggregation |
| P7 | Admin panel for verification + content moderation | M | Required before public launch |
| P8 | Rate limiting + audit log on sensitive endpoints | S | Already have `audit_logs` table |

### Nepal-market specifics
| # | Gap | Effort | Why it matters |
|---|---|---|---|
| N1 | Phone-call CTA + WhatsApp link on listings | S | Many SME employers prefer phone over email |
| N2 | Nepali-language UI toggle | M | Merojob has it |
| N3 | Mobile-first responsive pass + PWA installable | M | Merojob is Play Store first |
| N4 | Recruitment-consultancy account type (post for multiple clients) | L | Real category in NP/IN — needed for Phase 5 |
| N5 | NPR-first salary defaults already in place ✓ | — | Done |

---

## Roadmap

### Phase 3 — next 2 weeks (everything below is M-effort or smaller and high-leverage)
**Theme: close the basic-functionality holes that make the product feel finished.**
1. **Saved jobs (C1)** — wire the bookmark icon → new `saved_jobs` table → /jobs filter "Saved" + a count on profile.
2. **My Applications page (C3)** — `/applications` route, candidate sees status timeline, can withdraw (C9).
3. **In-app notifications dropdown (P3)** — Bell icon → list from existing `notifications` table → mark-read endpoint. Emit on apply / status change.
4. **Pipeline stages on applicant list (E1)** — column in job_applications already exists; build a kanban-lite view inside `/jobs/:id` for the owner with drag/dropdown to move stage + notes (E2).
5. **Custom screening questions (C4 + E3)** — `job_questions` JSONB column; render in apply modal; capture in `application_answers` JSONB.
6. **Listing clone (E10)** — `POST /api/jobs/:id/duplicate` and a button.
7. **Public job + company search (P5)** — expose the existing `idx_jobs_document` FTS via `?q=` param + landing-page search bar that deep-links into `/jobs?q=...`.

### Phase 4 — month 2
**Theme: trust, growth, and brand pages.**
1. **Public company pages (P1)** — `/c/:slug` rendering employer profile + their open roles + company-aware applies.
2. **Public candidate profile (C8)** — `/u/:slug` opt-in.
3. **Email transactional layer (P4)** — Resend (or SES) wiring + templates for: application received (employer), application status change (candidate), new-match-from-saved-search (candidate), candidate registered (welcome).
4. **Job alerts / saved searches (C2)** — serialise the candidate's `/jobs` filter, persist; nightly job pushes new matches.
5. **Profile completeness scoring (C6)** — backend computes %, frontend shows checklist driving to fill missing fields.
6. **Listing analytics for employers (E7)** — events table for `view_listing`, `apply_started`, `apply_submitted`; dashboard view.
7. **Company verification + badge (E5)** — admin reviews website + email domain; badge across listings.

### Phase 5 — backlog (do when there's a clear demand)
1. **Resume database search (E4)** — paid tier; needs candidate `discoverable` opt-in.
2. **Resume PDF builder (C7)** — server-side render with @react-pdf or puppeteer.
3. **Salary insights aggregator (P6)** — weekly cron rolling up applied/posted salary bands.
4. **Skills assessments (LinkedIn-style)** — Phase 1 stub already exists, build the actual quiz flow.
5. **In-platform messaging (E9)** — threads between employer ↔ applicant.
6. **Recruitment-consultancy account type (N4)**.
7. **Nepali-language UI (N2)**.
8. **Sponsored / featured listing surface + billing (E6)**.
9. **PWA install + offline shell (N3)**.
10. **Admin panel for moderation (P7)**.

---

## Quick-wins not in any phase (do alongside)

- Make the header bell icon link to `/notifications` even before notifications work, so the affordance is consistent.
- Replace the Settings page's hardcoded `user@example.com` with the real `useAuth().user.email`.
- Add a "Demo data" pill on Dashboard stat cards with hardcoded values until real metrics are wired.
- Add `aria-label`s to every icon-only button (already mostly done; audit one more pass).

---

## Notes on what NOT to build yet

- **AI features** (profile rewriting, hiring assistant) — wait until we have enough listings and applicants to make AI useful. Building it on 5 listings is theatre.
- **Real-time chat / video interviews** — don't compete with Zoom/Google Meet; link out instead.
- **Custom branded careers sites for employers** — Indeed/LinkedIn upsell, premature for v1.

---

## Sources (research, April 2026)

- LinkedIn Talent Solutions — [Recruiter features](https://business.linkedin.com/talent-solutions/recruiter/recruiter-features), [2026 Hiring Release](https://business.linkedin.com/talent-solutions/product-update/hire-release)
- Indeed Employer — [Dashboard FAQ](https://www.indeed.com/hire/resources/howtohub/employer-dashboard-frequently-asked-questions), [Smart Sourcing pricing](https://www.indeed.com/hire/looking-for-employees)
- Wellfound — [Product home](https://wellfound.com/), [Wellfound (formerly AngelList) review 2026](https://www.whatjobs.com/news/wellfound-angellist-review-2026-the-startup-holy-grail-or-tech-bubble/)
- Naukri — [AI Resume Maker launch](https://aimgroup.com/2025/11/25/india-based-naukri-launches-ai-powered-resume-maker/), [How to use Naukri](https://www.naukri.com/faq/job-seeker-getting-around-naukri)

---

# Deep dive — second pass (April 2026)

A follow-up pass to make the roadmap actionable. Each section ends with a concrete recommendation that maps to a specific phase.

## A. Nepal market — concrete numbers and patterns

**Salary anchors** (use these as the default placeholders / sliders in `JobForm`)
- Junior dev (0–2 yrs): **NPR 30,000 – 60,000/month**
- Mid (3–5 yrs): **NPR 80,000 – 150,000/month**
- Senior (6+ yrs): **NPR 150,000 – 400,000/month** (cloud/AI/security top end)
- IT sector wage growth: ~15–20% per year for experienced roles, driven by international remote demand
- Kathmandu Valley pays 20–40% more than other districts for the same role

**Employer mix — what "company" means in Nepal IT**
- **Local product teams** (banks, fintech, telcos) — slower hiring, higher trust, structured process
- **Outsourcing / dev shops** (BPO + IT services) — _hundreds_ across Kathmandu, Pokhara, Chitwan; this is the largest employer category. They serve North America, Europe, Asia, Australia — i.e. **most "remote" listings on our platform will actually be remote-for-foreign-clients-via-Nepali-shop**
- **Foreign companies hiring directly remote** — small but growing segment
- **Nepali startups** — visible but small share

**Implication for our product**: the "Company size" filter should split out **outsourcing/dev shop** as a category; "Remote" should distinguish "Remote (foreign company)" from "Remote (Nepali employer)". This affects candidate decisions on tax, payroll, currency.

**What candidates actually search for** (validate later; assume for now): role + technology, e.g. "React developer Kathmandu", "Node.js remote", "Banking IT". The current FTS handles role + tech keywords; **it doesn't handle "remote NP" vs "remote foreign"** — that needs a metadata flag on the job.

→ **Phase 4 add**: `jobs.client_geography` enum (`local | foreign | mixed`), surfaced as a filter pill.

## B. Trust & anti-scam (Nepal-relevant)

This is more important here than in mature markets because Nepali users have less recourse against fake employers. **Real action items**:

1. **Email-domain verification on employer signup** — block free-email signups (`@gmail.com`, `@yahoo.com`) for the employer role unless they go through manual review. Most real Nepali employers have a domain.
2. **First 3 listings reviewed manually** before publish — admin-only "approve" action. Doesn't need a UI immediately; can be a daily SQL query.
3. **No upfront payment ever** — never accept candidate payment for application/processing/onboarding. Build copy around this on the landing page ("We'll never ask you to pay to apply").
4. **Verified Employer badge** (existing roadmap item) — make it visually present everywhere a company name appears.
5. **Report listing** button on every job detail page → `flagged_listings(id, listing_id, reporter_id, reason, created_at)` → admin queue.
6. **Detect duplicate text across listings** — quickly catches copy-paste scam waves. Postgres trigram index on `description` makes this a 5-line query.

→ **Phase 4 must-have**: items 1, 3, 4. Phase 5: 2, 5, 6.

Reference: [Indeed: How to identify fake job postings](https://www.indeed.com/career-advice/finding-a-job/how-to-know-if-a-job-is-a-scam), [How to spot fake job applicants — Built In](https://builtin.com/articles/spot-fake-job-applicant-scams).

## C. SEO + Google for Jobs (highest-leverage technical work after Phase 4)

This is the single biggest free-traffic lever a job board has. **Numbers from the field**: Nestlé saw +82% CTR after adding `JobPosting` schema; ZipRecruiter saw +450% CTR — citation: [Hashmeta — Job-Posting SEO](https://hashmeta.com/blog/job-posting-seo-implementing-schema-markup-to-land-roles-on-google-for-jobs/).

**What to build (Phase 4, after public job pages exist)**:

1. **Static SSR / pre-render of `/jobs/:id`** — Google's crawler doesn't reliably index client-side React. Use Vite SSG, a /sitemap-builder, or a serverless edge renderer for crawlers (`User-Agent: *Googlebot*`).
2. **JSON-LD `JobPosting` block** on each listing page with at minimum:
   ```json
   {
     "@context": "https://schema.org/",
     "@type": "JobPosting",
     "title": "...",
     "description": "...HTML allowed...",
     "datePosted": "ISO8601",
     "validThrough": "ISO8601 — REQUIRED, expiry",
     "employmentType": "FULL_TIME",
     "hiringOrganization": {
       "@type": "Organization",
       "name": "...",
       "sameAs": "https://...",
       "logo": "https://..."
     },
     "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressCountry": "NP", ... } },
     "baseSalary": { "@type": "MonetaryAmount", "currency": "NPR", "value": { "@type": "QuantitativeValue", "minValue": ..., "maxValue": ..., "unitText": "MONTH" } }
   }
   ```
3. **`validThrough`** must always be set — Google's docs are explicit. We have `expires_at` already, default it to `posted_at + 30d` if blank.
4. **One job, one URL** — never put multiple listings on a search results page with `JobPosting` schema. We're already structured this way.
5. **Sitemap of all published jobs** at `/sitemap-jobs.xml`, regenerated on publish/close. Submit via Google Search Console.
6. **Indexing API** integration once stable — Google specifically recommends it for JobPosting URLs to crawl faster than sitemap polling.

**Risk to know about**: leaving expired listings with active schema flags the domain — Google reduces your trust score. So when we move a listing to `closed`, the page must either (a) drop the schema, (b) set `eventStatus: "EventClosed"`, or (c) 410 Gone. Pick (b) for soft-close, (c) for delete.

→ **Phase 4 — single biggest free-traffic lever.** Cost: ~3 days.

## D. Mobile UX for South Asia — concrete patterns we're not doing

From the autocomplete/typeahead literature (sources below):
- Mobile users tap typeahead suggestions; they don't read them. Show **5–7 max** — more is overwhelming.
- For **city/location** fields, typeahead is **not optional** at scale (753 municipalities in Nepal — current `<select>` cascade is fine for an existing structured input but slow to discover; a debounced typeahead is faster).
- **Sticky filter bar at top + bottom-sheet for advanced filters** — Asian mobile job apps (Naukri, Merojob) all do this. Our `/jobs` filters are inline at top; on mobile they take 50% of the viewport before the first card.
- **Swipe gestures** (Tinder-style apply/skip) — debatable for jobs; likely too gimmicky. Skip.
- **Visible Close (X) button on overlays** — research is unanimous that swipe-to-close fails screen reader and unfamiliar users. Already done in our apply modal. Verify on bottom-sheet pattern when added.

→ **Phase 4 polish**: AddressPicker → debounced typeahead for municipalities; mobile filter chips → bottom-sheet pattern.

References: [Smart Interface Design — Autocomplete UX](https://smart-interface-design-patterns.com/articles/autocomplete-ux/), [LogRocket — Search bar best practices](https://blog.logrocket.com/ux-design/design-search-bar-intuitive-autocomplete/).

## E. Accessibility — concrete WCAG 2.2 risks in our current code

Research finding: **53% of blocker issues in online job applications are keyboard-related**, **34% involve date pickers / combo boxes** ([PMC: Accessibility of online job applications](https://pmc.ncbi.nlm.nih.gov/articles/PMC10961918/)). Our riskiest controls:

1. `Profile.jsx` **DOB `<input type="date">`** — native picker accessibility varies wildly across browsers/screen readers. WAI explicitly warns against relying on it. Add a manual fallback (year/month/day selects) or use a dedicated accessible date library.
2. `AddressPicker.jsx` **cascading selects** — first one is fine, but the user must remember the previous selection while picking the next, with no aria-live region announcing what loaded. Add `aria-live="polite"` on the district / municipality lists.
3. `SkillsInput.jsx` **typeahead listbox** — has `role="listbox"` and `role="option"` ✓ but no `aria-activedescendant` to point to the highlighted item. Screen readers don't announce the active suggestion as user arrows through. Add `aria-activedescendant`.
4. `JobDetail.jsx` **apply modal** — no focus trap. Tab escapes to the underlying page. Use a focus-trap (e.g. `react-focus-lock`) or set `inert` on `#root` while modal is open.
5. `details/summary` pipeline rows — custom marker hides default focus ring. Add `summary:focus-visible { outline: 2px solid var(--primary-500); }`.
6. **Form errors** — currently an `error-message` div appears below the form. WCAG 2.2 wants **error summary at the top** with `role="alert"` and links to invalid fields. Refactor at the same time as we add the error toast.
7. **Notification dropdown** — closes on Escape ✓ but doesn't return focus to the trigger button. Add `bellRef.current.focus()` on close.
8. **Colour-only stage encoding** in pipeline — already mitigated by text labels in the dropdown ✓.

→ **All small fixes**, do alongside Phase 4. Estimate: 1 day total.

## F. ATS-side — what "Phase 5+ scorecards" actually means

Greenhouse + Lever both centre on **structured interview kits + scorecards**. From research:
- **Interview kit** = a pre-defined set of questions + competencies an interviewer is supposed to assess in a given stage. Linked to the application.
- **Scorecard** = a 1–5 rating per competency, completed by each interviewer, aggregated across the panel.
- Both ship as a sidebar inside the candidate detail; you click the stage, fill the kit, submit.

**For us** this is a Phase 5 feature, but the data model is small:
- `interview_kits(id, employer_id, name, json)` where json = `[{competency, prompt}]`
- `interview_kits_jobs(kit_id, job_id, stage)` — bind a kit to a stage of a specific job
- `scorecards(id, application_id, interviewer_user_id, stage, ratings_json, notes, submitted_at)` — one per interviewer per stage

The UX win is **calibration** — different interviewers grading the same way — not the data model.

Reference: [Greenhouse on G2](https://www.g2.com/products/greenhouse/reviews), [Lever review 2026](https://desking.app/lever-review/).

## G. Resume parsing — when, what, how much

From research, the three real options:
| Provider | Accuracy | Price | Best fit |
|---|---|---|---|
| **Affinda** | ~95% | from **~$99/mo** (free tier for testing) | Modern API, ML model not LLM, great for embedding into ATS |
| **RChilli** | very good | from **~$75/mo** (3,000 credits for $150 startup pack) | Cheap, scalable, semantic matching included |
| **Sovren / Textkernel** | best-in-class | **enterprise-only** ($99+ pro, custom for serious volume) | Top accuracy + skill normalisation; overkill for v1 |

→ **Recommendation**: skip resume parsing in Phase 4. When candidate volume justifies it (>500 applications/week), go with **Affinda** free tier first, RChilli if budget-tight. Until then, the candidate fills the profile manually — and we already have a richer profile than a parsed resume would give us anyway.

Reference: [Best resume parser APIs 2026](https://skima.ai/blog/industry-trends-and-insights/best-resume-parser-api).

## H. Monetisation — what models actually work for job boards

From research:
- **Pay-per-post** is the simplest and the most common. Tech boards charge **$300–600 per listing** (US/global). For Nepal, equivalent **NPR 5,000–15,000 per published listing** for first 30 days — needs market validation but is the right ballpark.
- **Featured / pin to top** upgrade at **$29–100** (or NPR 1,000–4,000) converts at **15–25% of paying employers** when offered. Highest-margin upsell.
- **Freemium** (free posts → premium tier) — only **~4% of free signups convert**, and job boards perform worse than that average. **Don't build a freemium tier as the primary model.**
- **Subscription bundles** ("post 5 jobs / month for X") work for medium-volume employers (consultancies, BPOs).
- **Resume database access** — paid tier for employers, enabled by candidate `discoverable` opt-in (already on Phase 5).

**For our context (Nepal, early)**:
1. Phase 4 — keep everything free. Get the first 50 listings + 200 candidates the hard way.
2. Phase 5 — add **featured listing** (`is_featured` boolean + a `featured_until` date), priced as one-off via Esewa/Khalti. No subscription yet.
3. Phase 6+ — when traction is real, pay-per-post tier for guaranteed featured + applicant CSV export.

Reference: [Cavuno — Job board pricing models](https://cavuno.com/blog/job-board-pricing-models), [Cavuno — Job board monetization](https://cavuno.com/blog/job-board-monetization).

## I. Things I'd drop into the existing roadmap right now

Adding to the **Phase 4** list (it's the highest-impact pass):
- 4.8: **JSON-LD JobPosting + `validThrough`** on every published `/jobs/:id`
- 4.9: **Email-domain verification gate** on employer signup (block free email)
- 4.10: **"We never ask you to pay to apply"** trust strip on landing + footer
- 4.11: **Report listing** button + `flagged_listings` table + admin email notification
- 4.12: **Salary placeholders** on `JobForm` — pre-fill the min/max sliders with the Nepali market anchors (junior 30–60k, mid 80–150k, senior 150–400k) when employer picks an experience level
- 4.13: **`client_geography` enum** on jobs (local / foreign / mixed) — visible filter chip on the candidate feed
- 4.14: A11y pass — focus trap on apply modal, `aria-activedescendant` in SkillsInput, error summaries

Adding to **Phase 5**:
- 5.11: **Featured listing** monetisation primitive
- 5.12: Esewa/Khalti payment integration

## J. New non-goals (clarifications)

- **Don't build resume parsing** until candidate volume justifies it. The profile is already richer than a parsed PDF.
- **Don't build complex scorecards / interview kits** until employers are actually asking for it. Pipeline stages + notes covers the first 80%.
- **Don't build swipe-to-apply / Tinder-mode** — research is mixed and it dilutes the "considered match" positioning we already have.

## K. Sources (deep-dive pass)

- Salary + Nepal IT — [PayScale Software Developer Nepal](https://www.payscale.com/research/NP/Job=Software_Developer/Salary), [Kumarijob — IT Engineer salary](https://www.kumarijob.com/blog/job-salary-in-nepal/it-engineer-salary-in-nepal), [The London College — Highest paying tech jobs](https://thelondoncollege.edu.np/blogs/highest-paying-tech-jobs-in-nepal)
- BPO / outsourcing — [Kantipur Management — Nepal BPO 2026](https://kantipurmanagement.com/nepal-bpo-hr-outsourcing-to-nepal/)
- Anti-scam — [Indeed — Identify fake postings](https://www.indeed.com/career-advice/finding-a-job/how-to-know-if-a-job-is-a-scam), [Built In — Spot fake applicants](https://builtin.com/articles/spot-fake-job-applicant-scams), [FlexJobs — 30 job scams 2026](https://www.flexjobs.com/blog/post/common-job-search-scams-how-to-protect-yourself-v2)
- SEO / Google for Jobs — [Hashmeta — Job-posting SEO](https://hashmeta.com/blog/job-posting-seo-implementing-schema-markup-to-land-roles-on-google-for-jobs/), [Google — JobPosting structured data](https://developers.google.com/search/docs/appearance/structured-data/job-posting), [Schema.org JobPosting type](https://schema.org/JobPosting)
- Mobile UX — [Smart Interface Design — Autocomplete](https://smart-interface-design-patterns.com/articles/autocomplete-ux/), [LogRocket — Search UX](https://blog.logrocket.com/ux-design/design-search-bar-intuitive-autocomplete/), [Algolia — Mobile search](https://www.algolia.com/blog/ux/mobile-search-ux-best-practices)
- A11y — [PMC — Accessibility of online job apps](https://pmc.ncbi.nlm.nih.gov/articles/PMC10961918/), [WebAIM — WCAG 2 checklist](https://webaim.org/standards/wcag/checklist), [WAI — 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
- ATS / scorecards — [Greenhouse on G2](https://www.g2.com/products/greenhouse/reviews), [Lever review 2026](https://desking.app/lever-review/)
- Resume parsing — [Skima — Best resume parser APIs 2026](https://skima.ai/blog/industry-trends-and-insights/best-resume-parser-api), [Affinda](https://www.affinda.com/), [RChilli](https://www.rchilli.com/)
- Monetisation — [Cavuno — Job board monetization](https://cavuno.com/blog/job-board-monetization), [Cavuno — Pricing models](https://cavuno.com/blog/job-board-pricing-models), [Niceboard — Pricing models](https://niceboard.co/learn/monetizing/4-different-revenue-models-for-job-boards)
- Merojob — [Product overview](https://www.everythinginnepal.com/merojob-app-revolutionizing-employment-in-nepal-1244), [Employer zone](https://merojob.com/employer-zone)
