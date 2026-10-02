---
{
  "slug": "preservation-method",
  "title": "Preserve the chain of evidence",
  "description": "A research atlas should let a future reader distinguish the measurement from the story around it.",
  "section": "Method",
  "order": 24,
  "evidence": [
    "E13",
    "E16",
    "E20",
    "E24",
    "E27",
    "E34",
    "E36",
    "E38",
    "E39"
  ],
  "sources": [
    "S18"
  ],
  "related": [
    "orientation",
    "observability",
    "source-archaeology",
    "camera-stills",
    "measuring-performance"
  ],
  "updated": "2026-10-01"
}
---

> **Dated record.** The baseline below describes the 29 September edition. The dated October update later in this chapter records subsequent accepted findings.

## Treat a claim as structured data

A useful preservation claim includes the software/build identity, execution environment, method, observation and limitation. Its identity changes when any of those changes. “Buttons work” is too broad; “three short physical Power taps produced three guest edge pairs and the observed setup/black/setup sequence” is inspectable. [E20](/ios/evidence/E20/)

This atlas stores evidence records separately from explanatory articles. Articles can connect several records without silently changing their scopes. The concept map and guided tours are generated from the same article relationships, while the evidence pages show where each reported result is used.

The organizational inspiration is Understand-Anything's linked knowledge and guided exploration. The publication adapts those ideas to concepts and claims rather than exposing a function-by-function graph of the implementation repository.

## Separate observation from interpretation

The missing BOOT_TIME experiment observed comparable later milestones with different console output. The interpretation that a logging-route race explains the difference is plausible, but the route was not directly traced. Both statements belong in the record, with different confidence. [E24](/ios/evidence/E24/)

The empty-framebuffer case similarly requires a correction history. The early probe output did not validate source content; the known-pattern and mapped-descriptor control changed the interpretation. Removing the old hypothesis entirely would lose the reason the improved measurement matters. [E16](/ios/evidence/E16/)

A useful correction entry follows: earlier belief, discriminating observation, replacement statement, remaining limit. “We were wrong” is less useful than naming exactly which inference exceeded the data.

## Make acceptance falsifiable

A clean storage gate can specify an unchanged root hash, a complete data copy, a read-only consistency check, no recorded request failures and observed recovery return. Those postconditions can fail independently. The two consecutive physical trials passed that stated gate, while leaving the unexercised overflow path and power-loss behavior open. [E13](/ios/evidence/E13/)

An acceptance marker should never be renamed to imply a larger milestone. A synthetic CPU or pixel test remains synthetic even when it is a necessary prerequisite for original-client work.

## Publish useful evidence without distributing the experiment

This repository contains original prose, diagrams, captured measurement tables, selected source excerpts, reviewed capture images and document digests. It does not include the source implementation repository, raw firmware, storage images, binary modifications, complete private logs, device identifiers or session conversations.

That boundary imposes an honest limitation: the public package is not a complete reproducibility archive. A digest identifies the reviewed private document if an authorized reviewer later obtains it; the digest alone cannot independently verify its contents. Public primary references corroborate architecture and source context, while the local experiment summaries remain reported observations.

## Keep editions stable

The first edition has a fixed source revision and date. In-progress work after that boundary is not silently promoted into the published frontier. A later result should add a reviewed evidence record, revise affected articles and note which earlier conclusion it supersedes.

The original source survey is a good example: “not found in these inspected releases” can be updated if new material appears, without pretending the earlier scoped observation was universal. [E27](/ios/evidence/E27/)

Preservation succeeds when the next researcher inherits both the useful result and the information needed to question it. A polished presentation should make that discipline easier to follow, not smooth away the uncertainty.

## Reviewed advance: preserve the unsuccessful boundary, 1 October 2026

The camera sequence supplies another reason to retain intermediate failures. A very dark first DMA frame proved capture but not useful exposure. Later app-visible preview and post-reboot JPEG persistence closed different boundaries. The saved-photo record retains the first image’s transient black display even though both files reopened after reboot. [E34](/ios/evidence/E34/) [E36](/ios/evidence/E36/)

Performance evidence also resists a single success label. An isolated queue replay is synthetic even when it executes original ARM bookkeeping. A physical atomic-hotspot fix can remove nearly all measured trap overhead without producing a consistent UI timing improvement. Naming those limits makes the accepted findings more useful. [E38](/ios/evidence/E38/) [E39](/ios/evidence/E39/)
