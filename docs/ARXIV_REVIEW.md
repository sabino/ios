# Preprint artifact review — 7 October 2026

Status: prepared for arXiv submission; not submitted or peer reviewed. Website
changes are local pending publication. Research scope and source snapshot remain
edition 2.0 / `15b3a954f6d81eb858d0c11f372a8ae1e29d0788`.

Formatting revision: two-column systems-paper typography; author identity
corrected to Felipe Guilherme Sabino. The earlier single-column 25-page artifact
is superseded. Findings, plotted values and capture pixels retain the reviewed
edition; related work gains six checked papers without a priority claim.
Formatting sources and choices are documented in `ARXIV.md`.

The final reader PDF contains **18 pages, seven figures, ten tables, twenty-one
primary references and 44 cited E-record identities**. The source ZIP contains
14 files: one top-level TeX document, nine used figure files, and four curated
ancillary files. It contains no compiled article PDF, compiler intermediates,
unused figures, firmware, implementation assets or private source paths.

## PDF and source verification

- Compiled the upload ZIP from a clean extraction using PDFLaTeX / TeX Live
  2025 with shell escape disabled. Three passes resolve the references and
  destinations; extracted text matches the delivered reader PDF.
- No overfull boxes, unresolved citations or undefined references. The sole
  package warning reports disabled shell escape for the unused EPS-conversion
  helper; all actual figures are already PDF or PNG and require no conversion.
- All 20 font resources are embedded, subset and Unicode mapped. No Type 3
  fonts, encryption, forms or JavaScript; `qpdf --check` passes.
- US Letter, two columns, 10-point body type/captions/tables and 1.05-inch margins
  including the page-number footer. Actual extracted glyph bounds remain at
  least one inch inside all page edges. Diagrams and charts are drawn at their
  final print width with 10-point labels.
- Rendered and inspected all article, figure, table, reference and index pages.
  Every page was rendered after the final layout change. No clipped or
  overlapping labels; standalone table subsections have explicit cross-references.
- All twenty-one reference destinations and 44 E destinations resolve internally.
  The ancillary catalog supplies all 63 reviewed records and the 64-claim
  mapping, with selected field locators and capture provenance.
- All three capture files are byte-identical to the already reviewed public
  captures. Original vector drawings use the selected measurement data; no
  evidence image is generated, retouched or cropped for the preprint.
- ASCII metadata abstract: 1,523 characters; both `7E18` build identifiers remain
  intact after removing only E-record citation links. Title and author agree with the
  paper, comments report the actual page/figure/table counts, and journal
  reference/DOI/report number remain empty.
- Privacy scan of the packaged source/data found no private filesystem paths
  or credentials. ZIP integrity passes, with no extra or unused figure files.

## Publication verification

- `npm run build`: 110 pages; all local links and assets pass under `/ios/`.
- `npm test`: nine tests pass.
- `npm run test:paper` in the task's isolated browser: 42 responsive layouts,
  24 accessibility audits with no violations, both themes, numbered references,
  images, keyboard table scrolling, search, claim disclosures, hero navigation,
  reduced motion, print and reading without JavaScript pass.
- After the author's follow-up, the HTML submission panel and all four download
  links are removed, together with their unused CSS. A scoped final browser
  review verifies their absence, the corrected citation, all 21 reference
  anchors and keyboard citation navigation. The page fits at 320, 390, 768 and
  1440 pixels; two sampled accessibility audits have no violations or page errors.
- The final PDF and source archive still return HTTP 200 with correct MIME
  types, lengths and artifact bytes through their direct local preview paths.
- The concept map and wider atlas interactions retain the unchanged edition's
  prior review in `PAPER_REVIEW.md`. This preparation changes the author identity,
  paper typography, related work, header and artifacts, without changing the
  concept graph or underlying experiment/claim records.

## Added literature review

References 16–21 are checked against primary paper text and author/publisher
metadata. arXiv versions are pinned; MobileAtlas cites the published USENIX
paper rather than the supplied prepublication PDF.

- Roty, Mühlberg and Determe (2026, v2), Sections 3–4: PinePhone boot-chain and
  TEE integration experiments; the OP-TEE integration remains incomplete. The
  comparison separates preservation behavior from security guarantees.
- Keim, Yoon and Karabiyik (2021), Sections 3–4: Ubuntu Touch build 270 on a
  Braveheart PinePhone and removable-media forensic acquisition.
- Bowler and colleagues (2024, v4), Section 6: an off-the-shelf PinePhone wallet
  prototype, with final user testing still open.
- Sovereign Smartphone (2021, v1): user-control architecture and open-phone
  references; no PinePhone execution result is attributed to it.
- TEEtime (2023, v2), Sections V–VI and Appendix C: evaluation on Arm FVP,
  with simulator enforcement and physical-platform limitations. It is not
  described as a measured PinePhone deployment.
- MobileAtlas (2023), Section 6.1 and Appendix A.1: Raspberry Pi 4 / EG25-G
  measurement probe; the PinePhone connection is the modem note. It informs
  future experimental conditions, without establishing native XNU telephony.

The paper retains its explicit refusal to claim universal historical priority.
This targeted review is not an exhaustive novelty search or proof of absence.

Local PDF checks and browser reports are in ignored `test-results/`. Compiler
and rendering intermediates are temporary. SHA-256 manifests accompany the
downloads. The task's isolated QA workspace is stopped after verification;
the local site preview remains available for the author.

## Remaining platform steps

The author completes account registration, any required endorsement, category
and license selection, and the portal's final submission review. Local TeX Live
2025 validation does not claim access to arXiv's server or bit-identical package
versions. The author must inspect arXiv's generated PDF during upload, as
required by its official TeX submission instructions. See `ARXIV.md` and the
downloadable submission guide.
