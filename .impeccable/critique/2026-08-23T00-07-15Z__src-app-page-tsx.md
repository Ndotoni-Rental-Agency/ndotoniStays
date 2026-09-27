---
target: homepage / src/app/page.tsx
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-23T00-07-15Z
slug: src-app-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | No loading feedback on search submit; hover reveal is the only micro-feedback on the page |
| 2 | Match System / Real World | 2/4 | Trust copy is generic SaaS language ("Instant Booking," "Verified Places"); zero mention of mobile money anywhere despite it being core positioning |
| 3 | User Control and Freedom | 3/4 | Location modal closes on backdrop click; no in-modal cancel affordance |
| 4 | Consistency and Standards | 2/4 | "Where?" field is a `readOnly` text input styled identically to a real input, with no visual cue it's actually a button that opens a full-screen modal (unlike the date fields, which show a calendar icon) |
| 5 | Error Prevention | 3/4 | Check-out correctly excludes invalid dates; but submitting with no dates at all searches silently, no validation message |
| 6 | Recognition Rather Than Recall | 3/4 | Category grid and quick-filter pills are scannable and recognition-friendly |
| 7 | Flexibility and Efficiency | n/a | Persuade/landing surface — not applicable |
| 8 | Aesthetic and Minimalist Design | 3/4 | Individually clean sections, but a 6-tile category grid and a 5th "filter" pill that's actually an external redirect add unnecessary decision load |
| 9 | Error Recovery | 3/4 | Location search has a clean empty state; no other error path is testable from this surface |
| 10 | Help and Documentation | n/a | Persuade/landing surface — not applicable |
| **Total** | | **22/32** | **Acceptable (68.75%)** |

## Design Specificity Verdict

This is the headline finding, and both assessments converge on it independently.

The homepage could be reskinned for a generic tropical-resort booking startup with almost no changes to its visual or interaction language. The hero background (`HeroSection.tsx:96`) is an Unsplash photo of a Thai/Balinese-style thatched overwater bungalow — it doesn't read as Dar es Salaam or Tanzania. The CTA section background (`CTASection.tsx:16`) is a generic timber-and-glass architectural interior, also Unsplash. Of six category tiles, only "Safari Stays" clearly signals East Africa; "Parties & Events" is stock balloon photography, "Work & Meetings" is a placeless loft interior.

More concretely: a grep across every homepage component and both i18n files (`en.ts`, `sw.ts`) turns up zero mentions of mobile money, M-Pesa, Tigo Pesa, or Airtel Money — despite PRODUCT.md naming local payment support as the core "local-first trust" pillar. TrustSection instead lists generic virtues (Instant Booking, Verified Places, WhatsApp Support, Fair Pricing) any booking platform could claim.

The one place the product clearly understands its own market: WhatsApp is used consistently and well — the floating FAB, a trust card, and the CTA button all route to a real number with locale-appropriate pre-filled messages (Swahili on the FAB, English on the host CTA). That's real product thinking; it's just surrounded by template-generic visuals and copy that launder it.

Separately: the "ndotoni" name is never rendered as visible text anywhere on the page — header and footer show only an abstract circular glyph plus the word "Stays." "ndotoni" exists only in the `<title>` tag and an `alt` attribute, which sighted users never see. Given PRODUCT.md explicitly names "ndotoni Stays" as the brand string to preserve, this is a real gap, not a nitpick.

Deterministic scan: `detect.mjs` reported 36 anti-patterns (46 raw logged instances) across low-contrast (19), undersized-ui-text (7), icon-tile-stack (7), image-hover-transform (6), text-occlusion (2), skipped-heading (1), layout-transition (1), dark-glow (1). Traced against source to separate signal from noise:

- False positives (27 of 46 instances) — confirmed by reading source: every low-contrast hit (19) sits on a section with a real background image + dark gradient overlay (HeroSection.tsx:96, CategoryGrid.tsx:95, CTASection.tsx:19) — the detector reads a DOM-ancestor white background rather than the painted image+overlay. Both text-occlusion hits (the "Where?"/"Guests" floating labels) are the standard floating-label CSS pattern (label positioned absolute, after the input in DOM order, so it paints on top) — a geometric bounding-box check flags the overlap without understanding paint order. All 6 image-hover-transform hits are a well-implemented, properly clipped hover-zoom on category cards (overflow-hidden on the card, group-hover:scale-110 on the image) — a nice touch, not a defect.
- Real, corroborated findings: undersized-ui-text (7 instances, text-[10px] labels in the search widget and step-number badges) is real and cross-page. skipped-heading (1 instance) is real: CTASection's `<h2>` ("Got a space people would love?") is followed directly by the Footer's `<h4>` columns, skipping `<h3>`.
- Corroborating, not a bug: icon-tile-stack (7 instances) is a recognized generic-SaaS layout cliché — independent mechanical evidence for the genericism verdict above, not a defect on its own.
- Unresolved, low confidence: layout-transition and dark-glow (1 each) both resolved to `body` rather than a specific element — not enough to act on without further isolation.

## Overall Impression

The bones are genuinely good — WhatsApp-first support, category breadth beyond lodging, a bilingual toggle, a rotating hero headline that communicates breadth without clutter. But the surface currently reads as a template applied to Tanzania rather than a product built for it: stock photography with no local specificity, trust messaging with no local payment story, and a brand name that's invisible to the very people it's trying to earn trust with. The single biggest opportunity is closing the gap between what PRODUCT.md says makes this product different (mobile money, local verification, WhatsApp) and what the homepage actually shows — right now only WhatsApp made it through.

## What's Working

1. WhatsApp as a first-class channel — FAB, trust card, and CTA button all route to a real number with locale-appropriate pre-filled messages.
2. Rotating hero headline (`HeroSection.tsx`, ROTATING_KEYS) — lightweight device that communicates category breadth without a cluttered subheading.
3. Non-lodging categories treated as first-class — Photoshoots and Work & Meetings sit equally weighted alongside Nightly Stays in CategoryGrid.

## Priority Issues

**[P1] No mobile money / local payment trust signal at the highest-stakes moment**
Why it matters: TrustSection's four cards never mention mobile money, escrow, or refund protection — the exact reassurance a guest needs before trusting a seed-stage local startup with money, and the exact thing PRODUCT.md names as this product's actual differentiator.
Fix: Replace or add a trust card naming the real local payment rails and what happens if something goes wrong.
Suggested command: /impeccable clarify

**[P1] Hero and CTA photography reads as generic tropical resort, not Tanzania**
Why it matters: HeroSection.tsx:96 and CTASection.tsx:16 are placeless Unsplash stock. The first visual impression a guest gets currently argues "offshore template," undermining the local-trust positioning before any copy is even read.
Fix: Source or commission Dar es Salaam / Zanzibar-specific photography (real listing photos would also double as evidence, which the product currently lacks).
Suggested command: /impeccable bolder (visual direction) or a content/asset pass outside Impeccable's scope

**[P2] Undersized UI text across the search widget and step badges**
Why it matters: Seven text-[10px] instances (search-field labels, step badges "01"/"02"/"03") sit below a comfortable legibility floor — confirmed independently by both the manual review and the mechanical scan.
Fix: Bump these to at least 11-12px; they're functional labels, not decoration.
Suggested command: /impeccable typeset

**[P2] "ndotoni" is never visible as text anywhere on the page**
Why it matters: Header/footer render only an abstract glyph + the word "Stays." "ndotoni" appears only in `<title>` and an `alt` attribute. A visitor has no visible name to recall, bookmark by, or connect to the sister product ndotoni.com.
Fix: Render "ndotoni Stays" as a visible two-part wordmark in the header.
Suggested command: /impeccable clarify or /impeccable layout

**[P2] Location search modal has no "Dar es Salaam first" grouping**
Why it matters: The modal lists ~25 regions alphabetically with no prioritization, even though Dar es Salaam is explicitly the flagship market and the pre-filled default.
Fix: Pin Dar es Salaam / Zanzibar (or a "Popular" section) above the alphabetical list.
Suggested command: /impeccable layout

## Persona Red Flags

**Jordan (First-Timer)**: Taps the "WHERE?" field expecting to type — it's styled identically to a normal text input, no chevron or affordance signaling it's actually a button that opens a full-screen modal. May also tap "Long Term Rentals" expecting an in-page filter and instead get bounced to a different website (ndotoni.com) in a new tab, with no visual distinction from the real filter pills next to it.

**Riley (Stress Tester)**: The "Under TZS 50K" and "Instant Book" pills give no visible active/selected state — they're one-way links to /search, not toggles. The guests `<select>` jumps 5→6→8→10→15→20→30→50, an odd, seemingly untested increment pattern.

**Casey (Distracted Mobile User)**: The floating WhatsApp FAB sits fixed at bottom-right for the entire page and visually overlaps/sits within ~80px of the CTA section's own "Chat with us" button — two near-identical green WhatsApp entry points stacked at the bottom of the same section. The sticky header also clips the CTA section's heading text during the scroll transition on mobile.

## Minor Observations

- Heading hierarchy skips a level: CTASection's `<h2>` → Footer's `<h4>`, no `<h3>` between them.
- LanguageToggle displays the target language, not the current one ("SW" while already in English) — inverts the usual toggle convention.
- Dead i18n key `hero.badge: "Over 100+ places available now"` exists in en.ts/sw.ts but is unused — looks like a deliberately-removed fabricated stat, worth deleting.
- CategoryGrid uses next/image; Hero and CTA backgrounds use plain `<img>` — inconsistent image-optimization strategy on the same page.
- The last content section before the footer is host-recruitment (CTASection), not guest-facing — for the primary persona (guest), the page's emotional arc peaks at "How It Works" and then pivots audience for the ending.
- CategoryGrid (6 tiles, one ungrouped decision) and the Guests select (12 flat options) both exceed the ≤4-item working-memory guideline for a single decision point.

## Questions to Consider

1. If mobile money is core to "local-first trust," why does the trust section never say the word — deliberate or an oversight?
2. Was "Stays" without "ndotoni" a deliberate minimalist brand choice, or did the wordmark get lost between design and implementation?
3. The homepage's last section before the footer recruits hosts, not guests — does that match "guests are primary" from PRODUCT.md, or has the page's information architecture quietly inverted that priority?
