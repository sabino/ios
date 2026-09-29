# Edition 1.1 publication review

Reviewed: 2026-09-29. Research snapshot unchanged from edition 1.0.

## Content and capture provenance

- All 28 evidence records now provide 57 concrete exhibits and 42 inspectable source excerpts.
- All 42 excerpts were compared directly against reviewed sources: 36 notebook/JSON selections and six original UART/GDB line selections. Full-source SHA-256 matched in each case.
- Five capture assets were reviewed visually. QEMU images retain environment and run labels. The sole physical photograph is an 808 × 420 screen crop at (472, 60) from a 1280 × 720 source; decoded RGB pixels were compared exactly after lossless PNG export. The full uncropped photograph is not published.
- Captures have SHA-256, dimensions, captions and rights notes. Image digests are enforced during the build. Original source digests and crop bounds remain in E05.
- No firmware, storage images, full logs, port source, personal paths or session transcripts were imported. Selected excerpts preserve omissions and normalization notes.
- The research timeline distinguishes dated reports, within-run sequence numbers and open questions. Short original explanations of ABI, memory, instruction and filesystem concepts are not the port implementation.

## Behavior and visual review

- Production build: 64 pages with local links and assets checked. Six unit checks pass.
- Chromium: 22 sampled desktop, mobile and dark page states report zero axe WCAG A/AA violations and zero page errors. This is a scoped automated check, not a certification.
- Light, Dark and System preferences persist across navigation/reload. System follows live OS changes. Appearance remains usable when browser storage is blocked.
- Graph selection, dragging, zoom, reset, structured/list modes and reduced motion were exercised. Mobile defaults to the readable list; its graph remains available with a closer initial view. No-JavaScript reading and map-list fallback were checked.
- Search finds addresses and source text; selected-source links open their excerpts, and the record JSON download was checked.
- Every chapter was checked at 360px for page overflow. Tables and logs have keyboard access and visible scrolling cues.
- Claude reviewed screenshots and interaction code. Fixes address mobile graph readability, domain grouping, log source locators, scroll cues and appearance-selector scope. Cropped-photo and dark-mode screenshots were inspected directly after implementation.

Browser checks are documented and available through `npm run test:browser` with a dedicated QA browser endpoint. The Pages workflow repeats content, unit and static-link checks.

---

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
