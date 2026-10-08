---
{
  "slug": "surface-memory",
  "title": "Three buffers that must not be confused",
  "description": "Graphics allocation, default-surface backing and active scanout solve different problems.",
  "section": "Graphics",
  "order": 13,
  "evidence": [
    "E15",
    "E16",
    "E37",
    "E38",
    "E41",
    "E44",
    "E50"
  ],
  "sources": [
    "S07"
  ],
  "related": [
    "mmu-and-caches",
    "graphics-stack",
    "presentation",
    "frame-retirement",
    "camera-preview"
  ],
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.

> **Dated record.** The baseline below describes the 29 September edition. The dated October update later in this chapter records subsequent accepted findings.

## The console concealed an allocation problem

The native console could paint into a valid framebuffer while original application drawing still faulted. The reason was that the tree advertised a separate legacy graphics pool at an unbacked physical address. A read-only task page-table walk connected the user drawing address to that physical target. [E15](/ios/evidence/E15/)

The distinction is important: a visible kernel console validates the console's allocation and route. It says little about the memory handed to an application by CoreSurface. The two may be entirely different regions with different permissions.

A controlled relocation preserved the graphics pool's size while placing it in backed RAM outside the general allocator's advertised range. The measured invalid write disappeared, but the captured final screen still did not establish a completed graphical boot. Closing one memory defect exposed later boundaries.

<figure class="research-figure">
<img src="/ios/figures/surface-ownership.svg" alt="Three ownership boundaries: Original graphics client. The bytes requested by the client.. Backed pages + valid mapping. Ownership and addressability both matter.. Display engine + panel. Presentation is a separate hardware result." width="440" height="568" loading="lazy" />
<figcaption>A conceptual ownership model. Mapping, backing and visible presentation require separate evidence.</figcaption>
</figure>

## Backing, permissions and aliasing failed separately

The next captured fault involved a user mapping of a surface without the expected write permission. The source descriptor's direction policy mattered to how the original framework exposed that memory. A narrowly changed binding let the observed drawing worker advance. That is different from the earlier unbacked-memory correction.

Another defect appeared when the default CoreSurface backing reused the scanout allocation. Presenting a different surface could overwrite the default source. Returning to the default then skipped a restoring copy, because the implementation treated it as already resident in scanout. [E15](/ios/evidence/E15/)

The corrected ownership model keeps the default surface separate and copies whichever source the original client selects. An A-to-B-to-A test is more revealing here than presenting A once: it checks whether A survived B's presentation.

## A minimal ownership diagram

| Allocation | Written by | Read by | Lifetime condition |
| --- | --- | --- | --- |
| Graphics pool | Original rendering clients | Surface consumers | Retained while its surfaces exist |
| Default surface backing | Original default-surface client | Presentation service | Preserved across other submissions |
| Active scanout | Presentation service | Display engine | Stable and visible while scanned |

The table describes roles rather than one universal allocation strategy. A production system can use page flips or other ownership transfers. The recorded native experiment uses a simpler copy route whose boundaries are inspectable.

## Validate the inspection route too

A source-memory claim depends on the observer. The earlier readBytes route could leave its diagnostic destination zero. Without a verified return count and a known-pattern control, that output did not establish that the selected surface was blank. The mapped-descriptor route later showed original-client content and its copied scanout. [E16](/ios/evidence/E16/)

A good graphics evidence packet therefore names the selected surface, its backing extent, the access method, the verified transfer length and the destination extent. A screenshot is valuable as an independent visible result, but should not replace the memory evidence when the question is about source ownership.

The broader lesson applies beyond graphics: two objects can expose the same physical storage while their clients believe they have independent lifetimes. Keeping ownership explicit prevents one apparently valid operation from destroying another subsystem's state.

## Read selection as a sequence of ownership changes

The mapped-capture run makes the ownership error concrete. At sequence 1, selected surface `0xc05a3700` shows the boot logo. At sequence 3, the selected surface changes to `0xc1050100` and supplies setup imagery, while the default surface still shows the logo. At sequence 5, `0xc05a3700` is selected again and now contains setup imagery. This is an A → B → A selection sequence, not evidence that one fixed allocation always represented the frame.

```text
sequence 1: A / boot logo
sequence 3: B / setup; default A still logo
sequence 5: A / setup
```

The [captured image and pointer table](/ios/evidence/E16/#surface-swaps) retain those pairings. These are capture-local kernel object addresses, not stable allocation identifiers across boots.

## Reviewed advance: camera-image retirement, 1 October 2026

The Camera path adds a new ownership boundary. A selected camera image remains retained until the renderer’s completion state permits release. In the measured baseline, two image-queue entries coexist with three display pages; repeated selection refreshes last use while page reuse advances completion. [E37](/ios/evidence/E37/)

An isolated ARM replay reproduces the resulting admission pressure. Larger capacity removes drops in selected modeled scenarios, but retaining every input surface can starve the producer. The candidate keeps one of six surfaces available while preserving retirement checks. Its physical comparison was still pending at the pinned revision. Synthetic throughput is not a measured phone improvement. [E38](/ios/evidence/E38/)


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

The 7E18 adapter has separate exact-build IOSurface fields and reserved native memory. Camera acquisition remains real 640 × 480 UYVY; stock preview/still destinations have their expected YUYV geometry and ownership. A 1600 × 1200 resampled still adds no captured detail. DMA ownership, source aliases and completion remain distinct from a plausible descriptor. [E41](/ios/evidence/E41/) [E44](/ios/evidence/E44/) [E50](/ios/evidence/E50/)
