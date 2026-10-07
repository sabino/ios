# Edition 2.0 publication review

Reviewed locally on 7 October 2026. Research snapshot: `15b3a954f6d81eb858d0c11f372a8ae1e29d0788`. This records a publication update and local preview, not deployment or a new hardware experiment.

## Content and provenance

The systems paper, accessible summary, edition note and 64-claim ledger accompany the updated 30-chapter atlas. Seven figures and ten tables distinguish substrates, measurement boundaries and acceptance. The paper names Felipe Sabino as author and states the role of AI assistance. All 63 evidence records remain connected to the reading atlas, search and portable exports.

- E01–E40 compare unchanged with the preceding edition's source payloads. Their dates and source revisions remain separate from the new publication metadata.
- E41–E63 were checked against the committed research snapshot. The audit verifies 60 supporting document identities and 189 selected JSON values at their recorded pointers. Static source/commit rationale remains distinct from a physical exception capture.
- Three selected captures compare byte-for-byte with their reviewed originals. Their basenames, hashes and full-image bounds appear in the ledger and evidence pages. No capture was generated, cropped or retouched for this edition. QEMU pixels and a physical-storage screenshot retain different labels; no selector photograph is claimed.
- The review retains failed USB enumeration/address checkpoints, fixed-delay refusal, an earlier failed automatic recovery, whole-capture incompleteness, TF-A HVC stalls and inherited-regulator rejection. Later success does not replace these records.
- Camera detail, throughput and persistence remain bounded: VGA acquisition is resampled for the stock still contract, legacy queue rates are not 7E18 FPS, and cold-power-cycle hand acceptance does not establish wider durability or repeatable ordinary restart.
- Source basenames, hashes and selected explanations are public; implementation, firmware, private paths, unique device identities and complete runs remain excluded. A scan of the curated publication files found no private-path or credential-pattern matches.

The 34 public source URLs were checked for reachability: 33 returned HTTP 200. The postmarketOS page remains unavailable to the review fetch and is explicitly marked in both its source entry and paper reference. A successful HTTP response is a link check; primary-source reading supplies the citation context. Numbered paper citations resolve to real reference anchors. No current support assertion is taken from the unavailable page.

## Build and browser verification

`npm run build` passes, generates 110 static pages and checks every local link and asset under `/ios/`. `npm test` passes all nine content, provenance and relationship checks.

The isolated browser suites were run sequentially against the local production preview. Reports and screenshots remain in ignored `test-results/`; no personal browser profile was used.

| Command | Reviewed coverage | Result |
| --- | --- | --- |
| `npm run test:paper` | Six publication/evidence routes at seven widths; 24 sampled accessibility states; seven figures, ten tables and 15 numbered references; claim search, keyboard table scrolling, print and no-JavaScript reading | Pass |
| `npm run test:focus` | All 34 capabilities, three cohorts and actual scores/notes; 15 geometry states across five widths; five sampled accessibility states; URLs/history, keyboard, pause, print and no-JavaScript reading | Pass |
| `npm run test:evidence` | All 63 records and 26 milestones on 15 dates; seven widths and eight sampled accessibility states; filters, limits, retained snapshots, record return, spatial keyboard selection, motion, print and no-JavaScript reading | Pass |
| `npm run test:hero` | Four stories and the retained layer explorer; eight widths and 12 sampled accessibility states; layer targets, keyboard, touch, inert slides, pause, reduced motion, print and no-JavaScript reading | Pass |
| `npm run test:status` | Domain/area navigation and all features; five widths and five sampled accessibility states; direct links/history, both themes, keyboard and score disclosure | Pass |
| `npm run test:browser` | Eighteen representative routes at five widths; 42 sampled accessibility states; search, appearance persistence, concept-map drag/zoom/reset/list/structured modes, excerpt downloads, reduced motion, no-JavaScript reading and every chapter at 360px | Pass |

The successful reports contain no JavaScript/resource errors or sampled axe WCAG A/AA violations. Visual inspection covers the paper in both themes, narrow-screen content, architecture and measurement figures, updated device illustrations and the Camera story. These checks assess the publication experience; they are not accessibility certification or independent reproduction of the underlying experiments.

Review fixes include keyboard-scrollable tables, shorter projected stack labels and readable narrow-screen Camera dimensions. Evidence navigation tests now wait for the returned atlas to initialize and check Home/End against visible category order rather than assuming numerical ID order.

## Release state

The local preview remains available for the owner's review. The QA workspace is stopped after verification. No push, deployment, domain change or modification to the implementation checkout is part of this publication update. Remote publication awaits the owner's preview approval.
