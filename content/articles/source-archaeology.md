---
{
  "slug": "source-archaeology",
  "title": "Nearby source is a reference, not the missing kernel",
  "description": "Version identity, provenance and measured interfaces constrain what public source can tell us.",
  "section": "Foundations",
  "order": 23,
  "evidence": [
    "E01",
    "E10",
    "E27"
  ],
  "sources": [
    "S03",
    "S04",
    "S05",
    "S16"
  ],
  "related": [
    "orientation",
    "storage-abi",
    "preservation-method"
  ],
  "updated": "2026-09-29"
}
---

## Begin with the target's own identity

The inspected software identifies itself as iPhone OS 1.1.4, build 4A102. The kernel reports a 933-era ARM XNU build. That identity should remain fixed while comparing public source. Similar Darwin version strings or nearby desktop releases do not make another tree the source of this binary. [E01](/ios/evidence/E01/) [E27](/ios/evidence/E27/)

The source survey examined official distribution metadata, tags and relevant implementation directories. No matching public XNU 933 ARM implementation was found in that inspected set. The result is deliberately scoped: it is a survey of named repositories and revisions, not proof that no historical archive could exist anywhere.

## Three useful references with different roles

| Reference | What it can help explain | What it does not establish |
| --- | --- | --- |
| Nearby Apple desktop XNU | Common Mach, BSD and IOKit concepts and interface changes | The target ARM machine layer |
| Later community ARM XNU | Shape of ARM platform initialization and board code | 4A102 ABI or userspace compatibility |
| Contemporaneous family source | Class matching and subsystem design | Exact embedded method layout and calling convention |

The inspected darwin-on-arm tree contains relevant ARM platform material, but it is a later kernel family. Replacing the running target with it would create a new compatibility project, not automatically finish the current port.

Likewise, a source header can describe a newer overload than the one called by the embedded target. That is why the storage completion work measured the exact boundary and tested it with independent receivers. [E10](/ios/evidence/E10/)

## Symbols are aids, not recovered declarations

Names from a binary can make the investigation understandable. A decompiler can suggest object structure and control flow. Those tools still require checks against instruction bytes, call sites and runtime objects. An inferred signature may be wrong even when its name is correct.

The preservation record should distinguish a published source declaration, a binary observation, an inferred role and a tested interface. Merging those categories into an apparently authoritative reconstructed header makes later mistakes hard to locate.

## Reuse also has a provenance boundary

Public availability is not a single license. Apple source archives, Linux drivers, firmware projects and community experiments carry their own terms. This atlas links to those works and summarizes the concepts relevant to the research. Its MIT license covers the original publication material and website; it does not relicense the referenced source or Apple software.

The same distinction applies to upstream demonstrations. An author's successful emulator boot is an upstream report until independently reproduced under a recorded local configuration. The project's own reference reproduction has a separate evidence identity.

## A durable research practice

Pin the source revision, record what was inspected, identify the question it answered and state what remains unverified. A negative finding should include its search scope. An interface inference should have a path to a discriminating test.

This approach keeps source archaeology productive without allowing familiar code to substitute for the actual legacy system under study. It also makes the publication maintainable: a newly found source tree can extend or revise a specific survey result instead of forcing readers to reinterpret every earlier claim.
