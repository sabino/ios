---
{
  "slug": "surface-memory",
  "title": "Three buffers that must not be confused",
  "description": "Graphics allocation, default-surface backing and active scanout solve different problems.",
  "section": "Graphics",
  "order": 13,
  "evidence": [
    "E15",
    "E16"
  ],
  "sources": [
    "S07"
  ],
  "related": [
    "mmu-and-caches",
    "graphics-stack",
    "presentation"
  ],
  "updated": "2026-09-29"
}
---

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
