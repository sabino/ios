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
    "E17",
    "E41",
    "E49",
    "E50",
    "E63"
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
  "updated": "2026-10-07"
}
---

> **Current edition.** The dated baseline below is retained. The [October 7 systems paper](/ios/paper/) and the update at the end of this chapter describe the newer 3.1.3 frontier.

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

## Follow one address through the recorded walk

The captured virtual address is `0x40000054`. Its short-descriptor walk records L1 `0x50989001`, L2 `0x5096a02e`, and a page base of `0x5096a000`. For the recorded 4 KiB page, the address decomposition is:

```text
page offset = 0x40000054 & 0x00000fff = 0x54
physical address = 0x5096a000 + 0x54 = 0x5096a054
```

This arithmetic explains the backing location; it does not independently validate access permissions, access-flag interpretation or cacheability. In the faulting capture, DFSR is 6. The control retains the same PTE and progresses without that fault. See the [descriptor walk and control](/ios/evidence/E04/#descriptor-walk), then compare the independent [physical marker photograph](/ios/evidence/E05/#physical-photo).


## Reviewed advance: 3.1.3 and the current frontier, 7 October 2026

A retained physical MMC2 control shows a late controller mapping timing out; a non-cacheable mapping advances to a separate unsupported NTSR readback check. That early result does not establish a mounted root. The current 7E18 memory reservation also verifies allocator frontier and loaded guards together. Display timing leaves cache policy unchanged, and idle elapsed cost is not evidence that a new cache policy has been accepted. [E41](/ios/evidence/E41/) [E49](/ios/evidence/E49/) [E50](/ios/evidence/E50/) [E63](/ios/evidence/E63/)
