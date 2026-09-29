---
{
  "slug": "mmu-and-caches",
  "title": "A valid address is not a valid access",
  "description": "Translation, permissions, memory attributes and cache visibility form one continuous contract.",
  "section": "Machine",
  "order": 6,
  "evidence": [
    "E04",
    "E05",
    "E15",
    "E17"
  ],
  "sources": [
    "S07",
    "S08"
  ],
  "related": [
    "cpu-compatibility",
    "surface-memory",
    "presentation"
  ],
  "updated": "2026-09-29"
}
---

## Follow the translation all the way down

An early diagnostic fault occurred at a virtual address whose descriptors led into backed RAM. That initially tempting observation did not explain the fault. On the A53, the active access-flag interpretation treated a bit in the legacy page-table entry differently. A matched control retained the descriptors and corrected their interpretation; the commpage read then succeeded. [E04](/ios/evidence/E04/)

The bounded run continued for 40.12 seconds without the measured synchronous fault. It did not prove complete virtual-memory correctness, full boot, or equivalent physical behavior. Its value is the causal isolation: changing one interpretation changed the result while the mapped memory remained the same.

A useful fault record therefore includes more than the virtual address. It needs the active translation context, relevant descriptors, fault class, access direction, privilege, expected physical target and confirmation that the target is actually backed.

## Memory attributes affect devices

A framebuffer is ordinary memory to some CPU code and an asynchronously consumed buffer to the display engine. The CPU may finish writing while the device still sees old data. Visibility depends on the mapping and coherency contract; reaching a synchronization instruction does not magically validate an incorrectly described region.

The physical panel trial used a Device mapping for the active scanout and ordered presentation writes. The initializer cleaned its earlier framebuffer contents before the handoff. That design made cache visibility a stated part of the experiment instead of assuming that a QEMU copy test covered it. [E17](/ios/evidence/E17/)

Likewise, the physical VM progress probe showed that a native A53 range-clean adaptation permitted return from an original mapping routine. The result concerns that measured transition. It does not establish every cache operation or every later device interaction. [E05](/ios/evidence/E05/)

## Keep three memory questions separate

| Question | Typical misleading shortcut | Required evidence |
| --- | --- | --- |
| Is the region backed? | “The address looks like RAM.” | Confirmed allocation and bounds |
| Can this client access it? | “The kernel can read it.” | Correct task mapping and permissions |
| Can the consumer see the update? | “The copy returned.” | Valid coherency and ordering contract |

Graphics research encountered all three. A legacy graphics pool pointed into an unbacked physical region. A later surface mapping lacked the expected user-write permissions. The default source then aliased the live scanout, so presenting another surface destroyed the original source. These were distinct failures with different controls. [E15](/ios/evidence/E15/)

## Ownership is part of correctness

The panel buffer, source surfaces, graphics pool, bootstrap tables and ordinary allocator need separate ownership rules. An overlap checker can reject impossible layouts before execution; it cannot establish that a live DMA engine has stopped using a region. Releasing or reusing memory requires knowledge of the consumer's lifetime.

This is why the atlas follows a pixel through allocation, task mapping, client writes, descriptor access, presentation and device scanout. Each step can be individually plausible while the complete route is broken. Preserving the boundaries makes later failures diagnosable.
