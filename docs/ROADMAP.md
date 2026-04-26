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
- Merojob — [Product overview](https://www.everythinginnepal.com/merojob-app-revolutionizing-employment-in-nepal-1244), [Employer zone](https://merojob.com/employer-zone)
