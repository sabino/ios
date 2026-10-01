# Status page design and architecture review

Reviewed locally: 2026-10-01. This presentation supersedes the earlier side-panel layout below. No research record or deployment was added.

- The compact overview leads into one capability explorer. Its 22 feature entries are rendered once and filtered by research domain; “All 22 features” restores the complete list. Feature descriptions, limits, categories (including Camera M68AP scope), environments and evidence addresses stay visible. Scores and longer evidence references expand in place. The page uses normal document scrolling, including for the longest domain.
- An imagegen target guided two implementation and screenshot review passes. Working targets and screenshots remain in the ignored `.dream-loop/` directory and are not research exhibits or public assets. The design preserves the atlas typography and domain colors. The generated image's invented links and build labels were not adopted.
- Foundations sits at the bottom of the five research plates. Method is a bracket spanning the domains. The separate OS view places hardware below XNU and drivers, then services/frameworks and applications. The explanatory disclosure cites Apple's kernel and framework documentation and distinguishes the research categories from literal OS layers.
- Design decisions draw on [progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/), [visual hierarchy](https://www.nngroup.com/articles/principles-visual-design/), [appropriate disclosure use](https://www.nngroup.com/articles/accordions-on-desktop/), [keyboard tab behavior](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) and [reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow). These are design applications, not results from a user study.
- The production build passes for 65 pages and all local links/assets; all six unit checks pass. The status review checks all six domain mappings, 22 unique entries, rendered diagram click targets, both diagram orders at six widths (320–1440px), five light/dark accessibility states, keyboard controls, expanded scores, motion preferences, print, no-JavaScript reading and legacy anchors. It reports no JavaScript errors or sampled axe WCAG A/AA violations.
- The homepage hero suite passes eight widths and six accessibility states, including its arrows, touch gestures, keyboard navigation, hover, pause and research/OS views. The broader site suite passes 22 sampled page states and navigation, search, concept-map, appearance and responsive-reading checks without JavaScript errors or sampled axe violations. Automated checks are scoped checks, not accessibility certification.

---

# Status layer explorer review

Reviewed locally: 2026-10-01. Presentation and capability categorization only; no new research record or deployment.

- Selecting an atlas layer shows the related matrix entries beside the animated stack. Both views share the feature renderer and capability data, including status, notes, environment, scores and evidence links. Entries may relate to more than one layer; observations without evidence addresses are marked as awaiting a record.
- The desktop panel keeps a stable height across selections and scrolls internally. It moves below the diagram on smaller screens. Keyboard selection and scrolling, touch selection, matching domain colors, chapter links, evidence links and the full matrix link were checked. The full matrix remains readable without JavaScript.
- `npm run build` passes for 65 pages and `npm test` passes all six checks. Status layouts were checked from 320 to 1440px, with light/dark accessibility checks at 320, 390 and 1440px. All six layer selections were compared with the matrix. Reduced motion and print layout were checked. The existing homepage hero suite also passes its eight viewport widths and six accessibility states.

---

# Homepage interaction review

Reviewed locally: 2026-10-01. Presentation changes only; no new research record or deployment.

- The opening hero contains six animated layers drawn from the same section names, descriptions, chapter counts and color tokens as the atlas. The second slide presents “What runs,” with controls on both sides, keyboard navigation and touch gestures.
- Both illustrations appear near the top on phones. Hidden slides are inert, ambient motion can be paused, reduced motion is respected, and both stories remain readable without JavaScript.
- Device frames are original CSS illustrations using the reviewed E28 reference capture. They are labeled as illustrations, not photographs or evidence of a physical run. The unused draft capture is excluded from public assets. The fixed evidence ledger remains distinct from development-line observations.
- `npm run build` passes for 65 pages; `npm test` passes all six checks. The existing browser suite passes 22 sampled page states with no JavaScript errors or axe WCAG A/AA violations. The hero suite passes eight widths from 320 to 1440px, six accessibility states, rendered layer hit tests, both side arrows, keyboard controls, motion preferences, no-JavaScript reading and touch navigation.

Run `npm run test:hero` with `ATLAS_CDP` pointing to a dedicated QA browser; `ATLAS_URL` and `ATLAS_QA_DIR` may override the preview address and artifact directory.

---

# Connected reading publication review

Reviewed: 2026-09-29. Presentation and navigation update; research snapshot unchanged.

- Inline evidence cards show existing exhibits and claim limits. Chapter maps open the corresponding card, and full records provide a return link to the chapter.
- Chapter neighborhoods, mobile map sheets, local reading progress and next-chapter links connect the existing material without adding research claims.
- Six unit checks pass. The production build produces 64 pages and passes content, link and asset checks.
- The full browser review passes across 22 sampled desktop, mobile and theme states, with no JavaScript errors or sampled axe WCAG A/AA violations.
- `scripts/connections-check.mjs` exercises map-to-exhibit expansion, keyboard exhibit tabs, return navigation, the mobile sheet, Escape and responsive accessibility. It uses `ATLAS_CDP` for a dedicated QA browser and optionally `ATLAS_URL` for a deployed site.
- The graph motion review covers animated zoom, dragging, release momentum, reset, reduced motion and keyboard selection in `scripts/graph-check.mjs`.

---

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
