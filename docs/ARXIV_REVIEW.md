# Preprint artifact review — 7 October 2026

Status: prepared for arXiv submission; not submitted or peer reviewed. Website
changes are local pending publication. Research scope and source snapshot remain
edition 2.0 / `15b3a954f6d81eb858d0c11f372a8ae1e29d0788`.

The final reader PDF contains **25 pages, seven figures, ten tables, fifteen
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
- All 22 font resources are embedded, subset and Unicode mapped. No Type 3
  fonts, encryption, forms or JavaScript; `qpdf --check` passes.
- A4, 11-point body type, 10-point captions/tables and 1.05-inch margins
  including the page-number footer. Actual extracted glyph bounds remain at
  least one inch inside all page edges. The smallest diagram label is 10.09
  points after scaling into the article.
- Rendered and inspected all article, figure, table, reference and index pages.
  The final compact index fits on page 25; the other 24 pages are pixel-identical
  to their inspected final-layout renders. No clipped or overlapping labels.
- All fifteen reference destinations and 44 E destinations resolve internally.
  The ancillary catalog supplies all 63 reviewed records and the 64-claim
  mapping, with selected field locators and capture provenance.
- All three capture files are byte-identical to the already reviewed public
  captures. Original vector drawings use the selected measurement data; no
  evidence image is generated, retouched or cropped for the preprint.
- ASCII metadata abstract: 1,517 characters; title and author agree with the
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
- All four download links return the expected MIME types and bytes. Real
  Chromium downloads of the final PDF, source ZIP, metadata and guide complete
  and match the final artifact hashes. Download controls fit at 320, 390, 768
  and 1440 pixels; keyboard Enter activates the PDF download.
- The concept map and wider atlas interactions retain the unchanged edition's
  prior review in `PAPER_REVIEW.md`. This preparation changes the paper header
  and download assets, without changing the graph or research data.

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
