# iPhone OS Research Atlas

**An independent field guide to early iPhone OS, built from a fixed research snapshot.**

[Read the atlas](https://sabino.pro/ios/) · [Concept map](https://sabino.pro/ios/map/) · [Evidence ledger](https://sabino.pro/ios/evidence/) · [Research method](https://sabino.pro/ios/method/)

The atlas preserves the discoveries, failed explanations and remaining questions from research into iPhone OS 1.1.4 (4A102). It connects boot state, CPU compatibility, memory, I/O Kit, storage, graphics, input and experimental method. Its three environments—the original iPod reference, a partial PinePhone emulator and physical PinePhone hardware—are identified separately.

## Read it in three ways

- **24 chapters** explain the contracts and the evidence behind them.
- **Three guided paths** trace boot to userspace, follow a pixel, or examine how the evidence changed.
- **The concept map** connects related questions. These are editorial relationships, not a recovered call graph.

The publication includes 28 evidence summaries, 18 public references, a glossary, a correction ledger and a downloadable [structured edition](https://sabino.pro/ios/atlas.json). Search runs locally in the browser. Fonts are served locally; there are no analytics, cookies or AI service calls.

## What the evidence establishes

Edition 1.0 reviews source revision `a87a56a30513fb600a61758541465e613f0d8813`. Its physical frontier includes original-client setup imagery, display wake through the original HID path, checked storage runs and a measured charging observation. Touch integration, useful audio output and a generally usable phone are not established by this edition.

The experiments are **reported private project results**. Public records preserve the observation, method, environment, limitations, reviewed document name and SHA-256 digest. A digest identifies a document; it does not make its findings independently reproducible. Public upstream references supply architectural context, not independent replication of these local experiments.

This repository contains original editorial writing, original diagrams, curated metadata and the website implementation. It does **not** distribute the port implementation, proprietary firmware, decrypted images, device dumps, raw run logs, keys or firmware modification procedures.

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

The browser check covers desktop and narrow layouts, accessibility checks, search, map interactions, evidence filters, reduced motion and reading without JavaScript. `ATLAS_URL` can point to a deployed edition; screenshots and reports default to ignored `test-results/`.

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
