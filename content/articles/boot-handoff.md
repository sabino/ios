---
{
  "slug": "boot-handoff",
  "title": "The bootloader hands over a state, not a file",
  "description": "Registers, memory ownership and runtime metadata define the boundary at kernel entry.",
  "section": "Machine",
  "order": 3,
  "evidence": [
    "E02",
    "E03",
    "E05"
  ],
  "sources": [
    "S07",
    "S08",
    "S15"
  ],
  "related": [
    "device-tree",
    "mmu-and-caches",
    "three-machines"
  ],
  "updated": "2026-09-29"
}
---

## A declared entry point is incomplete

A Mach-O entry command names where execution begins. It does not describe a complete machine state. The inspected kernel's entry metadata contains zero values for registers that its first instructions immediately depend on. In particular, the bootstrap reads through its incoming boot-argument pointer and performs privileged operations. Treating the file's zero register values as a runnable handoff would confuse metadata with runtime state. [E03](/ios/evidence/E03/)

The research first inspected that entry statically, then captured the working iPod reference immediately before its kernel's first instruction. The live observation confirmed roles for the virtual base, physical base, memory span and initial translation-table area. The capture also supplied execution state and control-register context.

This pairing matters. Static analysis explains how values are used; a live capture establishes what a real loader supplied in one successful reference run. Neither alone proves that all possible bootloader configurations use an identical structure.

## Preserve ownership across the transition

The kernel starts allocating and clearing memory before its ordinary services exist. Its initial tables, bootstrap stack, loaded segments, boot arguments and device tree must remain mutually consistent. A relocation can preserve every kernel byte while breaking the handoff through an overlapping tree or an incorrect physical-to-virtual relationship.

A useful abstract inventory is:

| Region | Owner at handoff | Preservation requirement |
| --- | --- | --- |
| Kernel segments | Loader, then XNU | Correct placement and declared extent |
| Boot arguments and tree | Loader, then early platform code | Valid pointers and complete lifetimes |
| Initial translation tables | Bootstrap | Reserved space for observed writes |
| Panel scanout | Display initializer, then presentation service | Excluded from allocators until ownership transfers |
| Firmware/runtime reservations | Platform firmware | No accidental reuse by XNU or adapters |

The publication omits a flashable layout. These are ownership obligations, not a universal address recipe.

## Entering the next function is a narrow result

With captured reference state and relocated metadata, the unchanged kernel entered its bootstrap and reached arm_init on the partial PinePhone QEMU machine. It then encountered an ARM1176-specific peripheral remap register absent from the A53 model. An exception during the original exception path followed. The first fault, not the later secondary abort, defined the immediate compatibility question. [E03](/ios/evidence/E03/)

This experiment illustrates why a diagnostic should state both its success and its stopping point. “The entry contract is sufficient to reach arm_init” is useful. “The OS boots” would discard the measured failure.

## Physical handoff adds a second memory consumer

On the real phone, a display initializer had already configured the panel before XNU took control. The scanout buffer had to survive memory initialization and cache transitions. Physical progress markers later established return from a mapping routine after an A53 range-clean adaptation. That result belongs to the memory-transition boundary and does not retroactively prove every earlier boot stage. [E05](/ios/evidence/E05/)

The transferable lesson is to capture and validate the complete handoff contract: state, ownership, lifetime and provenance. A correct entry address is only one field in that contract.
