# Preprint preparation

The article is a systems research preprint prepared for arXiv submission. It has
not been submitted, accepted, assigned an arXiv identifier or peer reviewed.
The downloadable PDF and source archive represent the reviewed 7 October 2026
edition, with publication source snapshot `15b3a954f6d81eb858d0c11f372a8ae1e29d0788`.

## Files

- `public/downloads/early-iphone-os-native-pinephone-preprint.pdf`: reader PDF.
- `public/downloads/early-iphone-os-native-pinephone-preprint-source.zip`: upload
  archive, with `main.tex` at the root, all nine used figure files, and curated
  evidence and measurement data in `anc/`.
- `public/downloads/early-iphone-os-native-pinephone-preprint-metadata.json`:
  title, author, ASCII abstract, suggested category and comments for the form.
- `public/downloads/arxiv-submission-guide.txt`: concise submission steps.
- `public/downloads/early-iphone-os-native-pinephone-preprint-sha256.json`:
  artifact integrity hashes.

Upload the source ZIP. arXiv requires TeX source when a paper was prepared using
TeX; the separate PDF is for reading and comparison with the platform's output.
The ZIP excludes the compiled article PDF, auxiliary files, build logs,
instructions, unused images and the publication's implementation tools.

## Requirements reviewed

The preparation follows the official requirements checked on 7 October 2026:

- [Format requirements](https://info.arxiv.org/help/policies/format_requirements.html):
  author and title, complete references, machine-readable single-spaced text,
  10–14 point body type and at least one-inch margins. This article uses a US
  Letter, two-column `article` class, 10-point body/captions/tables and 1.05-inch
  margins including the page-number footer. Print diagram labels are drawn at
  their final 10-point size. It has no line numbering, margin notes or
  obstructive watermark.
- [TeX source requirements](https://info.arxiv.org/help/submit_tex.html):
  a single top-level `main.tex`, fixed date, embedded PDF/PNG figures, standard
  packages, embedded bibliography and no runtime figure conversion. No shell
  escape, external font lookup or network access is required to compile.
- [TeX Live at arXiv](https://info.arxiv.org/help/faq/texlive.html): PDFLaTeX and
  TeX Live 2025 are supported. Local validation uses TeX Live 2025's final
  distribution, rather than claiming bit-identical packages to arXiv's frozen
  distribution. Review arXiv's generated PDF during the actual upload.
- [PDF requirements](https://info.arxiv.org/help/submit_pdf.html): fonts are
  embedded, text is selectable, and no encryption or JavaScript is present.
- [Ancillary files](https://info.arxiv.org/help/ancillary_files.html): the
  reviewed JSON records and exact plotted values are in `anc/`; figures used by
  the article remain in `figures/`.

There is no universal arXiv cover page or mandatory journal template. This is an
independent systems preprint layout, without publisher branding or an acceptance
claim.

## Typesetting and figure style

The [USENIX systems-paper guidance](https://www.usenix.org/conferences/author-resources/paper-templates)
informs the two-column US Letter layout and 10-point Times-style body on
12-point leading. arXiv's minimum one-inch margins take precedence over the
USENIX template's wider text block: the preprint uses a 6.4-inch text width,
an 18-point column gap and 1.05-inch margins. Standard PSNFSS packages provide
embedded Nimbus fonts; no publisher-specific class or custom font lookup is
needed during upload.

Wide matrices, architecture diagrams and descriptive tables span both columns.
Camera and display plots are drawn at the actual column width, with 10-point
labels, zero-based linear axes, units and directly labelled values. Solid and
outline bars distinguish queue configurations in grayscale. The single logging
sample has an explicitly separate scale from the 64-presentation idle means;
there are no invented uncertainty bands or population comparisons. This follows
the [ACM figure guidance](https://authors.acm.org/binaries/content/assets/publications/taps/acm_layout_submission_template.pdf)
to preserve distinctions in grayscale.

Original explanatory diagrams use square boxes, light gray fills, consistent
line weights and directed connectors. Dashed architecture connectors identify
boot/reset transitions. The three reviewed captures retain their original bytes
and colors. Captions remain below figures and above tables. Long source names
can wrap at punctuation, and table widths follow the actual column contents.
Explicit cross-references connect deferred floats to their relevant subsection.

This formatting revision replaces the earlier 25-page single-column reader with
an 18-page paper, retaining seven figures, ten tables and the reviewed findings.
Related work now contains twenty-one primary references, including six verified
papers supplied by the author. The corrected full author name is used throughout
the paper, site citation and metadata. Research findings, capture hashes and the
edition's source revision are unchanged.

The HTML paper omits the preprint submission panel, download controls, metadata
and submission-guide links at the author's request. The independently prepared
PDF and source archive remain available as files.

## Submission decisions

`cs.OS` (Operating Systems) is suggested from the article's subject and the
[official taxonomy](https://arxiv.org/category_taxonomy). It is a preparation
recommendation, not a classification assigned by arXiv. The author selects the
category and [submission license](https://info.arxiv.org/help/license/index.html)
in the form. The repository MIT license covers original material; depicted
third-party interfaces retain their original rights. No license agreement or
submitter attestation has been selected on the author's behalf.

The author is Felipe Guilherme Sabino, as in the reviewed publication. No unverified
affiliation, email address or ORCID was inserted. Journal reference, DOI and
report number are intentionally empty. A new account may need
[endorsement](https://info.arxiv.org/help/endorsement.html) for the chosen
category; this is a platform step after account creation.

## Rebuild

Install the Python packages in `scripts/arxiv-requirements.txt` in an isolated
environment. Make a TeX Live 2025 `pdflatex` available on that command's `PATH`.
The generation reads only this publication repository's reviewed prose, data
and selected capture files:

```sh
npm run build
python scripts/build-arxiv.py
npm run build
npm test
```

The first website build supplies semantic article HTML; the second copies the
new downloads into the static site. Print diagrams use embedded Bitstream Vera
fonts supplied by ReportLab. Camera/display chart values come directly from
`public/paper-evaluation.json`; listener timing is parsed from the selected E54
record. The three reviewed captures are copied byte for byte.

Generated TeX, print figures and curated ancillary data are retained in
`arxiv/`. Compiler intermediates stay in ignored `tmp/pdfs/`. Final local
artifacts are also copied into ignored `output/pdf/` for delivery.

Do not regenerate this snapshot from unreviewed implementation results.
Changed findings require a new reviewed evidence record and edition.

The completed artifact and browser checks are recorded in
[ARXIV_REVIEW.md](ARXIV_REVIEW.md).
