# Edition 1.0 publication review

Reviewed: 2026-09-29.

## Content

- 24 original chapters, 28 curated evidence summaries and 18 public references.
- Private document digests matched the reviewed snapshot.
- All 18 public reference URLs returned HTTP 200 during the publication review. Availability does not establish the truth of a research claim.
- The reviewed revision is recorded in `src/data/publication.json`; later live research is outside this edition.
- Public files were deliberately authored or curated. No private source tree, firmware, raw experiment logs or session transcripts were imported. Pattern checks supplemented the file review.

## Site

- Node unit checks cover research references, provenance validation, negative controls for the publication gate, local search and graph reachability.
- The production build creates 63 HTML pages and checks their local links and assets.
- Chromium review covered home, chapter, concept map, evidence record and method pages at desktop and mobile sizes. Automated axe checks reported no WCAG A/AA violations on those sampled page states. This is a scoped check, not a certification.
- All 24 chapter layouts were checked at a 360px viewport for page overflow.
- Search, empty results, Escape, keyboard shortcut, graph focus/reset/list view, evidence filters, reduced motion and no-JavaScript chapter reading were exercised.
- The selected graph and open search dialog were also checked for accessibility issues.
- Claude reviewed rendered screenshots and proposed concrete changes to mobile diagrams, type sizes, evidence hierarchy, reading width and map placement. Those changes were incorporated and rechecked.

The workflow repeats content, unit and static-link checks on every publication. Browser review is documented in the repository but is not currently an automated CI deployment gate. Run it again when interaction or layout changes.
