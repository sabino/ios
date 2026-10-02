# iPhone OS Research Atlas

**An independent field guide to early iPhone OS, built from a fixed research snapshot.**

[Read the atlas](https://sabino.pro/ios/) · [Concept map](https://sabino.pro/ios/map/) · [Evidence Atlas](https://sabino.pro/ios/evidence/) · [Research method](https://sabino.pro/ios/method/)

The atlas preserves the discoveries, failed explanations and remaining questions from research into iPhone OS 1.1.4 (4A102). It connects boot state, CPU compatibility, memory, I/O Kit, storage, graphics, input and experimental method. Its three environments—the original iPod reference, a partial PinePhone emulator and physical PinePhone hardware—are identified separately.

## Read it in three ways

- **30 chapters** explain the contracts and the evidence behind them.
- **Three guided paths** trace boot to userspace, follow a pixel, or examine how the evidence changed.
- **The concept map** connects related questions. These are editorial relationships, not a recovered call graph.

The publication includes 40 evidence records with 72 concrete exhibits and 56 inspectable source excerpts, 21 public references, a glossary, a correction ledger and a downloadable [structured edition](https://sabino.pro/ios/atlas.json). Search runs locally in the browser. Fonts are served locally; there are no analytics, cookies or AI service calls.

## What the evidence establishes

Edition 1.2 reviews source revision `ec07dd0fedd12c0e00bd1052388235cbfda18de4`. It adds accepted physical touch and gestures, the separate M68AP home screen, native battery measurements, Camera preview and VGA photographs that reopen after a fresh boot. Preview delivery, distinct-image selection and display updates remain separate metrics. Audio playback, modem/Wi-Fi integration, full suspend, higher-resolution stills and broad app coverage remain open. E01–E28 retain their earlier snapshot and payload; E29–E40 record the reviewed advances. See [the edition changelog](docs/CHANGELOG.md).

The experiments are **reported private project results**. Public records preserve the observation, method, environment, limitations, reviewed document name and SHA-256 digest. A digest identifies a document; it does not make its findings independently reproducible. Public upstream references supply architectural context, not independent replication of these local experiments.

This repository contains original editorial writing, original diagrams, curated metadata, selected reviewed capture images and short source excerpts, and the website implementation. It does **not** distribute the port implementation, proprietary firmware, decrypted images, device dumps, complete raw run logs, keys or firmware modification procedures.

## Develop

Requires Node.js 22.12 or later (CI uses Node 24).

```sh
npm ci
npm test
npm run build
npm run preview
```

The preview is served under `/ios/`. `npm run dev` starts the development server. The build validates cross-references and evidence metadata, generates search and structured data, builds static HTML, then checks every local link and asset across the rendered pages.

For a browser already running in an isolated QA workspace:

```sh
ATLAS_CDP=http://127.0.0.1:PORT npm run test:browser
```

The browser check covers the main page templates, shared header/content/footer gutters at five widths, accessibility checks, search, map interactions, evidence filters, reduced motion and reading without JavaScript. `ATLAS_URL` can point to a deployed edition; screenshots and reports default to ignored `test-results/`.

`npm run test:evidence` uses the same isolated-browser settings to check every evidence tile against its record, all dated milestones, shared chapter links, combined filters, saved URLs, keyboard navigation, seven viewport widths, print and motion preferences.

`npm run test:reading` checks the homepage's three animated illustrations, artwork and button links, aligned 48px buttons, hover transformations, six viewport widths, both themes, automatic motion, the shared pause control, live reduced motion, print and the no-JavaScript fallback.

`npm run test:focus` checks the Status count controls, every original capability and score, connected component highlights, the three status cohorts, restore and saved URLs, browser history, keyboard controls, responsive geometry, both themes, pause, live reduced motion, print and no-JavaScript reading. `npm run test:status` covers the existing research-domain and area navigation.

## Repository guide

| Path | Purpose |
| --- | --- |
| `content/articles/` | Original chapters, with structured frontmatter |
| `src/data/` | Evidence, references, glossary, corrections and edition metadata |
| `src/pages/` | Static publication routes |
| `src/components/` | Original reusable diagrams |
| `src/lib/` | Content relationships, local search and progressive enhancement |
| `scripts/` | Editorial validation, link checks and browser QA |
| `docs/EDITORIAL.md` | Evidence model, maintenance and publication protocol |
| `public/atlas.json` | Generated, portable edition of the public content |

## Publish

The `Pages` workflow tests and builds `main`, then publishes only `dist/` using GitHub Pages. Pages is configured for GitHub Actions. The project uses Astro's `/ios/` base and inherits the account site's `sabino.pro` domain. **Do not add a project CNAME or change the account website.**

Before publishing a new edition, follow [the editorial protocol](docs/EDITORIAL.md). Changes to the live research repository do not automatically update this publication.

## Credits and license

[Understand-Anything](https://github.com/Egonex-AI/Understand-Anything) inspired the connected-concept and guided-reading organization; its code is not incorporated. Claude participated in interface design and review. Original diagrams avoid firmware screenshots and product trade dress.

Original content, diagrams, curated data organization and site code: [MIT](LICENSE). Schibsted Grotesk and IBM Plex Mono: SIL Open Font License, included under `public/licenses/`. Linked works retain their own licenses. Apple and PINE64 names are descriptive; this publication is independent of both organizations.

## Reading and appearance

The [timeline](https://sabino.pro/ios/timeline/) connects dated records to continuous reading paths and open questions. The concept map offers a draggable graph, a structured view and a list. Search includes addresses and selected logs. Appearance supports Light, Dark and System; the preference is stored locally. No preference is sent to a server.

The Evidence Atlas arranges all 40 records in six colored research lanes. Its history rail retains the 15 published milestones from 23 September through 1 October; separate review nodes identify the two source snapshots. A selected record shows its claim, limits and chapter citations. Dashed links identify records cited together, and one editorial category per tile supports browsing across the collection. Search, environment and review filters combine, with a full ledger view for continuous reading. These arrangements add no experimental claims or dates.

Research captures retain explicit environment labels. The physical photo is cropped to its screen without changing decoded pixel values; its crop bounds and source digest are preserved. Apple interface content retains its original rights.
