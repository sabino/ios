# Editorial and preservation protocol

## The unit of publication is a bounded claim

A useful record answers six questions: what was observed, on which substrate, through which method, against which control, with what limitations, and in which reviewed source version? A visible milestone is never promoted into a claim about the entire system.

An article explains a contract and its implications. An evidence record summarizes a reported observation. A public reference explains the surrounding architecture. Keep these roles separate. A nearby source release can suggest an interpretation without proving the layout of the target binary. An emulator result cannot stand in for physical cache, interrupt or power behavior.

## Data model

Articles are Markdown with JSON frontmatter between `---` delimiters:

- `slug`, `title`, `description`, `section`, `order`, `updated`
- `evidence`: supporting ledger identifiers
- `sources`: public context reference identifiers
- `related`: directed editorial relationships to chapter slugs

The displayed map treats those relationships as undirected reading connections. It does not claim to describe runtime calls, ownership or experimentally established causality.

Evidence records contain `id`, `title`, `environment`, `method`, `observation`, `limits`, `status`, review date, optional recorded values, and private document identities. Recorded values always inherit the experimental scope of the record. Qualify estimates and separate repeated observations from a single run.

The structured `atlas.json` export has `schemaVersion: 1`, edition metadata, full original chapter text, evidence, sources, corrections and glossary. It preserves the public editorial layer in an ordinary portable format. Generated search and sitemap files are rebuilt from the same source.

## Source handling

1. Select a committed research snapshot. Do not consume another session's active working tree.
2. Review the original record and the acceptance result. Check the substrate and any negative controls.
3. Write a new public summary in original language. Retain both the accepted finding and its limits.
4. Record the reviewed document basename and SHA-256. A basename may need redaction if it identifies a person or device; document the redaction without publishing the original.
5. Check that the public statement remains supported at the pinned revision. Later findings belong in a later edition.
6. Link public primary references for context. Prefer a version or commit when its identity affects the claim.

Private records are not bundled. Their hashes establish the identity of the material reviewed by the editor and support a future authorized audit. The public reader cannot inspect that material here. Do not describe these records as independently replicated or publicly reproducible.

## Publication boundary

Publish original explanation, original schematic diagrams, bounded observations, non-identifying measurements and bibliographic references. Exclude personal paths, usernames in logs, emails, serial numbers, device identifiers, credentials, keys, proprietary storage images, implementation binary fragments, firmware modifications and raw session transcripts. Website source is original publication infrastructure, not port source.

Do not copy a whole directory from the private project. Work from a deliberately curated list. MIT covers this repository's original contributions; it cannot relicense a linked third-party work or proprietary software. Upstream names and symbols may be discussed descriptively without copying their implementation.

## Corrections and editions

When a hypothesis changes, preserve the earlier interpretation, the discriminating test and the replacement explanation in the correction ledger. Avoid silently polishing the history into a sequence of obvious successes. If the observation itself is invalidated, mark or withdraw the record and explain why.

A substantive evidence update requires a new pinned revision, explicit review dates and a changelog entry identifying affected records. Existing stable record IDs should not be reassigned to unrelated claims. Keep the initial edition recoverable through Git history and a release tag when issued.

## Review gates

- Check each claim against its record and distinguish observation from inference.
- Run `npm test` and `npm run build`; fix unresolved references and links.
- Review the repository's tracked file list and generated site for excluded material.
- Check responsive reading, keyboard navigation, search, map selection, filtering and no-JavaScript access.
- Confirm the `/ios/` base, canonical URLs and inherited project-domain behavior.
- Review the deployment run, then load the live root, a deep chapter, the map and a data export.

Automated privacy patterns catch only obvious mistakes. They supplement the curated source boundary and editorial review; they are not a claim that arbitrary material is safe to publish.

## Reviewed excerpts and capture images

Edition 1.1 publishes selected original lines and JSON fields with file identities and locators, plus reviewed research capture images. Do not import full run directories or complete logs. Inspect every image for personal data and metadata. Label QEMU reference captures separately from physical photographs; never fabricate missing observations. Photograph crops must preserve decoded source pixels, with original digest, output digest and crop bounds retained. Captured Apple interface content retains its original rights.

A short instruction or register-layout example may explain a measured compatibility boundary. This does not authorize importing the native port, binary patch recipes or proprietary code.
